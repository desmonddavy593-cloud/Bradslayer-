'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DeveloperNav from '../developer/nav';import DeveloperStats from '../developer/page';

export default function Developers() {
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ username: '', email: '', password: '', community: 'Indépendant' });
  const [apps, setApps] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const d = await fetch('/api/auth').then((r) => r.json());
    setUser(d.user);
    if (d.user) {
      const r = await fetch('/api/developer/apps');
      setApps(r.ok ? await r.json() : []);
    }
  }
  useEffect(() => { void load(); }, []);

  async function submit(e: any) {
    e.preventDefault(); setMessage('');
    const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: mode, ...form }) });
    const d = await r.json();
    if (!r.ok) { setMessage(d.error || 'Impossible de continuer.'); return; }
    if (mode === 'register') { setMessage('Compte créé. Il sera activé après validation par l’équipe.'); setForm({ username: '', email: '', password: '', community: 'Indépendant' }); return; }
    await load();
  }
  async function logout() {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    setUser(null); setApps([]);
  }

  if (user) return <><DeveloperNav/><DeveloperStats/></>;

  return <div className="page-shell inner-page account-card"><div className="page-intro"><span className="eyebrow gold">DÉVELOPPEURS</span><h1>{mode === 'login' ? 'Content de vous revoir.' : 'Rejoignez le store.'}</h1><p>{mode === 'login' ? 'Connectez-vous à votre espace développeur.' : 'Créez votre compte en une seule étape.'}</p></div><div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>Connexion</button><button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setMessage(''); }}>Inscription</button></div><form className="admin-card" onSubmit={submit}><label>Pseudo<input required pattern="[A-Za-z0-9._-]{3,20}" minLength={3} maxLength={20} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>{mode === 'register' && <><label>E-mail<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Communauté <small className="help">Facultatif</small><select value={form.community} onChange={(e) => setForm({ ...form, community: e.target.value })}><option>Indépendant</option><option>DevSlayer</option><option>Brad Society</option></select></label></>}<label>Mot de passe<div className="password-field"><input type={show ? 'text' : 'password'} required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShow(!show)}>{show ? 'Masquer' : 'Afficher'}</button></div></label><button className="button">{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</button>{message && <span className={`message ${message.startsWith('Compte créé') ? 'success-message' : ''}`}>{message}</span>}</form></div>;
}
