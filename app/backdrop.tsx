'use client';
import {useState,useEffect} from 'react';

/**
 * Backdrop — le fond d'ambiance du site : une essence de parfum abstraite
 * (or liquide, volutes dorées sur velours vert sombre), fixe derrière tout le
 * contenu. Remplacé par une image générée sur mesure, pas un décor géométrique.
 */
export function Backdrop(){
  const [bg,setBg]=useState<string|null>(null);
  useEffect(()=>{
    const url=new URL(document.baseURI);
    const base=url.pathname.slice(0,url.pathname.lastIndexOf('/')+1);
    setBg(`${base}backdrop.jpg`);
  },[]);
  if(!bg) return null;
  return <div className="ae-backdrop" aria-hidden="true" style={{backgroundImage:`url(${bg})`}}/>;
}
