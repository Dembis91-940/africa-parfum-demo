
'use client';
import {useState,useEffect} from 'react';
import type {Product} from '@/lib/catalog';

/** Photographie du vrai produit, sans géométrie ni étiquette reconstruite. */
export function Bottle({product,small=false}:{product:Product;small?:boolean}){
 const [base,setBase]=useState<string|null>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{const url=new URL(document.baseURI);setBase(url.pathname.slice(0,url.pathname.lastIndexOf('/')+1))},[]);
 useEffect(()=>setFailed(false),[product.id]);
 return <div data-product={product.id} className={`bottle product-photo${small?' small':''}`}>
  <img key={product.id} src={base?`${base}${product.image}`:undefined} alt={`${product.brand} ${product.name}, eau de parfum. Photographie du flacon réel.`} loading={small?'lazy':'eager'} decoding="async" onError={()=>setFailed(true)} />
  {failed&&<p className="photo-error">La photographie ne peut pas être chargée. Consultez la fiche de la maison.</p>}
 </div>
}
