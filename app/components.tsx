import Link from "next/link";
export type StoreApp = {
  id: string;
  slug: string;
  name: string;
  developer: string;
  category: string;
  description: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  icon: string;
  iconUrl?: string | null;
  accent: string;
  rating: number;
  featured: boolean;
  trending: boolean;
  url: string;
  screenshots: string[];
  priceXof?: number | null;
  createdAt: Date;
  reviews?: any[];
  _count?: { likes?: number; reports?: number };
};
export function AppIcon({
  app,
  large = false,
}: {
  app: StoreApp;
  large?: boolean;
}) {
  return (
    <div
      className={`app-icon ${large ? "app-icon-large" : ""}`}
      style={{ background: `linear-gradient(135deg,${app.accent},#2b2050)` }}
    >
      {app.iconUrl ? <img src={app.iconUrl} alt="" /> : app.icon}
    </div>
  );
}
export function AppCard({ app }: { app: StoreApp }) {
  return (
    <Link href={`/app/${app.slug}`} className="app-card">
      <AppIcon app={app} />
      <div className="app-card-copy">
        <div className="eyebrow">{app.category}</div>
        <h3>{app.name}</h3>
        <p>{app.developer}</p>
        <span className="rating">★ {app.rating.toFixed(1)}</span>
      </div>
    </Link>
  );
}
export function AppRail({
  title,
  eyebrow,
  apps,
}: {
  title: string;
  eyebrow?: string;
  apps: StoreApp[];
}) {
  return (
    <section className="rail-section">
      <div className="section-heading">
        <div>
          {eyebrow && <span className="eyebrow gold">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        <Link href="/categories">
          Voir tout <span>→</span>
        </Link>
      </div>
      <div className="app-rail">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
}

export function BottomNav(){return <nav className="bottom-nav"><Link href="/">Accueil</Link><Link href="/categories">Apps</Link><Link href="/developers">Développer</Link><Link href="/account">Compte</Link></nav>}
