import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminCookie, isAdmin, ADMIN_COOKIE } from "@/lib/auth";
import { getStats } from "@/lib/stats";
const log = async (action: string, target: string) => {
  try {
    await prisma.adminLog.create({ data: { action, target } });
  } catch {}
};
export async function POST(req: Request) {
  const b = await req.json();
  if (b.action === "login") {
    if (
      !process.env.ADMIN_PASSWORD ||
      b.password !== process.env.ADMIN_PASSWORD
    )
      return NextResponse.json(
        { error: "Mot de passe incorrect." },
        { status: 401 },
      );
    const r = NextResponse.json({ ok: true });
    r.cookies.set(adminCookie());
    return r;
  }
  if (!isAdmin())
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  if (b.action === "logout") {
    const r = NextResponse.json({ ok: true });
    r.cookies.delete(ADMIN_COOKIE);
    return r;
  }
  try {
    if (b.action === "status") {
      const data: any = {
        status: b.status,
        reviewedAt: new Date(),
        rejectionReason:
          b.status === "REJECTED" ? String(b.reason || "").slice(0, 500) : null,
      };
      const app = await prisma.app.update({ where: { id: b.id }, data });
      await log(
        b.status === "APPROVED" ? "APP_APPROVED" : "APP_REJECTED",
        b.id,
      );
      return NextResponse.json(app);
    }
    if (b.action === "accountStatus") {
      const status = ["PENDING", "APPROVED", "REJECTED"].includes(b.status) ? b.status : "PENDING";
      const user = await prisma.user.update({ where: { id: b.id }, data: { accountStatus: status } });
      await prisma.announcement.create({ data: { title: status === "APPROVED" ? "Compte validé" : status === "REJECTED" ? "Compte refusé" : "Compte en attente", text: status === "APPROVED" ? "Votre compte développeur a été validé par l’équipe." : status === "REJECTED" ? `Votre compte développeur a été refusé${b.reason ? ` : ${String(b.reason).slice(0, 300)}` : "."}` : "Votre compte développeur est en cours de validation." } });
      await log("ACCOUNT_" + status, b.id);
      return NextResponse.json(user);
    }
    if (b.action === "suspend") {
      const user = await prisma.user.update({
        where: { id: b.id },
        data: { suspendedAt: b.value ? new Date() : null },
      });
      await log(b.value ? "USER_SUSPENDED" : "USER_REACTIVATED", b.id);
      return NextResponse.json(user);
    }
    if (b.action === "report") {
      const report = await prisma.report.update({
        where: { id: b.id },
        data: { status: b.status || "TREATED" },
      });
      await log("REPORT_" + (b.status || "TREATED"), b.id);
      return NextResponse.json(report);
    }
    if (b.action === "hide") {
      const app = await prisma.app.update({
        where: { id: b.id },
        data: { hiddenAt: b.value ? new Date() : null },
      });
      await log(b.value ? "APP_HIDDEN" : "APP_UNHIDDEN", b.id);
      return NextResponse.json(app);
    }
    if (b.action === "announcement")
      return NextResponse.json(
        await prisma.announcement.create({
          data: {
            title: String(b.title || "")
              .trim()
              .slice(0, 120),
            text: String(b.text || "")
              .trim()
              .slice(0, 1000),
          },
        }),
      );
    if (b.action === "guide")
      return NextResponse.json(
        await prisma.guide.create({
          data: {
            title: String(b.title || "")
              .trim()
              .slice(0, 160),
            excerpt: String(b.excerpt || "")
              .trim()
              .slice(0, 300),
            content: String(b.content || "")
              .trim()
              .slice(0, 5000),
            category: String(b.category || "Tutoriel")
              .trim()
              .slice(0, 60),
          },
        }),
      );
    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Action impossible." }, { status: 400 });
  }
}
export async function GET() {
  if (!isAdmin())
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const [
    apps,
    users,
    reports,
    announcements,
    helpComments,
    guides,
    logs,
    likes,
  ] = await Promise.all([
    prisma.app.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reviews: true,
        _count: { select: { likes: true, reports: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { apps: true } } },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { app: true },
    }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.helpComment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.guide.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.appLike.count(),
  ]);
  const stats = await getStats(apps.map((a) => a.id));
  const summary = {
    published: apps.filter((a) => a.status === "APPROVED").length,
    pending: apps.filter((a) => a.status === "PENDING").length,
    rejected: apps.filter((a) => a.status === "REJECTED").length,
    developers: users.length,
    openReports: reports.filter((r) => r.status === "OPEN").length,
    likes,
    totalViews: Object.values(stats).reduce(
      (n: any, s: any) => n + s.views.total,
      0,
    ),
    totalOpens: Object.values(stats).reduce(
      (n: any, s: any) => n + s.opens.total,
      0,
    ),
  };
  return NextResponse.json({
    apps,
    users,
    reports,
    announcements,
    helpComments,
    guides,
    logs,
    summary,
  });
}
export async function DELETE(req: Request) {
  if (!isAdmin())
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const b = await req.json();
  if (b.reviewId) await prisma.review.delete({ where: { id: b.reviewId } });
  else if (b.id) {
    await prisma.app.delete({ where: { id: b.id } });
    await log("APP_DELETED", b.id);
  } else if (b.announcementId)
    await prisma.announcement.delete({ where: { id: b.announcementId } });
  else if (b.helpCommentId)
    await prisma.helpComment.delete({ where: { id: b.helpCommentId } });
  else if (b.guideId) await prisma.guide.delete({ where: { id: b.guideId } });
  return NextResponse.json({ ok: true });
}
