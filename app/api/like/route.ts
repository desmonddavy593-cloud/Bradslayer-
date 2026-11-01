import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
export async function POST(req: Request) {
  const { appId } = await req.json();
  if (!appId)
    return NextResponse.json({ error: "App invalide." }, { status: 400 });
  const jar = cookies();
  const visitorId =
    jar.get("bradslayer_analytics_visitor")?.value || randomUUID();
  const app = await prisma.app.findFirst({
    where: { id: appId, status: "APPROVED" },
  });
  if (!app)
    return NextResponse.json({ error: "App introuvable." }, { status: 404 });
  let liked = !!(await prisma.appLike.findUnique({
    where: { appId_visitorId: { appId, visitorId } },
  }));
  if (liked) {
    await prisma.appLike.delete({
      where: { appId_visitorId: { appId, visitorId } },
    });
    liked = false;
  } else {
    await prisma.appLike.create({ data: { appId, visitorId } });
    liked = true;
  }
  const count = await prisma.appLike.count({ where: { appId } });
  const response = NextResponse.json({ liked, count });
  response.cookies.set("bradslayer_analytics_visitor", visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 31536000,
    path: "/",
  });
  return response;
}
