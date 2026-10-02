'use client';
import {useEffect,useCallback,useState} from 'react';
import {ArrowUpRight,ShoppingBag,Headphones,Check} from 'lucide-react';
import {products} from '@/lib/catalog';
import {Bottle} from '@/components/africa/bottle';
import {Concierge} from '@/components/africa/concierge';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {NotesMotion} from '@/components/africa/notes-motion';
import {ScrollExperience,Sillage} from '@/app/scroll-experience';
import {Immersive} from '@/app/immersive';
import {Atmosphere} from '@/app/atmosphere';

/** Familles réelles du catalogue : Floral (2), Boisé (1), Ambré (3). */
const families=['Tout','Floral','Boisé','Ambré'];

export default function Home(){
 const [product,setProduct]=useState(products[0]);
 const [chat,setChat]=useState(false);
 const [detail,setDetail]=useState(false);
 const [bag,setBag]=useState(false);
 const [selection,setSelection]=useState<string[]>([]);
 const [filter,setFilter]=useState('Tout');
 const [still,setStill]=useState(false);
 useEffect(()=>{setStill(matchMedia('(prefers-reduced-motion: reduce)').matches)},[]);
 useEffect(()=>{document.documentElement.dataset.motion=still?'still':'full';const frame=requestAnimationFrame(()=>{const instance=window.ScrollCraft?.instances[0] as {layout?:()=>void}|undefined;instance?.layout?.()});return()=>cancelAnimationFrame(frame)},[still]);

 const show=useCallback((id:string,details=false)=>{const p=products.find(p=>p.id===id);if(!p)throw new Error('Parfum inconnu');setProduct(p);setDetail(details);document.getElementById('atelier')?.scrollIntoView({behavior:document.documentElement.dataset.motion==='still'?'instant':'smooth'});return p},[]);
 const act=useCallback((a:{action:string;productId:string|null})=>{if(a.action==='show_product'&&a.productId)show(a.productId);if(a.action==='open_details'&&a.productId)show(a.productId,true);if(a.action==='show_collection'){setFilter('Tout');document.getElementById('collection')?.scrollIntoView({behavior:document.documentElement.dataset.motion==='still'?'instant':'smooth'})}},[show]);

 // WebMCP : deux outils inchangés, aucune commande, aucun prix.
 useEffect(()=>{const context=(document as unknown as {modelContext?:{registerTool:(t:unknown,o:unknown)=>Promise<void>}}).modelContext;if(!context)return;const controller=new AbortController();const register=(tool:unknown)=>{try{Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{})}catch{}};register({name:'show_perfume',description:'Afficher un parfum du catalogue Africa Parfum. Ne crée aucune commande.',inputSchema:{type:'object',properties:{productId:{type:'string',enum:products.map(p=>p.id)}},required:['productId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:{productId:string})=>{if(!input||typeof input.productId!=='string')throw Error('Identifiant requis');const p=show(input.productId);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {productId:p.id,name:p.name,visible:true}}});register({name:'list_perfumes',description:'Lire les références réelles du catalogue, sans prix ni stock.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>products.map(({id,brand,name,family})=>({id,brand,name,family}))});return()=>controller.abort()},[show]);

 const add=(id:string)=>setSelection(s=>s.includes(id)?s:[...s,id]);
 const displayed=products.filter(p=>filter==='Tout'||p.family.toLowerCase().includes(filter.toLowerCase()));

 return <main className="ae-main">
 <ScrollExperience/>
 <Atmosphere/>
 <Immersive/>
  <header className="header"><a className="brand" href="#atelier">AFRICA<span>PARFUM</span></a><nav aria-label="Sommaire de la visite"><a href="#atelier">L’atelier</a><a href="#sillage">Le sillage</a><a href="#collection">Le catalogue</a><a href="#selection">Ma sélection</a></nav><button className="text-button" onClick={()=>setBag(true)}><ShoppingBag size={18}/> Ma sélection <span>{selection.length}</span></button></header>
  <div className="demo-bar">PARFUMERIE AFRICA <button className="motion-switch" aria-pressed={still} onClick={()=>setStill(s=>!s)}>{still?'Animations désactivées':'Réduire les animations'}</button></div>

  {/* Beat 1 — l'atelier : héro en profondeur, objet 1 déjà étiqueté. */}
  <section id="atelier" data-sc-act="pin" data-sc-span="1.5" className="ae-act ae-atelier">
   <div data-sc-stage className="ae-stage ae-stage--atelier">
    <div className="ae-planes" aria-hidden="true">
     <div className="ae-arch" data-sc-parallax="-1.15"/>
     <div className="ae-arch ae-arch--inner" data-sc-parallax="-0.55"/>
     <div className="ae-veil ae-veil--left" data-sc-parallax="1.15"/>
     <div className="ae-veil ae-veil--right" data-sc-parallax="0.6"/>
    </div>
    <div className="ae-hero-copy" data-sc-cue="0 1 0 0">
     <p className="sc-label">L’atelier · six maisons</p>
     <h1 className="ae-title">Votre parfum.<br/>Son empreinte.</h1>
     <p className="ae-lede">Découvrez les vrais flacons, leurs notes et composez votre sélection.</p>
     <div className="ae-hero-actions">
      <a className="primary" href="#collection"><ArrowUpRight size={18}/> Choisir un parfum</a>
      <button className="quiet-link ae-quiet" onClick={()=>setChat(true)}><Headphones size={17}/> Ouvrir Hermes</button>
     </div>
    </div>
    <div className="ae-subject" data-sc-parallax="-0.5">
     <Bottle product={product}/>
    </div>
    <div className="ae-hero-label" data-sc-cue="0 1 0 0">
     <span className="sc-label">{product.brand}</span>
     <h2 className="ae-subject-name">{product.name}</h2>
     <p className="ae-subject-meta">{product.family} · {product.notes.length} notes</p>
     <div className="ae-label-actions">
      <button className="ae-chip" onClick={()=>setDetail(true)}>Voir la fiche</button>
     </div>
    </div>
   </div>
  </section>

  {/* Beat 2 — le sillage : acte de pic, ruban bespoke + notes réelles. */}
  <section id="sillage" data-sc-act="pin" data-sc-span="2.1" className="ae-act ae-sillage-act">
   <div data-sc-stage className="ae-stage ae-stage--sillage">
    <div className="ae-planes" aria-hidden="true"><div className="ae-arch ae-arch--soft" data-sc-parallax="-0.9"/></div>
    <div className="ae-sillage-copy" data-sc-cue="0 1 0 0">
     <p className="sc-label">Le sillage du parfum actif</p>
     <h2 className="ae-h2">{product.brand} · {product.name}</h2>
     <p className="ae-subject-meta">{product.family}</p>
     <p className="ae-lede ae-lede--sm">{product.description}</p>
    </div>
    <Sillage product={product}/>
    <div className="ae-houses">
     <p className="sc-label">Prendre un autre flacon</p>
     <div className="ae-house-row">
      {products.map(p=><button key={p.id} aria-pressed={p.id===product.id} className={p.id===product.id?'ae-house is-active':'ae-house'} onClick={()=>setProduct(p)}>{p.brand}</button>)}
     </div>
    </div>
   </div>
  </section>

  {/* Beat 3 — le catalogue : flow, révélation en cascade, filtre réel. */}
  <section id="collection" data-sc-act="flow" className="ae-act ae-collection">
   <div className="sc-wrap">
    <div className="ae-collection-head" data-sc-in data-sc-stagger="60">
     <p className="sc-label">Le catalogue</p>
     <h2 className="ae-h2">Chaque flacon, ses notes.</h2>
     <p className="ae-lede ae-lede--sm">Six signatures, photographiées par leurs maisons. Découvrez chaque eau de parfum et ses notes.</p>
    </div>
    <div className="ae-filters" role="group" aria-label="Filtrer par famille">
     {families.map(f=><button key={f} aria-pressed={filter===f} className={filter===f?'ae-filter is-active':'ae-filter'} onClick={()=>setFilter(f)}>{f}</button>)}
    </div>
    <div className="ae-grid" data-sc-in>
     {displayed.map(p=><article key={p.id} className={p.id===product.id?'ae-card is-active':'ae-card'}>
      <button className="ae-card-main" onClick={()=>show(p.id)} aria-label={`Prendre ${p.name} de ${p.brand} comme parfum actif`}>
       <Bottle product={p} small/>
       <span className="sc-label">{p.brand}</span>
       <h3 className="ae-card-name">{p.name}</h3>
       <span className="ae-card-family">{p.family}</span>
      </button>
      <ul className="ae-card-notes">{p.notes.map(n=><li key={n}>{n}</li>)}</ul>
      <div className="ae-card-actions">
       <button className="ae-chip" onClick={()=>show(p.id,true)}>Fiche</button>
       <button className="ae-chip" onClick={()=>add(p.id)}>{selection.includes(p.id)?<><Check size={14}/> Retenu</>:'Ajouter'}</button>
      </div>
     </article>)}
    </div>
    <p className="ae-grid-note" data-sc-in>Votre sélection vous accompagne pendant cette visite.</p>
   </div>
  </section>

  {/* Beat 4 — la sélection : la plaque de fin, où le ruban se pose. */}
  <section id="selection" data-sc-act="flow" className="ae-act ae-selection-act">
   <div data-sc-stage className="ae-stage ae-stage--selection">
    <div className="ae-planes" aria-hidden="true"><div className="ae-arch ae-arch--final" data-sc-parallax="-0.7"/></div>
    <div className="ae-plate" data-sillage-target>
     <p className="sc-label">Fin de la visite · votre sélection</p>
     <h2 className="ae-h2">{selection.length===0?'Aucun flacon retenu pour l’instant.':'Ce que vous avez retenu.'}</h2>
     <p className="ae-plate-stamp">Dernière note posée par le ruban : <strong>{product.notes[product.notes.length-1]}</strong> ({product.name})</p>
     <ul className="ae-selection">
      {selection.length===0
       ?<li className="ae-selection-empty">Ajoutez un parfum depuis le catalogue pour le retrouver ici.</li>
       :selection.map(id=>{const p=products.find(x=>x.id===id)!;return <li key={id} className="ae-selection-item"><span className="sc-label">{p.brand}</span><strong>{p.name}</strong><span className="ae-card-family">{p.family}</span><button className="ae-chip" onClick={()=>setSelection(s=>s.filter(x=>x!==id))} aria-label={`Retirer ${p.name} de la sélection`}>Retirer</button></li>})}
     </ul>
     <div className="ae-close-actions">
      <button className="primary" onClick={()=>setChat(true)}><Headphones size={18}/> Ouvrir Hermes</button>
      <a className="quiet-link ae-quiet" href="#collection">Revenir au catalogue <ArrowUpRight size={17}/></a>
     </div>
     <p className="ae-close-note">Le conseiller Hermes sera disponible lorsque son service sera connecté. Les achats ne sont pas encore ouverts.</p>
    </div>
   </div>
  </section>

  <footer className="ae-footer"><a className="brand" href="#atelier">AFRICA<span>PARFUM</span></a><p>Parfumerie indépendante.<br/>Photographies des maisons. Achats indisponibles pour le moment.</p></footer>

  <Concierge open={chat} onOpen={setChat} currentProduct={product.id} onAction={act}/>
  <Sheet open={detail} onOpenChange={setDetail}><SheetContent className="detail-panel"><SheetTitle>{product.brand} · {product.name}</SheetTitle><SheetDescription>Eau de parfum · Africa Parfum</SheetDescription><Bottle product={product} small/><h3>{product.family}</h3><p>{product.description}</p><NotesMotion notes={product.notes}/><div className="note-tags">{product.notes.map(n=><span key={n}>{n}</span>)}</div><button className="primary selection-button" onClick={()=>add(product.id)}>{selection.includes(product.id)?<><Check size={18}/> Dans ma sélection</>:'Ajouter à ma sélection'}</button><p>Aucun achat : gardez vos découvertes pendant cette visite.</p><a className="detail-source" href={product.source} target="_blank" rel="noreferrer">Découvrir la fiche de la maison</a></SheetContent></Sheet>
  <Sheet open={bag} onOpenChange={setBag}><SheetContent className="detail-panel"><SheetTitle>Ma sélection</SheetTitle><SheetDescription>Vos parfums à découvrir, sans commande ni paiement.</SheetDescription>{selection.length===0?<p>Votre sélection est vide. Découvrez un parfum pour l’ajouter.</p>:selection.map(id=>{const p=products.find(p=>p.id===id)!;return <div key={id} className="selection-item"><div>{p.brand}<h3>{p.name}</h3></div><button onClick={()=>setSelection(s=>s.filter(x=>x!==id))} aria-label={`Retirer ${p.name}`}>Retirer</button></div>})}</SheetContent></Sheet>
 </main>
}

