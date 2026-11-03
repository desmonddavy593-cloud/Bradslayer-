import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { notifyAdmin } from "@/lib/admin-notify";
const reasons = [
  "App cassée",
  "Contenu dangereux",
  "Arnaque ou fausse app",
  "Autre",
];
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.appId || !reasons.includes(b.reason))
    return NextResponse.json({ error: "Motif invalide." }, { status: 400 });
  const jar = cookies();
  const visitorId =
    jar.get("bradslayer_analytics_visitor")?.value || randomUUID();
  const app = await prisma.app.findFirst({
    where: { id: b.appId, status: "APPROVED" },
  });
  if (!app)
    return NextResponse.json({ error: "App introuvable." }, { status: 404 });
  const since = new Date(Date.now() - 86400000);
  const recent = await prisma.report.findFirst({
    where: { appId: b.appId, visitorId, createdAt: { gte: since } },
  });
  if (recent)
    return NextResponse.json(
      { error: "Un signalement a déjà été envoyé pour cette app aujourd’hui." },
      { status: 429 },
    );
  await prisma.report.create({
    data: {
      appId: b.appId,
      visitorId,
      reason: b.reason,
      message: String(b.message || "").slice(0, 500),
    },
  });
  await notifyAdmin("REPORT_NEW", "Nouveau signalement", `${app.name} : ${b.reason}`, "/admin/reports");
  const response = NextResponse.json({ ok: true });
  response.cookies.set("bradslayer_analytics_visitor", visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 31536000,
    path: "/",
  });
  return response;
}
