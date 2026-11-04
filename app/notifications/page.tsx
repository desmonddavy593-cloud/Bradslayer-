'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import DetailSheet from '@/app/components/detail-sheet';

export default function Notifications(){
 const [items,setItems]=useState<any[]>([]),[message,setMessage]=useState(''),[selected,setSelected]=useState<any>(null);
 const load=useCallback(()=>fetch('/api/announcements').then(r=>r.json()).then(d=>setItems(d.announcements||[])),[]);
 useEffect(()=>{void load()},[load]);
 async function read(id?:string){const r=await fetch('/api/announcements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(id?{id}:{all:true})});if(r.ok){setMessage('Notifications mises à jour.');await load()}}
 const open=(item:any)=>{setSelected(item);if(!item.read)void read(item.id)};
 return <div className="page-shell inner-page notification-page"><Link href="/" className="detail-back">← Accueil</Link><div className="page-intro"><span className="eyebrow gold">BRADSLAYER</span><h1>Notifications et offres</h1><p>Les annonces publiées par l’administration apparaissent ici.</p></div><button className="secondary-button" onClick={()=>read()}>Tout marquer comme lu</button>{message&&<span className="message">{message}</span>}<div className="notification-list">{items.length?items.map(a=><article className={`announcement ${a.read?'read':''}`} key={a.id} onClick={()=>open(a)}><div className="announcement-icon">✦</div><div><strong>{!a.read&&<i className="unread-dot"/>}{a.title}</strong><small>{new Date(a.createdAt).toLocaleString('fr-FR')}</small><p>{a.text}</p>{!a.read&&<button onClick={e=>{e.stopPropagation();void read(a.id)}}>Marquer comme lu</button>}</div></article>):<div className="empty-card">Aucune annonce pour le moment.</div>}</div>{selected&&<DetailSheet title={selected.title} meta={new Date(selected.createdAt).toLocaleString('fr-FR')} onClose={()=>setSelected(null)} actions={!selected.read&&<button className="secondary-button" onClick={()=>read(selected.id)}>Marquer comme lu</button>}><span className="detail-label">Message complet</span><span className="detail-value">{selected.text}</span></DetailSheet>}</div>
}
