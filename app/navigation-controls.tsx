'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {BottomNav} from './components';

const STACK_KEY='bradslayer:navigation-stack';
const MAX_STACK=40;

function currentRoute(pathname:string){return pathname}

export default function NavigationControls(){
  const pathname=usePathname();
  const router=useRouter();
  const route=currentRoute(pathname);
  const [stack,setStack]=useState<string[]>([]);
  const navigating=useRef(false);

  useEffect(()=>{
    try{
      const saved=JSON.parse(sessionStorage.getItem(STACK_KEY)||'[]');
      const previous=Array.isArray(saved)?saved.filter((item):item is string=>typeof item==='string'):[];
      const next=previous[previous.length-1]===route?previous:[...previous,route].slice(-MAX_STACK);
      sessionStorage.setItem(STACK_KEY,JSON.stringify(next));
      setStack(next);
    }catch{
      setStack([route]);
    }
  },[route]);

  function goBack(){
    if(navigating.current)return;
    navigating.current=true;
    let previous='/';
    try{
      const saved=JSON.parse(sessionStorage.getItem(STACK_KEY)||'[]');
      const historyStack=Array.isArray(saved)?saved.filter((item):item is string=>typeof item==='string'):stack;
      if(historyStack.length>1){
        historyStack.pop();
        previous=historyStack[historyStack.length-1]||'/';
        sessionStorage.setItem(STACK_KEY,JSON.stringify(historyStack));
        setStack(historyStack);
      }else{
        sessionStorage.setItem(STACK_KEY,JSON.stringify(['/']));
        setStack(['/']);
      }
    }catch{
      previous='/';
    }
    router.replace(previous);
    window.setTimeout(()=>{navigating.current=false},350);
  }

  return <>{pathname!=='/'&&<button type="button" className="back-button" aria-label="Retour à la page précédente" onClick={goBack}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5m7 7-7-7 7-7"/></svg></button>}{pathname==='/'&&<BottomNav/>}</>;
}
