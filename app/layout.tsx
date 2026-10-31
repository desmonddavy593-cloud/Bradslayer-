import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = { title:'BradSlayer Store — Apps web qui font avancer', description:'Le catalogue PWA des communautés DevSlayer × Brad Society', manifest:'/manifest.webmanifest', icons:{ icon:'/icon.svg' } };
export default function RootLayout({ children }:{ children:React.ReactNode }) {
  return <html lang="fr"><body><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">BS</span><span><strong>BradSlayer</strong><small>DevSlayer × Brad Society</small></span></Link><nav><Link href="/categories">Catégories</Link><Link href="/about">À propos</Link><Link className="nav-admin" href="/admin">Admin</Link></nav></header><main>{children}</main><footer><div><strong>BradSlayer Store</strong><span>Des apps web choisies par la communauté.</span></div><div className="footer-links"><Link href="/about">À propos</Link><a href="mailto:hello@bradslayer.dev">Contact</a></div></footer><script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});`}} /></body></html>
}
