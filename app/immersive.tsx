'use client';
import {useEffect,useRef} from 'react';
import type {CSSProperties} from 'react';

/**
 * Immersive — couche « 3D, dynamique, immersif » (Demba's standing preference).
 *
 * 1. Lumière de lampe qui suit le curseur (atelier de nuit).
 * 2. Tilt 3D des photographies réelles (perspective + --mx/--my).
 * 3. Poussière d'or en suspension (mouvement perpétuel).
 * 4. Grain de film (profondeur).
 *
 * Ne touche AUCUN élément data-sc-* : le moteur reste maître de ses nœuds.
 * Lumière et tilt exigent un pointeur précis (désactivés au tactile) ;
 * tout est coupé sous prefers-reduced-motion.
 */

const MOTES = [
  { left: '7%',  size: 5, dur: 19, delay: 0,  dx: '16px' },
  { left: '21%', size: 3, dur: 26, delay: 4,  dx: '-22px' },
  { left: '36%', size: 4, dur: 22, delay: 8,  dx: '14px' },
  { left: '50%', size: 6, dur: 30, delay: 2,  dx: '-12px' },
  { left: '64%', size: 3, dur: 24, delay: 10, dx: '20px' },
  { left: '77%', size: 5, dur: 21, delay: 6,  dx: '-16px' },
  { left: '90%', size: 4, dur: 28, delay: 12, dx: '12px' },
];

export function Immersive() {
  const raf = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (matchMedia('(hover: none), (pointer: coarse)').matches) return;

    let mx = 0, my = 0, cx = 0, cy = 0;      // cibles
    let mxv = 0, myv = 0, cxv = 0, cyv = 0;  // valeurs lissées
    let ready = false;

    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      cx = e.clientX;
      cy = e.clientY;
      if (!ready) { mxv = mx; myv = my; cxv = cx; cyv = cy; ready = true; }
    };

    const loop = () => {
      mxv += (mx - mxv) * 0.09;
      myv += (my - myv) * 0.09;
      cxv += (cx - cxv) * 0.12;
      cyv += (cy - cyv) * 0.12;
      const r = document.documentElement.style;
      r.setProperty('--mx', mxv.toFixed(4));
      r.setProperty('--my', myv.toFixed(4));
      r.setProperty('--cx', `${cxv.toFixed(1)}px`);
      r.setProperty('--cy', `${cyv.toFixed(1)}px`);
      raf.current = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div className="ae-cursor-light" aria-hidden="true" />
      <div className="ae-motes" aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="ae-mote"
            style={{
              left: m.left,
              width: m.size,
              height: m.size,
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
              ['--dx' as string]: m.dx,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="ae-grain" aria-hidden="true" />
    </>
  );
}
