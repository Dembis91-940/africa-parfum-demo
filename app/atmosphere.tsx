'use client';
import {useEffect,useRef} from 'react';

/**
 * Atmosphere — champ de poussière d'or en 3D (projection perspective réelle).
 *
 * Derrière le contenu (canvas fixed, z-index 1) : une lueur ambiante qui respire,
 * une contre-lueur verte de profondeur, un rayon de lumière qui balance, et un
 * nuage de particules avec une vraie coordonnée z, projetées en perspective, qui
 * dérivent, scintillent et répondent au curseur (parallaxe) et au scroll (dolly).
 * Vignette de profondeur en fin.
 *
 * Aucun nœud data-sc-* touché (le moteur reste maître). Désactivé sous
 * prefers-reduced-motion ; mis en pause quand l'onglet est caché.
 */

type Particle = {
  x:number; y:number; z:number; r:number; a:number; s:number;
  tw:number; ph:number; vy:number; vx:number;
};

const rnd = (a:number, b:number) => a + Math.random() * (b - a);

export function Atmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Sprite doré pré-rendu : un point à bord doux, dessiné par drawImage (rapide). */
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d');
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,248,228,1)');
      g.addColorStop(0.35, 'rgba(236,199,138,0.85)');
      g.addColorStop(1, 'rgba(219,182,123,0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 64, 64);
    }

    const N = 260;
    const parts: Particle[] = [];
    for (let i = 0; i < N; i++) {
      parts.push({
        x: rnd(-1.45, 1.45), y: rnd(-1.15, 1.15), z: rnd(0.22, 1),
        r: rnd(1.6, 4.6), a: rnd(0.5, 1), s: rnd(0.3, 1.1),
        tw: rnd(0.5, 2.6), ph: rnd(0, Math.PI * 2),
        vy: rnd(0.011, 0.028), vx: rnd(-0.005, 0.005),
      });
    }

    /* Bokeh d'avant-plan : grosses pastilles floues = profondeur de champ. */
    for (let i = 0; i < 10; i++) {
      parts.push({
        x: rnd(-1.1, 1.1), y: rnd(-0.9, 0.9), z: rnd(0.32, 0.75),
        r: rnd(8, 16), a: rnd(0.28, 0.48), s: rnd(0.2, 0.6),
        tw: rnd(0.6, 1.8), ph: rnd(0, Math.PI * 2),
        vy: rnd(0.005, 0.011), vx: rnd(-0.003, 0.003),
      });
    }

    let mx = 0, my = 0, scr = 0, mxv = 0, myv = 0, scrv = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / Math.max(1, W)) * 2 - 1;
      my = (e.clientY / Math.max(1, H)) * 2 - 1;
    };
    const onScroll = () => {
      scr = window.scrollY / Math.max(1, document.documentElement.scrollHeight - H);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    let raf = 0, running = true;
    const fov = 1.06;

    const loop = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      mxv += (mx - mxv) * 0.045; myv += (my - myv) * 0.045; scrv += (scr - scrv) * 0.05;
      ctx.clearRect(0, 0, W, H);

      const breath = 0.5 + 0.5 * Math.sin(t * 0.00034);
      const D = Math.max(W, H);

      /* Lueur ambiante chaude — le « cœur » de l'atelier, qui respire et dérive. */
      const gx = W * 0.6 + Math.sin(t * 0.00013) * W * 0.1;
      const gy = H * 0.34 + Math.sin(t * 0.00009) * H * 0.07;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, D * 0.6);
      glow.addColorStop(0, `rgba(219,182,123,${0.18 + 0.06 * breath})`);
      glow.addColorStop(0.5, `rgba(219,182,123,${0.07 + 0.025 * breath})`);
      glow.addColorStop(1, 'rgba(219,182,123,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      /* Contre-lueur verte (profondeur, rappel du voile de droite). */
      const gx2 = W * 0.16 + Math.sin(t * 0.0001 + 2.1) * W * 0.09;
      const gy2 = H * 0.72 + Math.cos(t * 0.00008) * H * 0.06;
      const glow2 = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, D * 0.52);
      glow2.addColorStop(0, 'rgba(110,150,120,0.10)');
      glow2.addColorStop(1, 'rgba(110,150,120,0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, W, H);

      /* Source de lumière — une lampe chaude, cœur net qui pulse. */
      const lx = W * 0.5 + Math.sin(t * 0.00016) * W * 0.05;
      const ly = H * 0.22 + Math.sin(t * 0.00011) * H * 0.03;
      const lamp = ctx.createRadialGradient(lx, ly, 0, lx, ly, D * 0.22);
      lamp.addColorStop(0, `rgba(255,238,200,${0.34 + 0.06 * breath})`);
      lamp.addColorStop(0.4, `rgba(219,182,123,${0.12 + 0.03 * breath})`);
      lamp.addColorStop(1, 'rgba(219,182,123,0)');
      ctx.fillStyle = lamp;
      ctx.fillRect(0, 0, W, H);

      /* Rayon de lumière — balancement lent. */
      const sway = Math.sin(t * 0.0001) * W * 0.06;
      const g = ctx.createLinearGradient(W * 0.08, -H * 0.3, W * 0.7 + sway, H * 1.2);
      g.addColorStop(0, `rgba(219,182,123,${0.07 + 0.04 * breath})`);
      g.addColorStop(0.55, `rgba(219,182,123,${0.03 * breath})`);
      g.addColorStop(1, 'rgba(219,182,123,0)');
      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);
      ctx.rotate(-0.13);
      ctx.fillStyle = g;
      ctx.fillRect(-W, -H * 0.8, W * 2, H * 1.7);
      ctx.restore();

      /* Particules — projection perspective, dérive, scintillement. */
      const cx = W * 0.5 + mxv * W * 0.07;
      const cy = H * 0.5 + myv * H * 0.06 + scrv * H * 0.22;
      for (let i = 0; i < N; i++) {
        const p = parts[i];
        p.y -= p.vy * p.s;
        p.x += p.vx * p.s;
        const z = Math.min(1.05, Math.max(0.18, p.z + 0.1 * Math.sin(t * 0.0003 * p.tw + p.ph)));
        if (p.y < -1.3) { p.y = 1.3; p.x = rnd(-1.45, 1.45); }
        if (p.x > 1.75) p.x = -1.75; else if (p.x < -1.75) p.x = 1.75;

        const k = fov / z;
        const sx = cx + p.x * k * W * 0.5;
        const sy = cy + p.y * k * H * 0.5;
        if (sx < -28 || sx > W + 28 || sy < -28 || sy > H + 28) continue;
        const size = Math.max(0.8, p.r * k);
        const twinkle = 0.62 + 0.38 * Math.sin(t * 0.0016 * p.tw + p.ph * 2);
        const alpha = p.a * (0.55 + 0.45 * (1 - z)) * twinkle;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.drawImage(sprite, sx - size, sy - size, size * 2, size * 2);
      }
      ctx.globalAlpha = 1;

      /* Vignette de profondeur (fond seulement, le contenu passe au-dessus). */
      const v = ctx.createRadialGradient(W * 0.5, H * 0.44, Math.min(W, H) * 0.32, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
      v.addColorStop(0, 'rgba(8,13,10,0)');
      v.addColorStop(1, 'rgba(5,9,7,0.5)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(loop);
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="ae-atmosphere" aria-hidden="true" />;
}
