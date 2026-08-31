import React, { useCallback, useRef, useState } from "react";
import { talks, type Talk } from "@/config";
import {
  useStage,
  easeInOutCubic,
  easeOutCubic,
  clamp01,
  lerp,
  INK,
  RED,
} from "@/lib/stage";
import { Card } from "@/components/Card";

// C~ : x = u^2 - 1  (parabola)  --->  twisted cubic  u |-> (u, u^2, u^3) in 3-space
const MORPH_START = 0.6;
const MORPH_T = 1.9;
const U_MAX = 1.32;
const TILT = 0.42;

type V3 = [number, number, number];

const start3 = (u: number): V3 => [u * u - 1, u * 0.95, 0];
const end3 = (u: number): V3 => [u * 1.55, (u * u - 0.55) * 1.05, u * u * u * 0.8];

function rotY([x, y, z]: V3, phi: number): V3 {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return [x * c + z * s, y, -x * s + z * c];
}
function rotX([x, y, z]: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}

interface Props {
  onBack: () => void;
}

export const CubicScene: React.FC<Props> = ({ onBack }) => {
  const [selected, setSelected] = useState<Talk | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pauseRef = useRef(false);
  const rotRef = useRef(0);
  const lastRef = useRef<number | null>(null);

  const n = talks.length;
  const us = talks.map((_, i) => -1.18 + (2.36 * i) / (n - 1));

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      if (lastRef.current == null) lastRef.current = t;
      const dt = Math.min(t - lastRef.current, 0.05);
      lastRef.current = t;
      const morphEnd = MORPH_START + MORPH_T;
      if (!pauseRef.current && t > morphEnd) rotRef.current += dt * 0.22;

      const grow = easeOutCubic(clamp01(t / MORPH_START));
      const s = easeInOutCubic(clamp01((t - MORPH_START) / MORPH_T));
      const phi = 0.85 * s + rotRef.current;
      const scale = (Math.min(w, h) / 4.6) * (0.55 + 0.45 * grow);
      const cx0 = w / 2;
      const cy0 = h / 2;

      const pt = (u: number): { x: number; y: number; d: number } => {
        const a = start3(u);
        const b = end3(u);
        const v: V3 = [
          lerp(a[0], b[0], s),
          lerp(a[1], b[1], s),
          lerp(a[2], b[2], s),
        ];
        const r = rotX(rotY(v, phi), TILT);
        return { x: cx0 + r[0] * scale, y: cy0 - r[1] * scale, d: r[2] };
      };

      // draw the curve segment by segment, depth-shaded
      const SEG = 190;
      let prev = pt(-U_MAX);
      for (let i = 1; i <= SEG; i++) {
        const u = -U_MAX + (2 * U_MAX * i) / SEG;
        const cur = pt(u);
        const depth = clamp01(0.5 + (cur.d / (U_MAX * scale)) * 0.9);
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(cur.x, cur.y);
        ctx.strokeStyle = INK;
        ctx.globalAlpha = (0.22 + 0.78 * depth) * grow;
        ctx.lineWidth = 1.4 + 1.3 * depth;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.globalAlpha = 1;
        prev = cur;
      }

      // items along the curve
      const revealT = morphEnd + 0.15;
      const depths = us.map((u) => pt(u).d);
      const dMin = Math.min(...depths);
      const dMax = Math.max(...depths);
      talks.forEach((talk, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        const p = pt(us[i]);
        const appear = easeOutCubic(clamp01((t - revealT - i * 0.15) / 0.5));
        const dn = dMax > dMin ? (depths[i] - dMin) / (dMax - dMin) : 1;

        // marker dot on the curve
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.6 + 1.6 * dn, 0, Math.PI * 2);
        ctx.fillStyle = talk.kind === "note" ? INK : RED;
        ctx.globalAlpha = appear * (0.45 + 0.55 * dn);
        ctx.fill();
        ctx.globalAlpha = 1;

        // HTML label
        const above = i % 2 === 0;
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
        el.style.transform = above
          ? "translate(-50%, calc(-100% - 14px))"
          : "translate(-50%, 16px)";
        el.style.opacity = String(appear * (0.45 + 0.55 * dn));
        el.style.zIndex = String(dn > 0.5 ? 20 : 10);
        el.style.pointerEvents = appear > 0.6 ? "auto" : "none";
      });
    },
    [n, us]
  );

  const canvasRef = useStage(draw);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />

      {talks.map((talk, i) => (
        <button
          key={talk.title}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          onClick={() => setSelected(talk)}
          onMouseEnter={() => (pauseRef.current = true)}
          onMouseLeave={() => (pauseRef.current = false)}
          className="absolute max-w-[190px] text-center font-serif text-[13px] italic leading-snug text-stone-800 opacity-0 transition-colors hover:text-red-800"
          style={{ textShadow: "0 0 6px #f6f1e6, 0 0 3px #f6f1e6" }}
        >
          <span
            className="mr-1 text-[10px] uppercase tracking-wider not-italic"
            style={{ color: talk.kind === "note" ? "#6b675f" : RED }}
          >
            {talk.kind}
          </span>
          {talk.title}
        </button>
      ))}

      <div className="pointer-events-none absolute bottom-8 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4 text-center">
        <div className="font-serif text-base italic text-stone-600">
          C̃ ≅ P¹ <span aria-label="embeds into">{"\u21AA\uFE0E"}</span> P³ :&nbsp; u ↦ (u, u², u³) — the twisted cubic
        </div>
        {talks.length === 0 && (
          <div className="mt-2 font-serif text-sm italic text-stone-500">
            I have no talks yet. Notes will be added soon.
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
        kicker={selected ? `${selected.kind} · ${selected.event} · ${selected.date}` : undefined}
        title={selected?.title ?? ""}
      >
        <p className="mb-4">{selected?.abstract}</p>
        <a
          href={selected?.href}
          className="italic text-stone-800 underline decoration-stone-400 underline-offset-4 hover:decoration-stone-800"
        >
          {selected?.kind === "note" ? "read the notes →" : "slides / video →"}
        </a>
      </Card>
    </div>
  );
};
