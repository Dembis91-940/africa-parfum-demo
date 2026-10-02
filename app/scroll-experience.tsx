'use client';

/**
 * scroll-experience.tsx — pont React ⇄ moteur scrollcraft (Africa Parfum)
 *
 * 1. <ScrollExperience/> charge public/scrollcraft/scrollcraft.js (copie
 *    byte-identique de engine/scrollcraft.js, sha256 9246fbe4…) puis appelle
 *    ScrollCraft.mount(document.body) UNE seule fois, après le montage React.
 *    Garde StrictMode : un module flag + le compteur d'instances du moteur.
 *    Jamais de nouveau mount au changement de parfum actif ou de filtre.
 *
 * 2. <Sillage/> est la signature du site : le ruban de sillage du parfum
 *    ACTIF. Ses nœuds sont les notes RÉELLES du catalogue (lib/catalog.ts),
 *    il se dessine sur --sc-p publié par l'acte #sillage, et il se pose dans
 *    la sélection (#selection) quand la trace est complète.
 *
 * Le moteur n'est jamais modifié : toute la mécanique bespoke vit ici.
 * Sans moteur (ou sans JS) la trace et la liste des notes restent lisibles :
 * l'état par défaut de la page est le contenu, pas l'animation.
 */

import {useEffect,useMemo,useRef} from 'react';
import type {Product} from '@/lib/catalog';

type ScrollCraftApi = { mount: (root?: unknown, opts?: unknown) => unknown; instances: unknown[] };

declare global {
  interface Window { ScrollCraft?: ScrollCraftApi }
}

let enginePromise: Promise<ScrollCraftApi | null> | null = null;
let engineMounted = false;

/** URL du moteur, correcte en local (/) comme sous le base path GitHub (/africa-parfum-demo/). */
function engineSrc(file: string): string {
  const url = new URL(document.baseURI);
  let dir = url.pathname;
  if (!dir.endsWith('/')) dir = dir.slice(0, dir.lastIndexOf('/') + 1);
  return url.origin + dir + 'scrollcraft/' + file;
}

function loadEngine(): Promise<ScrollCraftApi | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.ScrollCraft) return Promise.resolve(window.ScrollCraft);
  if (enginePromise) return enginePromise;
  enginePromise = new Promise(resolve => {
    const script = document.createElement('script');
    script.src = engineSrc('scrollcraft.js');
    script.async = true;
    script.dataset.scrollcraftEngine = 'true';
    script.onload = () => resolve(window.ScrollCraft ?? null);
    script.onerror = () => { enginePromise = null; resolve(null); };
    document.head.appendChild(script);
  });
  return enginePromise;
}

/** Monte le moteur une seule fois. Rien à démonter : il n'est monté qu'ici. */
export function ScrollExperience() {
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let frame = 0;
    const observeLayout = (api: ScrollCraftApi) => {
      const catalog = document.getElementById('collection');
      if (!catalog) return;
      let lastHeight = -1;
      observer = new ResizeObserver(entries => {
        const height = Math.round(entries[0].contentRect.height);
        if (height === lastHeight) return;
        lastHeight = height;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const instance = api.instances[0] as {layout?:()=>void}|undefined;
          instance?.layout?.();
        });
      });
      observer.observe(catalog);
    };
    void loadEngine().then(api => {
      if (cancelled) return;
      const root = document.documentElement;
      if (!api) { root.dataset.scrollcraft = 'fallback'; return; }
      if (engineMounted || (Array.isArray(api.instances) && api.instances.length > 0)) {
        root.dataset.scrollcraft = 'mounted';
        observeLayout(api);
        return;
      }
      try {
        api.mount(document.body);
        engineMounted = true;
        root.dataset.scrollcraft = 'mounted';
        observeLayout(api);
        if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'instant'});
      } catch {
        root.dataset.scrollcraft = 'fallback';
      }
    });
    return () => { cancelled = true; observer?.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return null;
}

/* --------------------------------------------------------------- géométrie --
   Ruban de sillage : une courbe de Catmull-Rom échantillonnée en polyligne
   dense, donc entièrement calculable sans DOM (rendu serveur, sans JS et sous
   préférence de mouvement réduit donnent la même géométrie). */

const ANCHORS: [number, number][] = [
  [26, 432], [84, 372], [140, 318], [214, 272],
  [300, 224], [386, 166], [462, 110], [556, 58],
];

function sampleCurve(anchors: [number, number][], per = 24): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const p0 = anchors[i - 1] ?? anchors[i];
    const p1 = anchors[i];
    const p2 = anchors[i + 1];
    const p3 = anchors[i + 2] ?? anchors[i + 1];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let s = 0; s < per; s++) {
      const t = s / per, u = 1 - t;
      out.push([
        u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
        u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1],
      ]);
    }
  }
  out.push(anchors[anchors.length - 1]);
  return out;
}

function cumulative(points: [number, number][]): number[] {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return cum;
}

function pointAt(points: [number, number][], cum: number[], t: number): [number, number] {
  const total = cum[cum.length - 1] || 1;
  const target = Math.min(1, Math.max(0, t)) * total;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < target) i++;
  const span = cum[i] - cum[i - 1] || 1;
  const f = (target - cum[i - 1]) / span;
  return [
    points[i - 1][0] + (points[i][0] - points[i - 1][0]) * f,
    points[i - 1][1] + (points[i][1] - points[i - 1][1]) * f,
  ];
}

const ROUND = (v: number) => Math.round(v * 10) / 10;

