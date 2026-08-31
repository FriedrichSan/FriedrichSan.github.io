import React, { useCallback, useRef, useState } from "react";
import { papers, type Work } from "@/config";
import {
  useStage,
  easeInOutCubic,
  easeOutCubic,
  clamp01,
  lerp,
  strokePath,
  RED,
} from "@/lib/stage";
import { Card } from "@/components/Card";

// morph the red line segment into the circle  P^1(R) ~= S^1
const SEG_T = 1.7;
const ZOOM_OUT = 0.6;

interface Props {
  onBack: () => void;
}

export const CircleScene: React.FC<Props> = ({ onBack }) => {
  const [selected, setSelected] = useState<Work | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pauseRef = useRef(false);
  const rotRef = useRef(0);
  const lastRef = useRef<number | null>(null);

  const n = papers.length;
  const baseAngles = papers.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / n);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      // continuous slow rotation (pausable)
      if (lastRef.current == null) lastRef.current = t;
      const dt = Math.min(t - lastRef.current, 0.05);
      lastRef.current = t;
      if (!pauseRef.current && t > ZOOM_OUT + SEG_T) rotRef.current += dt * 0.055;

      const cx0 = w / 2;
      const cy0 = h / 2;
      const R = Math.min(w, h) * 0.29;
      const half = R; // line half-length

      const grow = easeOutCubic(clamp01(t / ZOOM_OUT));
      const s = easeInOutCubic(clamp01((t - ZOOM_OUT) / SEG_T));
      const rot = rotRef.current;

      // --- draw the curve (line -> circle) ---
      const U = 1; // parameter u in [-1,1]
      const pts: [number, number][] = [];
      const N = 220;
      for (let i = 0; i <= N; i++) {
        const u = -U + (2 * U * i) / N;
        const th = Math.PI * u; // full circle
        const x0 = 0;
        const y0 = u * half * grow;
        const x1 = R * Math.sin(th);
        const y1 = -R * Math.cos(th);
        // gentle overall rotation once it is a circle
        const ca = Math.cos(rot), sa = Math.sin(rot);
        const xm = lerp(x0, x1, s);
        const ym = lerp(y0, y1, s);
        pts.push([cx0 + xm * ca - ym * sa, cy0 + ym * ca + xm * sa]);
      }
      strokePath(ctx, pts, RED, 2.8);

      // --- items on the circle ---
      const revealT = ZOOM_OUT + SEG_T;
      papers.forEach((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        const appear = clamp01((t - revealT - i * 0.16) / 0.5);
        const th = baseAngles[i] + rot;
        const px = cx0 + (R + 4) * Math.cos(th) * 1; // dot on circle
        const py = cy0 + (R + 4) * Math.sin(th);
        const lx = cx0 + (R + 26) * Math.cos(th);
        const ly = cy0 + (R + 26) * Math.sin(th);
        const c = Math.cos(th);
        let transform = "translate(-50%,-50%)";
        let textAlign: "left" | "right" | "center" = "center";
        if (c > 0.35) {
          transform = "translate(10px,-50%)";
          textAlign = "left";
        } else if (c < -0.35) {
          transform = "translate(calc(-100% - 10px),-50%)";
          textAlign = "right";
        } else if (Math.sin(th) < 0) {
          transform = "translate(-50%, calc(-100% - 12px))";
        } else {
          transform = "translate(-50%, 12px)";
        }
        el.style.left = `${lx}px`;
        el.style.top = `${ly}px`;
        el.style.transform = transform;
        el.style.textAlign = textAlign;
        el.style.opacity = String(easeOutCubic(appear));
        el.style.pointerEvents = appear > 0.6 ? "auto" : "none";
        void px;
        void py;
      });
    },
    [baseAngles, n]
  );

  const canvasRef = useStage(draw);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />

      {papers.map((p, i) => (
        <button
          key={p.title}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          onClick={() => setSelected(p)}
          onMouseEnter={() => (pauseRef.current = true)}
          onMouseLeave={() => (pauseRef.current = false)}
          className="absolute max-w-[180px] font-serif text-[13px] italic leading-snug text-stone-800 opacity-0 transition-colors hover:text-red-800"
          style={{ textShadow: "0 0 6px #f6f1e6, 0 0 3px #f6f1e6" }}
        >
          <span className="mr-1 not-italic text-red-800/70">{i + 1}.</span>
          {p.title}
        </button>
      ))}

      <div className="pointer-events-none absolute bottom-8 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4 text-center">
        <div className="font-serif text-base italic text-stone-600">
          E ≅ P¹ — and P¹(ℝ) is a circle
        </div>
        {papers.length === 0 && (
          <div className="mt-2 font-serif text-sm italic text-stone-500">
            I have no papers yet.
          </div>
        )}
        <button
          onClick={onBack}
          className="pointer-events-auto mt-2 font-serif text-sm italic text-stone-400 underline decoration-stone-300 underline-offset-4 hover:text-stone-700"
        >
          ← back to the resolution
        </button>
      </div>

      <Card
        open={!!selected}
        onClose={() => setSelected(null)}
        kicker={selected ? `${selected.venue} · ${selected.year}` : undefined}
        title={selected?.title ?? ""}
      >
        {selected?.coauthors && <p className="mb-2 italic">{selected.coauthors}</p>}
        <p className="mb-4">{selected?.abstract}</p>
        <a
          href={selected?.href}
          className="italic text-stone-800 underline decoration-stone-400 underline-offset-4 hover:decoration-stone-800"
        >
          read the paper →
        </a>
      </Card>
    </div>
  );
};
