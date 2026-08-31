import { useEffect, useRef, useState } from "react";

// ---------- math helpers ----------
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const smooth = (t: number) => t * t * (3 - 2 * t);

// ---------- camera: world -> screen ----------
export interface Cam {
  cx: number;
  cy: number;
  scale: number;
}
export const project =
  (cam: Cam, w: number, h: number) =>
  (x: number, y: number): [number, number] => [
    w / 2 + (x - cam.cx) * cam.scale,
    h / 2 - (y - cam.cy) * cam.scale,
  ];

// ---------- colors ----------
export const INK = "#2b2925";
export const RED = "#b3362b";
export const FAINT = "rgba(43,41,37,0.28)";
export const PAPER = "#f6f1e6";

// ---------- canvas stage hook ----------
export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) => void;

export function useStage(draw: DrawFn) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        drawRef.current(ctx, w, h, (now - start) / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return canvasRef;
}

// sketchy polyline stroke (double pass, slight offset — hand-drawn feel)
export function strokePath(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  color: string,
  width: number,
  alpha = 1
) {
  if (pts.length < 2) return;
  for (const [off, a] of [
    [0, alpha],
    [0.7, alpha * 0.18],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + off, pts[0][1] + off);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + off, pts[i][1] + off);
    ctx.strokeStyle = color;
    ctx.globalAlpha = a;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// sample a parametric curve in world coords, return screen pts
export function sampleCurve(
  fn: (t: number) => [number, number],
  t0: number,
  t1: number,
  n: number,
  proj: (x: number, y: number) => [number, number]
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const [x, y] = fn(t);
    pts.push(proj(x, y));
  }
  return pts;
}

export function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return size;
}
