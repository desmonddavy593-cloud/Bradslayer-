import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
export async function POST(req: Request) {
  const b = await req.json();
  const appId = String(b.appId || "");
  const type = String(b.type || "");
  if (!appId || !["VIEW", "OPEN", "DOWNLOAD"].includes(type))
    return NextResponse.json({ error: "Événement invalide." }, { status: 400 });
  const app = await prisma.app.findFirst({
    where: { id: appId, status: "APPROVED" },
  });
  if (!app)
    return NextResponse.json({ error: "App introuvable." }, { status: 404 });
  const jar = cookies();
  let visitorId =
    jar.get("bradslayer_analytics_visitor")?.value || randomUUID();
  if (type === "VIEW") {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const duplicate = await prisma.appEvent.findFirst({
      where: { appId, type, visitorId, createdAt: { gte: since } },
    });
    if (duplicate) return NextResponse.json({ ok: true, deduped: true });
  }
  await prisma.appEvent.create({ data: { appId, type, visitorId } });
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