/** Le ruban : trace qui s'assemble, nœuds = notes réelles, marqueur qui voyage. */
export function Sillage({ product }: { product: Product }) {
  const wrap = useRef<HTMLDivElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const marker = useRef<SVGGElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  const notes = product.notes;
  const geom = useMemo(() => {
    const variant = product.notes.length;
    const tone = Array.from(product.id).reduce((sum,c)=>sum+c.charCodeAt(0),0)%11;
    const anchors = ANCHORS.map(([x,y],i)=>[x, y + Math.sin(i*1.5+tone*.12)*(variant-1)*12] as [number,number]);
    const points = sampleCurve(anchors);
    const cum = cumulative(points);
    return {
      d: 'M' + points.map(p => `${ROUND(p[0])} ${ROUND(p[1])}`).join(' L '),
      points,
      cum,
      length: cum[cum.length - 1],
      total: Math.round(cum[cum.length - 1] * 10) / 10,
    };
  }, [product.id,product.notes.length]);

  const nodes = useMemo(
    () => notes.map((_, i) => pointAt(geom.points, geom.cum, (i + 1) / (notes.length + 1))),
    [geom, notes.length],
  );

  // La trace se redessine à chaque parfum actif : un ruban par sillage.
  useEffect(() => {
    const path = trace.current;
    const plate = document.querySelector('[data-sillage-target]');
    plate?.classList.remove('is-settled');
    if (!path) return;
    path.style.strokeDasharray = `${geom.total}`;
    path.style.strokeDashoffset = `${geom.total}`;
    marker.current?.setAttribute('opacity', '0');
    dots.current.forEach((dot, i) => dot?.setAttribute('transform', `translate(${ROUND(nodes[i]?.[0] ?? 0)} ${ROUND(nodes[i]?.[1] ?? 0)})`));
  }, [geom, nodes]);

  useEffect(() => {
    const path = trace.current;
    const grip = marker.current;
    const host = wrap.current;
    const act = host?.closest('[data-sc-act]') as HTMLElement | null;
    if (!path || !grip || !act) return;

    const paint = (raw: number) => {
      const p = document.documentElement.dataset.motion==='still'?1:Math.min(1, Math.max(0, raw));
      path.style.strokeDashoffset = `${geom.total * (1 - p)}`;
      host?.setAttribute('data-sc-verify-state',`trace:${Math.round(geom.total*p)};notes:${notes.filter((_,i)=>p>=(i+1)/(notes.length+1)).length}`);
      const [mx, my] = pointAt(geom.points, geom.cum, p);
      grip.setAttribute('transform', `translate(${ROUND(mx)} ${ROUND(my)})`);
      grip.setAttribute('opacity', p > 0.02 ? '1' : '0');
      nodes.forEach((pt, i) => {
        const window_ = (i + 1) / (notes.length + 1);
        const local = Math.min(1, Math.max(0, (p - window_ + 0.25) / 0.25));
        const dot = dots.current[i];
        if (dot) {
          dot.setAttribute('transform', `translate(${ROUND(pt[0])} ${ROUND(pt[1])})`);
          dot.setAttribute('opacity', `${(0.28 + 0.72 * local).toFixed(3)}`);
        }
        const li = items.current[i];
        if (li) {
          li.style.opacity = `${(0.82 + 0.18 * local).toFixed(3)}`;
          li.style.transform = `translateX(${((1 - local) * 12).toFixed(1)}px)`;
          if (local > 0.65) li.dataset.state = 'on'; else delete li.dataset.state;
        }
      });
      if (p > 0.985) document.querySelector('[data-sillage-target]')?.classList.add('is-settled');
    };

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(1);
      document.querySelector('[data-sillage-target]')?.classList.add('is-settled');
      return;
    }

    paint(0);
    let raf = 0;
    const loop = () => {
      const raw = getComputedStyle(act).getPropertyValue('--sc-p');
      const value = parseFloat(raw);
      if(document.documentElement.dataset.scrollcraft==='fallback')paint(1);
      else paint(Number.isFinite(value) ? Math.min(1,value/0.9) : 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [geom, nodes, notes.length]);

  return (
    <div className="ae-sillage" ref={wrap} data-sc-verify="sillage">
      <svg
        className="ae-ribbon"
        viewBox="0 0 600 470"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Trace de sillage : les ${notes.length} notes de ${product.name}, ${product.brand}.`}
      >
        <path className="ae-ribbon__rail" d={geom.d} />
        <path className="ae-ribbon__trace" ref={trace} d={geom.d} />
        {nodes.map((pt, i) => (
          <g key={notes[i]} className="ae-ribbon__node">
            <circle
              className="ae-ribbon__dot"
              r="5"
              cx="0"
              cy="0"
              ref={el => { dots.current[i] = el; }}
              transform={`translate(${ROUND(pt[0])} ${ROUND(pt[1])})`}
            />
          </g>
        ))}
        <g className="ae-ribbon__marker" ref={marker} transform="translate(26 432)" opacity="0">
          <circle className="ae-ribbon__halo" r="17" />
          <circle className="ae-ribbon__tip" r="6.5" />
        </g>
      </svg>

      <div className="ae-notes-block">
        <p className="sc-label">Notes du catalogue</p>
        <ol className="ae-notes">
          {notes.map((note, i) => (
            <li
              key={note}
              className="ae-note"
              ref={el => { items.current[i] = el; }}
            >
              <span className="ae-note__tick" aria-hidden="true" />
              <span>{note}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
