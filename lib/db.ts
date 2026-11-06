import { PrismaClient } from "@prisma/client";
declare global {
  var prisma: PrismaClient | undefined;
}
export const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export const demoApps = [
  {
    id: "demo-kora",
    slug: "kora-notes",
    name: "Kora Notes",
    developer: "DevSlayer Labs",
    category: "Outils",
    description:
      "Un espace de notes rapide et élégant pour capturer vos idées, organiser vos projets et retrouver l’essentiel.",
    shortDescription: "Notes rapides pour idées et projets.",
    icon: "✦",
    accent: "#D4AF37",
    rating: 4.8,
    featured: true,
    trending: true,
    url: "https://example.com/kora-notes",
    screenshots: [
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=80",
    ],
    createdAt: new Date(),
  },
  {
    id: "demo-street",
    slug: "street-rush",
    name: "Street Rush",
    developer: "Brad Arcade",
    category: "Jeux",
    description:
      "Un jeu de course arcade nerveux. Évitez les obstacles, améliorez votre score et défiez vos amis.",
    icon: "⚡",
    accent: "#7B2FF7",
    rating: 4.6,
    featured: true,
    trending: true,
    url: "https://example.com/street-rush",
    screenshots: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    ],
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "demo-afri",
    slug: "afri-learn",
    name: "AfriLearn",
    developer: "Brad Society",
    category: "Éducation",
    description:
      "Des mini-cours accessibles pour apprendre, réviser et progresser depuis votre téléphone.",
    icon: "◈",
    accent: "#26C281",
    rating: 4.9,
    featured: true,
    trending: false,
    url: "https://example.com/afri-learn",
    screenshots: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    ],
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: "demo-nkap",
    slug: "nkap-wallet",
    name: "Nkap Wallet",
    developer: "Nkap Studio",
    category: "Finance",
    description: "Visualisez vos objectifs et suivez vos dépenses.",
    icon: "₣",
    accent: "#D4AF37",
    rating: 4.5,
    featured: false,
    trending: true,
    url: "https://example.com/nkap-wallet",
    screenshots: [],
    createdAt: new Date(Date.now() - 259200000),
  },
  {
    id: "demo-babi",
    slug: "go-babi",
    name: "Go Babi",
    developer: "DevSlayer Mobility",
    category: "Transport",
    description: "Trouvez les trajets et points de mobilité autour de vous.",
    icon: "➤",
    accent: "#F97316",
    rating: 4.4,
    featured: false,
    trending: true,
    url: "https://example.com/go-babi",
    screenshots: [],
    createdAt: new Date(Date.now() - 345600000),
  },
  {
    id: "demo-pulse",
    slug: "pulse-africa",
    name: "Pulse Africa",
    developer: "Pulse Collective",
    category: "Actualités",
    description:
      "Une veille claire et locale pour suivre les sujets qui comptent.",
    icon: "●",
    accent: "#EF4444",
    rating: 4.7,
    featured: false,
    trending: false,
    url: "https://example.com/pulse-africa",
    screenshots: [],
    createdAt: new Date(Date.now() - 432000000),
  },
  {
    id: "demo-connect",
    slug: "brad-connect",
    name: "Brad Connect",
    developer: "Brad Society",
    category: "Communauté",
    description: "Le point de rencontre des créateurs et développeurs.",
    icon: "⌁",
    accent: "#7B2FF7",
    rating: 4.8,
    featured: true,
    trending: true,
    url: "https://example.com/brad-connect",
    screenshots: [],
    createdAt: new Date(Date.now() - 518400000),
  },
  {
    id: "demo-focus",
    slug: "focus-flow",
    name: "Focus Flow",
    developer: "DevSlayer Labs",
    category: "Outils",
    description: "Un minuteur de concentration minimaliste.",
    icon: "◒",
    accent: "#06B6D4",
    rating: 4.3,
    featured: false,
    trending: false,
    url: "https://example.com/focus-flow",
    screenshots: [],
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: "demo-sika",
    slug: "sika-basket",
    name: "Sika Basket",
    developer: "Sika Studio",
    category: "Finance",
    description:
      "Comparez vos habitudes d’achat et construisez un budget simple.",
    icon: "◆",
    accent: "#22C55E",
    rating: 4.2,
    featured: false,
    trending: false,
    url: "https://example.com/sika-basket",
    screenshots: [],
    createdAt: new Date(Date.now() - 691200000),
  },
];

export async function getApps() {
  try {
    return await prisma.app.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return demoApps;
  }
}
export async function getApp(slug: string) {
  try {
    return await prisma.app.findFirst({
      where: { slug, status: "APPROVED" },
      include: {
        reviews: { orderBy: { createdAt: "desc" } },
        _count: { select: { likes: true, events: { where: { type: "DOWNLOAD" } } } },
      },
    });
  } catch {
    return demoApps.find((app) => app.slug === slug) ?? null;
  }
}
