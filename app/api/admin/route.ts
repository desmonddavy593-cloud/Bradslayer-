import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminCookie, isAdmin, ADMIN_COOKIE, ADMIN_PROFILE_COOKIE, adminProfileCookie, readAdminProfile } from "@/lib/auth";
import { getStats } from "@/lib/stats";
const log = async (action: string, target: string) => {
  try {
    await prisma.adminLog.create({ data: { action, target } });
  } catch {}
};
const personalAnnouncement = (recipientId:string,title:string,text:string) => prisma.announcement.create({data:{title,text,kind:"PERSONAL",recipientId}});
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
  if (b.action === "selectProfile") {
    if (!isAdmin()) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    const profile = await prisma.adminProfile.findUnique({ where: { id: String(b.id) } });
    if (!profile || !profile.active) return NextResponse.json({ error: "Profil indisponible." }, { status: 400 });
    const r = NextResponse.json(profile); r.cookies.set(adminProfileCookie(profile.id)); return r;
  }
  if (!isAdmin())
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  if (b.action === "logout") {
    const r = NextResponse.json({ ok: true });
    r.cookies.delete(ADMIN_COOKIE);
    r.cookies.delete(ADMIN_PROFILE_COOKIE);
    return r;
  }
  if (b.action === "presence") { const id=readAdminProfile(); if(id) await prisma.adminProfile.updateMany({where:{id,active:true},data:{lastSeenAt:new Date()}}); return NextResponse.json({ok:true}); }
  if (b.action === "profileLogout") { const id=readAdminProfile(); if(id) await prisma.adminProfile.updateMany({where:{id},data:{lastSeenAt:null}}); const r=NextResponse.json({ok:true}); r.cookies.delete(ADMIN_PROFILE_COOKIE); return r; }
  try {
    if (b.action === "official") { const value=Boolean(b.value); const result=b.kind==='user'?await prisma.user.update({where:{id:b.id},data:{isOfficial:value}}):await prisma.app.update({where:{id:b.id},data:{isOfficial:value}}); const recipient=b.kind==='user'?b.id:(result as any).developerId; if(recipient) await personalAnnouncement(recipient,value?'Badge officiel attribué':'Badge officiel retiré',value?'BradSlayer vous a attribué le badge Officiel.':'Le badge Officiel a été retiré.'); await log(value?'OFFICIAL_GRANTED':'OFFICIAL_REMOVED',b.id); return NextResponse.json(result); }
    if (b.action === "profile") { const data={displayName:String(b.displayName||'').trim().slice(0,80),avatar:b.avatar?String(b.avatar).slice(0,300000):null,title:String(b.title||'Support').slice(0,80),active:b.active!==false,doNotDisturb:Boolean(b.doNotDisturb)}; const profile=b.id?await prisma.adminProfile.update({where:{id:b.id},data}):await prisma.adminProfile.create({data}); return NextResponse.json(profile); }
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
      const before = await prisma.user.findUnique({ where: { id: b.id }, select: { accountStatus: true } });
      const user = await prisma.user.update({ where: { id: b.id }, data: { accountStatus: status, accountReason: status === "REJECTED" ? String(b.reason || "").slice(0, 500) || null : null } });
      if (before?.accountStatus !== status) await personalAnnouncement(b.id,status === "APPROVED" ? "Compte validé" : status === "REJECTED" ? "Compte refusé" : "Compte en attente",status === "APPROVED" ? "Votre compte développeur a été validé par l’équipe." : status === "REJECTED" ? `Votre compte développeur a été refusé${b.reason ? ` : ${String(b.reason).slice(0, 300)}` : "."}` : "Votre compte développeur est en cours de validation.");
      if (before?.accountStatus !== status) await log("ACCOUNT_" + status, b.id);
      return NextResponse.json(user);
    }
    if (b.action === "suspend") {
      const user = await prisma.user.update({
        where: { id: b.id },
        data: { suspendedAt: b.value ? new Date() : null },
      });
      await personalAnnouncement(b.id,b.value ? "Compte suspendu" : "Compte réactivé",b.value ? "Votre compte développeur a été suspendu par l’administration." : "Votre compte développeur a été réactivé.");
      await log(b.value ? "USER_SUSPENDED" : "USER_REACTIVATED", b.id);
      return NextResponse.json(user);
    }
    if (b.action === "contact") {
      const status = ["NEW", "READ", "DONE"].includes(b.status) ? b.status : undefined;
      const message = await prisma.contactMessage.update({ where: { id: b.id }, data: { ...(status ? { status } : {}), ...(b.reply !== undefined ? { adminReply: String(b.reply).slice(0, 1000), status: "READ" } : {}) }, include: { user: { select: { id: true, username: true } } } });
      if (b.reply !== undefined) await personalAnnouncement(message.user.id,"Réponse de l’administration",`Une réponse est disponible pour votre message « ${message.subject} ».`);
      await log("CONTACT_" + (b.reply !== undefined ? "REPLIED" : status || "UPDATED"), b.id);
      return NextResponse.json(message);
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
    contactMessages,
    announcements,
    helpComments,
    guides,
    logs,
    likes,
    profiles,
    notifications,
    unreadChat,
  ] = await Promise.all([
    prisma.app.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        reviews: true,
        _count: { select: { likes: true, reports: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { apps: true } } },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { app: true },
    }),
    prisma.contactMessage.findMany({ take: 20, orderBy: { createdAt: "desc" }, include: { user: { select: { username: true, email: true } } } }),
    prisma.announcement.findMany({ where: { kind: "PUBLIC", recipientId: null }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.helpComment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.guide.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.appLike.count(),
    prisma.adminProfile.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.chatMessage.count({ where: { sender: "USER", readAt: null } }),
  ]);
  const stats = await getStats(apps.map((a) => a.id));
  const summary = {
    published: apps.filter((a) => a.status === "APPROVED").length,
    pending: apps.filter((a) => a.status === "PENDING").length,
    rejected: apps.filter((a) => a.status === "REJECTED").length,
    developers: users.length,
    openReports: reports.filter((r) => r.status === "OPEN").length,
    pendingDevelopers: users.filter((u) => u.accountStatus === "PENDING").length,
    newMessages: contactMessages.filter((m) => m.status === "NEW").length,
    unreadNotifications: notifications.filter((n) => !n.readAt).length,
    unreadChat,
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
    contactMessages,
    announcements,
    helpComments,
    guides,
    logs,
    profiles,
    notifications,
    selectedProfile: readAdminProfile(),
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
