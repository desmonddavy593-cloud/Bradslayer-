'use client';

import {useEffect} from 'react';

export default function DetailSheet({title,meta,children,onClose,actions}:{title:string;meta?:string;children:React.ReactNode;onClose:()=>void;actions?:React.ReactNode}){
  useEffect(()=>{
    const close=()=>onClose();
    window.history.pushState({bradslayerDetail:true},'');
    window.addEventListener('popstate',close);
    return()=>window.removeEventListener('popstate',close);
  },[onClose]);
  const close=()=>window.history.back();
  return <div className="detail-sheet-backdrop" onClick={close} role="presentation">
    <aside className="detail-sheet" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
      <div className="detail-sheet-handle"/>
      <header className="detail-sheet-header"><div><h2>{title}</h2>{meta&&<small>{meta}</small>}</div><button type="button" className="detail-sheet-close" onClick={close} aria-label="Fermer">×</button></header>
      <div className="detail-sheet-body">{children}</div>
      {actions&&<div className="detail-sheet-actions">{actions}</div>}
    </aside>
  </div>;
}
