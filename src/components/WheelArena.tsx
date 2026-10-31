import React, { useEffect, useRef } from 'react';
import { Lang, Segment, ThemeId } from '../types';
import { FX_CONFIGS } from '../data/themes';
import { translate } from '../data/translations';

interface WheelArenaProps {
  lang: Lang;
  theme: ThemeId;
  spinning: boolean;
  elimMode: boolean;
  sessionSpins: number;
  segments: Segment[];
  tickerText: string;
  ecoMode: boolean;
  onSpin: () => void;
  onToggleElimMode: () => void;
  wheelRef: React.MutableRefObject<{
    spinWheel: (onFinish: (winner: Segment) => void) => void;
  } | null>;
  onAutoTuneTriggered: () => void;
  onToggleWheelParams?: () => void;
  panelDrawerOpen?: boolean;
}

const RAD = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mod = (a: number, n: number) => ((a % n) + n) % n;

function contrastOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#101822' : '#ffffff';
}

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export const WheelArena: React.FC<WheelArenaProps> = ({
  lang,
  theme,
  spinning,
  elimMode,
  sessionSpins,
  segments,
  tickerText,
  ecoMode,
  onSpin,
  onToggleElimMode,
  wheelRef,
  onAutoTuneTriggered,
  onToggleWheelParams,
  panelDrawerOpen,
}) => {
  const wheelStageRef = useRef<HTMLDivElement>(null);
  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const wheelTiltRef = useRef<HTMLDivElement>(null);
  const wheelStackRef = useRef<HTMLDivElement>(null);
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const hubBtnRef = useRef<HTMLButtonElement>(null);
  const hubWrapRef = useRef<HTMLDivElement>(null);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);

  const fpsChipRef = useRef<HTMLSpanElement>(null);
  const tickerElRef = useRef<HTMLSpanElement>(null);

  // Wheel animation states
  const rotRef = useRef<number>(Math.random() * 360);
  const isSpinningRef = useRef<boolean>(spinning);
  isSpinningRef.current = spinning;

  const ecoRef = useRef<boolean>(ecoMode);
  ecoRef.current = ecoMode;

  const themeRef = useRef<ThemeId>(theme);
  themeRef.current = theme;

  const segmentsRef = useRef<Segment[]>(segments);
  segmentsRef.current = segments;

  // Offscreen prebaked canvas layers for 60fps rendering
  const layersRef = useRef<{
    layerBot: HTMLCanvasElement | null;
    layerRotC: HTMLCanvasElement | null;
    layerTop: HTMLCanvasElement | null;
    dirty: boolean;
    dpr: number;
    wheelSize: number;
    flashSeg: number;
    flashT: number;
  }>({
    layerBot: null,
    layerRotC: null,
    layerTop: null,
    dirty: true,
    dpr: 1,
    wheelSize: 0,
    flashSeg: -1,
    flashT: 0,
  });

  // Particle and effect states
  const particlesRef = useRef<
    { x: number; y: number; z: number; vx: number; vy: number; r: number; c: string }[]
  >([]);
  const confsRef = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
      g: number;
      w: number;
      h: number;
      rot: number;
      vr: number;
      c: string;
      life: number;
      decay: number;
    }[]
  >([]);
  const shocksRef = useRef<{ x: number; y: number; r: number; max: number; c: string }[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const tiltRef = useRef<{ cur: { x: number; y: number }; tgt: { x: number; y: number } }>({
    cur: { x: 15, y: 0 },
    tgt: { x: 15, y: 0 },
  });
  const hubRef = useRef<{ cur: { x: number; y: number }; tgt: { x: number; y: number } }>({
    cur: { x: 0, y: 0 },
    tgt: { x: 0, y: 0 },
  });

  // Function to seed particles
  const seedParticles = (reduced = false) => {
    const fx = FX_CONFIGS[themeRef.current] || FX_CONFIGS.cyber;
    const tuneFactor = reduced ? 0.5 : 1;
    const div = (ecoRef.current ? 42000 : 22000) / tuneFactor;
    const n = clamp(
      Math.round((window.innerWidth * window.innerHeight) / div),
      16,
      ecoRef.current ? 45 : 90
    );
    const pts = [];
    for (let i = 0; i < n; i++) {
      pts.push({
        x: Math.random(),
        y: Math.random(),
        z: 0.3 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.00016,
        vy: (Math.random() - 0.5) * 0.00016 - 0.00004,
        r: 0.8 + Math.random() * 2.2,
        c: Math.random() < 0.6 ? fx.parts : fx.acc,
      });
    }
    particlesRef.current = pts;
  };

  // Layout Wheel Canvas
  const layoutWheel = () => {
    if (!wheelStageRef.current || !wheelCanvasRef.current) return;
    const r = wheelStageRef.current.getBoundingClientRect();
    const S = clamp(Math.floor(Math.min(r.width * 0.86, r.height * 0.8)), 220, 720);
    const dpr = Math.min(ecoRef.current ? 1.25 : 2, window.devicePixelRatio || 1);

    layersRef.current.wheelSize = S;
    layersRef.current.dpr = dpr;

    wheelCanvasRef.current.style.width = `${S}px`;
    wheelCanvasRef.current.style.height = `${S}px`;
    wheelCanvasRef.current.width = Math.round(S * dpr);
    wheelCanvasRef.current.height = Math.round(S * dpr);

    if (wheelStackRef.current) {
      wheelStackRef.current.style.width = `${S}px`;
      wheelStackRef.current.style.height = `${S}px`;
    }
    if (wheelWrapRef.current) {
      wheelWrapRef.current.style.width = `${S}px`;
      wheelWrapRef.current.style.height = `${S}px`;
    }
    if (hubWrapRef.current) {
      hubWrapRef.current.style.width = `${S * 0.255}px`;
      hubWrapRef.current.style.height = `${S * 0.255}px`;
    }
    if (pointerRef.current) {
      pointerRef.current.style.top = `${-S * 0.03}px`;
      pointerRef.current.style.width = `${S * 0.105}px`;
    }

    layersRef.current.dirty = true;
  };

  // Pre-bake wheel layers
  const buildWheelLayers = () => {
    const { wheelSize: S, dpr } = layersRef.current;
    if (!S) return;
    const fx = FX_CONFIGS[themeRef.current] || FX_CONFIGS.cyber;
    const c = S / 2;
    const R = S / 2 - 2;

    const mk = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
      const cv = document.createElement('canvas');
      const w = Math.round(S * dpr);
      cv.width = w;
      cv.height = w;
      const g = cv.getContext('2d')!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      return [cv, g];
    };

    // Bottom base plate
    const [b, bg2] = mk();
    layersRef.current.layerBot = b;
    const mg = bg2.createRadialGradient(c, c, R * 0.82, c, c, R);
    mg.addColorStop(0, fx.metalHi);
    mg.addColorStop(1, fx.metalLo);
    bg2.beginPath();
    bg2.arc(c, c, R, 0, 7);
    bg2.fillStyle = mg;
    bg2.fill();
    bg2.lineWidth = 2;
    bg2.strokeStyle = 'rgba(0,0,0,.5)';
    bg2.stroke();

    const segs = segmentsRef.current;
    if (segs.length < 2) {
      bg2.beginPath();
      bg2.arc(c, c, R * 0.86, 0, 7);
      bg2.fillStyle = fx.empty;
      bg2.fill();
      bg2.setLineDash([6, 8]);
      bg2.strokeStyle = fx.hubRing;
      bg2.globalAlpha = 0.4;
      bg2.lineWidth = 1.5;
      bg2.beginPath();
      bg2.arc(c, c, R * 0.6, 0, 7);
      bg2.stroke();

      layersRef.current.layerRotC = null;
      layersRef.current.layerTop = null;
      layersRef.current.dirty = false;
      return;
    }

    const Ri = R * 0.88;

    // Rotating layer (segments + pegs + labels)
    const [rc, rg] = mk();
    layersRef.current.layerRotC = rc;
    for (const s of segs) {
      rg.beginPath();
      rg.moveTo(c, c);
      rg.arc(c, c, Ri, s.start * RAD, s.end * RAD);
      rg.closePath();
      rg.fillStyle = s.o.color;
      rg.fill();
      rg.lineWidth = 1.6;
      rg.strokeStyle = fx.segStroke;
      rg.stroke();
    }

    const pr = Math.max(3, S * 0.011);
    for (const s of segs) {
      const a = s.start * RAD;
      const x = c + Math.cos(a) * R * 0.94;
      const y = c + Math.sin(a) * R * 0.94;
      rg.beginPath();
      rg.arc(x, y, pr, 0, 7);
      rg.fillStyle = fx.peg;
      rg.fill();
      rg.lineWidth = 1;
      rg.strokeStyle = 'rgba(0,0,0,.55)';
      rg.stroke();
      rg.beginPath();
      rg.arc(x - pr * 0.3, y - pr * 0.3, pr * 0.28, 0, 7);
      rg.fillStyle = 'rgba(255,255,255,.85)';
      rg.fill();
    }

    const fontD =
      getComputedStyle(document.documentElement).getPropertyValue('--font-display') || 'sans-serif';
    for (const s of segs) {
      const sweep = s.end - s.start;
      const label = (s.o.label || '').toUpperCase();
      if (!label) continue;
      let fs = clamp(S * 0.05, 11, 26);
      fs = Math.min(fs, Math.max(9, sweep * 1.05));
      rg.save();
      rg.translate(c, c);
      rg.rotate(s.mid * RAD);
      rg.font = `700 ${fs}px ${fontD}`;
      rg.textBaseline = 'middle';
      rg.fillStyle = contrastOn(s.o.color);
      const maxW = Ri * 0.55;
      let txt = label;
      while (rg.measureText(txt).width > maxW && txt.length > 2) {
        txt = txt.slice(0, -2);
      }
      if (txt !== label) txt = txt.trim() + '…';
      const nm = mod(s.mid, 360);
      if (nm > 90 && nm < 270) {
        rg.rotate(Math.PI);
        rg.textAlign = 'left';
        rg.fillText(txt, -(Ri - 12), 0);
      } else {
        rg.textAlign = 'right';
        rg.fillText(txt, Ri - 12, 0);
      }
      rg.restore();
    }

    // Top overlay layer (lighting + reflections)
    const [tc, tg2] = mk();
    layersRef.current.layerTop = tc;
    const sh = tg2.createRadialGradient(c, c, Ri * 0.4, c, c, Ri);
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(0,0,0,.32)');
    tg2.beginPath();
    tg2.arc(c, c, Ri, 0, 7);
    tg2.fillStyle = sh;
    tg2.fill();

    tg2.save();
    tg2.beginPath();
    tg2.arc(c, c, Ri, 0, 7);
    tg2.clip();
    const hl = tg2.createLinearGradient(0, 0, S, S);
    hl.addColorStop(0, 'rgba(255,255,255,.17)');
    hl.addColorStop(0.45, 'rgba(255,255,255,0)');
    tg2.fillStyle = hl;
    tg2.fillRect(0, 0, S, S);
    tg2.restore();

    tg2.beginPath();
    tg2.arc(c, c, Ri * 0.31 + 6, 0, 7);
    tg2.fillStyle = fx.metalLo;
    tg2.fill();
    tg2.lineWidth = 2.5;
    tg2.strokeStyle = fx.hubRing;
    tg2.shadowColor = fx.hubRing;
    tg2.shadowBlur = 14;
    tg2.stroke();

    layersRef.current.dirty = false;
  };

  // Exposed trigger for confetti
  const burstConfetti = (color: string) => {
    const cx = window.innerWidth * 0.5;
    const cy = window.innerHeight * 0.42;
    const cols = [color, (FX_CONFIGS[themeRef.current] || FX_CONFIGS.cyber).acc, '#ffffff', '#ffd700'];
    const N = ecoRef.current ? 70 : 150;
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 4 + Math.random() * 10;
      confsRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 4,
        g: 0.22 + Math.random() * 0.1,
        w: 5 + Math.random() * 7,
        h: 3 + Math.random() * 5,
        rot: Math.random() * 7,
        vr: (Math.random() - 0.5) * 0.4,
        c: cols[Math.floor(Math.random() * cols.length)],
        life: 1,
        decay: 0.008 + Math.random() * 0.008,
      });
    }
    shocksRef.current.push({
      x: cx,
      y: cy,
      r: 10,
      max: Math.min(window.innerWidth, window.innerHeight) * 0.4,
      c: color,
    });
  };

  // Expose methods to parent via wheelRef
  if (wheelRef) {
    wheelRef.current = {
      spinWheel: (onFinish: (winner: Segment) => void) => {
        const segs = segmentsRef.current;
        if (segs.length < 2) return;
        const total = segs.reduce((s, x) => s + (x.o.weight || 1), 0);
        let r = Math.random() * total;
        let winner = segs[segs.length - 1];
        for (const s of segs) {
          r -= s.o.weight || 1;
          if (r <= 0) {
            winner = s;
            break;
          }
        }

        const sweep = winner.end - winner.start;
        const m = Math.min(6, sweep * 0.12);
        const land = winner.start + m + Math.random() * Math.max(0.5, sweep - 2 * m);
        const turns = 5 + Math.floor(Math.random() * 3);
        const base = rotRef.current - mod(rotRef.current, 360);
        const target = base + turns * 360 + mod(270 - land, 360);
        const boundaries = segs.map((s) => s.start);

        let lastWheelAng: number | null = null;
        const from = rotRef.current;
        const dist = target - from;
        const dur = 5000;
        const t0 = performance.now();
        const f = Math.min(3, m * 0.6) / dist;

        wheelStackRef.current?.classList.remove('clutch');

        const frame = (now: number) => {
          const tt = clamp((now - t0) / dur, 0, 1);
          const e = 1 - Math.pow(1 - tt, 4.5);
          let bump = 0;
          if (f > 0 && tt > 0.7) {
            const u = clamp((tt - 0.7) / 0.3, 0, 1);
            bump = f * Math.sin(Math.PI * u);
          }
          rotRef.current = from + dist * (e + bump);

          if (tt > 0.78 && !wheelStackRef.current?.classList.contains('clutch')) {
            wheelStackRef.current?.classList.add('clutch');
          }

          const w = mod(270 - rotRef.current, 360);
          if (lastWheelAng !== null) {
            let delta = lastWheelAng - w;
            if (delta < 0) delta += 360;
            let crossed = 0;
            for (const b of boundaries) {
              let d = lastWheelAng - b;
              if (d < 0) d += 360;
              if (d > 0 && d <= delta) crossed++;
            }
            if (crossed > 0 && pointerRef.current) {
              pointerRef.current.classList.remove('tick');
              void pointerRef.current.offsetWidth;
              pointerRef.current.classList.add('tick');
            }
          }
          lastWheelAng = w;

          if (tt < 1) {
            requestAnimationFrame(frame);
          } else {
            rotRef.current = target;
            wheelStackRef.current?.classList.remove('clutch');
            layersRef.current.flashSeg = segs.indexOf(winner);
            layersRef.current.flashT = 1;
            burstConfetti(winner.o.color);
            onFinish(winner);
          }
        };
        requestAnimationFrame(frame);
      },
    };
  }

  // Effect for main render loop and 3D tilting
  useEffect(() => {
    let lastT = performance.now();
    let fpsN = 0;
    let fpsLast = performance.now();
    let lowT = 0;
    let tuned = false;
    let animId: number;

    const sizeFx = () => {
      if (bgCanvasRef.current) {
        bgCanvasRef.current.width = bgCanvasRef.current.clientWidth * layersRef.current.dpr;
        bgCanvasRef.current.height = bgCanvasRef.current.clientHeight * layersRef.current.dpr;
      }
      if (fxCanvasRef.current) {
        fxCanvasRef.current.width = window.innerWidth * layersRef.current.dpr;
        fxCanvasRef.current.height = window.innerHeight * layersRef.current.dpr;
      }
    };

    layoutWheel();
    sizeFx();
    seedParticles();

    const resizeObserver = new ResizeObserver(() => {
      layoutWheel();
      sizeFx();
    });
    if (wheelStageRef.current) resizeObserver.observe(wheelStageRef.current);

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      if (wheelStageRef.current) {
        const r = wheelStageRef.current.getBoundingClientRect();
        const dx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        const dy = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        tiltRef.current.tgt = { x: 15 - dy * 7, y: dx * 10 };
      }
      if (wheelWrapRef.current) {
        const r = wheelWrapRef.current.getBoundingClientRect();
        hubRef.current.tgt = {
          x: clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1) * 6,
          y: clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1) * 6,
        };
      }
    };

    const handlePointerLeaveStage = () => {
      tiltRef.current.tgt = { x: 15, y: 0 };
    };

    const handlePointerLeaveWrap = () => {
      hubRef.current.tgt = { x: 0, y: 0 };
    };

    window.addEventListener('pointermove', handlePointerMove);
    const stageEl = wheelStageRef.current;
    const wrapEl = wheelWrapRef.current;

    stageEl?.addEventListener('pointerleave', handlePointerLeaveStage);
    wrapEl?.addEventListener('pointerleave', handlePointerLeaveWrap);

    const loop = (now: number) => {
      const dt = Math.min(64, now - lastT) / 1000;
      lastT = now;

      // Idle spin
      if (!isSpinningRef.current && segmentsRef.current.length >= 2) {
        rotRef.current += dt * 3.2;
      }

      if (layersRef.current.flashT > 0) {
        layersRef.current.flashT = Math.max(0, layersRef.current.flashT - dt * 1.2);
      }

      // Smooth 3D tilt interpolation
      const k = Math.min(1, dt * 6);
      tiltRef.current.cur.x += (tiltRef.current.tgt.x - tiltRef.current.cur.x) * k;
      tiltRef.current.cur.y += (tiltRef.current.tgt.y - tiltRef.current.cur.y) * k;
      if (wheelTiltRef.current) {
        wheelTiltRef.current.style.transform = `perspective(1300px) rotateX(${tiltRef.current.cur.x.toFixed(2)}deg) rotateY(${tiltRef.current.cur.y.toFixed(2)}deg)`;
      }

      hubRef.current.cur.x += (hubRef.current.tgt.x - hubRef.current.cur.x) * k;
      hubRef.current.cur.y += (hubRef.current.tgt.y - hubRef.current.cur.y) * k;
      if (hubWrapRef.current) {
        hubWrapRef.current.style.transform = `translate(calc(-50% + ${hubRef.current.cur.x.toFixed(1)}px), calc(-50% + ${hubRef.current.cur.y.toFixed(1)}px))`;
      }

      // Dynamic reactive hub colors while spinning
      if (isSpinningRef.current && segmentsRef.current.length && hubBtnRef.current) {
        const cols = segmentsRef.current.map((s) => s.o.color);
        const c = cols[Math.floor(now / 110) % cols.length];
        hubBtnRef.current.style.setProperty('--hubC', c);
        hubBtnRef.current.style.setProperty('--hubGlow', rgba(c, 0.55));
      } else if (hubBtnRef.current) {
        hubBtnRef.current.style.removeProperty('--hubC');
        hubBtnRef.current.style.removeProperty('--hubGlow');
      }

      // 1. Draw Wheel Canvas
      if (wheelCanvasRef.current) {
        if (layersRef.current.dirty) buildWheelLayers();
        const wctx = wheelCanvasRef.current.getContext('2d');
        const { wheelSize: S, dpr, layerBot, layerRotC, layerTop, flashSeg, flashT } = layersRef.current;
        if (wctx && S > 0) {
          wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          wctx.clearRect(0, 0, S, S);
          if (layerBot) wctx.drawImage(layerBot, 0, 0, S, S);
          if (layerRotC) {
            wctx.save();
            wctx.translate(S / 2, S / 2);
            wctx.rotate(rotRef.current * RAD);
            wctx.drawImage(layerRotC, -S / 2, -S / 2, S, S);
            wctx.restore();
          }
          if (layerTop) wctx.drawImage(layerTop, 0, 0, S, S);
          if (flashSeg >= 0 && flashT > 0 && segmentsRef.current[flashSeg]) {
            const c = S / 2;
            const Ri = (S / 2 - 2) * 0.88;
            const s = segmentsRef.current[flashSeg];
            wctx.save();
            wctx.translate(c, c);
            wctx.rotate(rotRef.current * RAD);
            wctx.beginPath();
            wctx.moveTo(0, 0);
            wctx.arc(0, 0, Ri, s.start * RAD, s.end * RAD);
            wctx.closePath();
            wctx.fillStyle = `rgba(255,255,255,${(flashT * 0.55).toFixed(3)})`;
            wctx.fill();
            wctx.restore();
          }
        }
      }

      // 2. Draw Ambient Canvas
      if (bgCanvasRef.current) {
        const bctx = bgCanvasRef.current.getContext('2d');
        const W = bgCanvasRef.current.width;
        const H = bgCanvasRef.current.height;
        const dpr = layersRef.current.dpr;
        if (bctx && W > 0 && H > 0) {
          bctx.setTransform(1, 0, 0, 1, 0, 0);
          bctx.clearRect(0, 0, W, H);
          const px = (mouseRef.current.x - 0.5) * 24 * dpr;
          const py = (mouseRef.current.y - 0.5) * 24 * dpr;
          for (const p of particlesRef.current) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = 1;
            if (p.x > 1) p.x = 0;
            if (p.y < 0) p.y = 1;
            if (p.y > 1) p.y = 0;
            bctx.globalAlpha = 0.15 + p.z * 0.4;
            bctx.beginPath();
            bctx.arc(p.x * W + px * p.z, p.y * H + py * p.z, p.r * dpr * p.z, 0, 7);
            bctx.fillStyle = p.c;
            bctx.fill();
          }
          bctx.globalAlpha = 1;
        }
      }

      // 3. Draw Confetti & Shocks Canvas
      if (fxCanvasRef.current) {
        const fctx = fxCanvasRef.current.getContext('2d');
        const dpr = layersRef.current.dpr;
        if (fctx) {
          fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          fctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

          shocksRef.current = shocksRef.current.filter((s) => {
            s.r += (s.max - s.r) * 0.12;
            fctx.globalAlpha = Math.max(0, 1 - s.r / s.max) * 0.7;
            fctx.lineWidth = 3;
            fctx.strokeStyle = s.c;
            fctx.beginPath();
            fctx.arc(s.x, s.y, s.r, 0, 7);
            fctx.stroke();
            return s.r < s.max - 2;
          });

          confsRef.current = confsRef.current.filter((p) => {
            p.vy += p.g;
            p.vx *= 0.99;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr;
            p.life -= p.decay;
            if (p.life <= 0 || p.y > window.innerHeight + 30) return false;
            fctx.save();
            fctx.translate(p.x, p.y);
            fctx.rotate(p.rot);
            fctx.globalAlpha = Math.max(0, p.life);
            fctx.fillStyle = p.c;
            fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            fctx.restore();
            return true;
          });

          fctx.globalAlpha = 1;
        }
      }

      // 4. FPS counter & Auto-tuning logic for 3G / low-end devices
      fpsN++;
      if (now - fpsLast > 500) {
        const fps = Math.round((fpsN / (now - fpsLast)) * 1000);
        if (fpsChipRef.current) fpsChipRef.current.textContent = String(fps);
        if (fps < 42 && !tuned && !ecoRef.current) {
          lowT += 0.5;
          if (lowT >= 3) {
            tuned = true;
            seedParticles(true);
            onAutoTuneTriggered();
          }
        } else if (fps >= 50) {
          lowT = 0;
        }
        fpsLast = now;
        fpsN = 0;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      stageEl?.removeEventListener('pointerleave', handlePointerLeaveStage);
      wrapEl?.removeEventListener('pointerleave', handlePointerLeaveWrap);
    };
  }, []);

  // When theme, eco mode, or segments change, mark layers as dirty
  useEffect(() => {
    layersRef.current.dirty = true;
    seedParticles();
  }, [theme, ecoMode, segments]);

  // Flash ticker when text updates
  useEffect(() => {
    if (tickerElRef.current) {
      tickerElRef.current.classList.remove('pulse');
      void tickerElRef.current.offsetWidth;
      tickerElRef.current.classList.add('pulse');
    }
  }, [tickerText]);

  return (
    <section id="arena">
      <canvas id="bgFx" ref={bgCanvasRef} />
      <canvas id="fx" ref={fxCanvasRef} />

      <div className="arena-head">
        <span className="tag">{translate(lang, 'tag')}</span>
        <div className="chipst">
          {/* Mobile Wheel Parameters Chip */}
          {onToggleWheelParams && (
            <button
              className={`stchip mobile-wheel-params-chip ${panelDrawerOpen ? 'on' : ''}`}
              id="mobileWheelParamsChip"
              title={lang === 'fr' ? 'Paramètres & options de la roue' : 'Wheel settings'}
              onClick={onToggleWheelParams}
            >
              ⚙️ <b>{lang === 'fr' ? 'PARAMÈTRES' : 'PARAMS'}</b>
              <span className="chip-count">({segments.length})</span>
            </button>
          )}

          <button
            className={`stchip tip-b ${elimMode ? 'on' : ''}`}
            id="modeChip"
            data-tip={translate(lang, 'tip_mode')}
            onClick={onToggleElimMode}
          >
            {elimMode ? (
              <>🎯 <b>{lang === 'fr' ? 'ÉLIMINATION' : 'ELIMINATION'}</b></>
            ) : (
              <>🔄 <b>{lang === 'fr' ? 'CLASSIQUE' : 'CLASSIC'}</b></>
            )}
          </button>

          <div className="stchip tip-b" data-tip={translate(lang, 'tip_session')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
            <b id="chipSpins">{sessionSpins}</b>
          </div>

          <div className="stchip tip-b" data-tip={translate(lang, 'tip_lock')}>
            <span className={`led ${spinning ? 'busy' : ''}`} id="lockLed" />
            <span id="lockTxt">
              {spinning
                ? lang === 'fr'
                  ? 'TIRAGE…'
                  : 'SPIN…'
                : lang === 'fr'
                ? 'PRÊT'
                : 'READY'}
            </span>
          </div>

          <div className="stchip tip-b" data-tip={translate(lang, 'tip_fps')}>
            <b id="fpsChip" ref={fpsChipRef}>
              —
            </b>
            FPS
          </div>
        </div>
      </div>

      <div className="wheel-stage" id="wheelStage" ref={wheelStageRef}>
        <div className="wheel-stack" id="wheelStack" ref={wheelStackRef}>
          <div className="wheel-shadow" />
          <div className="wheel-tilt" id="wheelTilt" ref={wheelTiltRef}>
            <div className="wheel-wrap" id="wheelWrap" ref={wheelWrapRef}>
              <canvas id="wheelCanvas" ref={wheelCanvasRef} />
              <div id="hubWrap" ref={hubWrapRef}>
                <button
                  id="hubBtn"
                  ref={hubBtnRef}
                  className={`${spinning ? 'busy' : ''} ${segments.length < 2 ? 'off' : ''}`}
                  aria-label="Spin"
                  onClick={onSpin}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                  <span>SPIN</span>
                </button>
              </div>
            </div>
          </div>

          <div id="pointer" ref={pointerRef}>
            <svg viewBox="0 0 64 72" fill="none">
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--accent)" />
                  <stop offset="1" stopColor="var(--accent2)" />
                </linearGradient>
              </defs>
              <path
                d="M32 70 7 14c-2-6 3-11 9-9l16 6 16-6c6-2 11 3 9 9L32 70z"
                fill="url(#pg)"
                stroke="rgba(0,0,0,.4)"
                strokeWidth="2"
              />
              <circle cx="32" cy="16" r="5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {segments.length < 2 && (
          <div id="emptyMsg">
            <p>{translate(lang, 'empty_core')}</p>
          </div>
        )}
      </div>

      <footer className="arena-footer">
        <div className="ticker">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span id="tickerTxt" ref={tickerElRef}>
            {tickerText}
          </span>
        </div>

        <div className="powered-badge-container">
          <div className="powered-badge" title="Propulsé avec excellence par DI">
            <span className="powered-txt">{lang === 'fr' ? 'PROPULSÉ PAR' : 'POWERED BY'}</span>
            <div className="di-brand-chip">
              <span className="di-brand-logo">DI</span>
              <span className="di-pulse-dot" />
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};
