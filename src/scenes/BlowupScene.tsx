import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  useStage,
  useWindowSize,
  project,
  sampleCurve,
  strokePath,
  easeInOutCubic,
  easeOutCubic,
  clamp01,
  lerp,
  INK,
  RED,
  FAINT,
} from "@/lib/stage";
import { Callout } from "@/components/Callout";

// morph between the node C: y^2 = x^2(x+1)  and  the strict transform C~: x = u^2 - 1
// node:  (t^2-1, t(t^2-1))      strict transform (chart y = xu):  (t^2-1, t)
const morph = (t: number, s: number): [number, number] => [
  t * t - 1,
  t * lerp(t * t - 1, 1, s),
];
const T_MAX = 1.6;
const U_HALF = 1.95; // half-length of the exceptional line drawn

interface Props {
  startResolved: boolean;
  onResolved: () => void;
  onPapers: () => void;
  onTalks: () => void;
  onBack: () => void;
}

const ZOOM_T = 0.8;
const MORPH_T = 2.1;

export const BlowupScene: React.FC<Props> = ({
  startResolved,
  onResolved,
  onPapers,
  onTalks,
  onBack,
}) => {
  const { w, h } = useWindowSize();
  const [resolved, setResolved] = useState(startResolved);
  const [hover, setHover] = useState<"E" | "C" | null>(null);
  const firedRef = useRef(startResolved);

  const camFar = useMemo(
    () => ({ cx: 1.05, cy: 0, scale: Math.min(w / 6.0, h / 6.6) }),
    [w, h]
  );
  const camNear = useMemo(
    () => ({ cx: 0.85, cy: 0, scale: Math.min(w / 5.0, h / 5.2) }),
    [w, h]
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, cw: number, ch: number, t: number) => {
      const tt = startResolved ? 999 : t;
      const zoom = easeInOutCubic(clamp01(tt / ZOOM_T));
      const mp = clamp01((tt - ZOOM_T) / MORPH_T);
      const s = easeInOutCubic(mp);

      const cam = {
        cx: lerp(camFar.cx, camNear.cx, zoom),
        cy: 0,
        scale: lerp(camFar.scale, camNear.scale, zoom),
      };
      const p = project(cam, cw, ch);

      // axes (fade the y-axis out as the red exceptional line takes its place)
      strokePath(ctx, [p(-1.5, 0), p(4.1, 0)], FAINT, 1);
      const axisAlpha = 1 - easeOutCubic(clamp01(mp * 1.6));
      if (axisAlpha > 0.02) {
        ctx.globalAlpha = axisAlpha;
        strokePath(ctx, [p(0, -3), p(0, 3)], FAINT, 1);
        ctx.globalAlpha = 1;
      }

      // zoom lens circle during phase A
      if (zoom > 0.02 && zoom < 0.98) {
        const [sx, sy] = p(0, 0);
        ctx.beginPath();
        ctx.arc(sx, sy, lerp(2.2, 0.55, zoom) * cam.scale, 0, Math.PI * 2);
        ctx.setLineDash([5, 6]);
        ctx.strokeStyle = "rgba(43,41,37,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // the curve, morphing
      const pts = sampleCurve((u) => morph(u, s), -T_MAX, T_MAX, 260, p);
      strokePath(ctx, pts, hover === "C" && mp >= 1 ? "#4a463f" : INK, 2.2);

      // the exceptional divisor grows in
      const g = easeOutCubic(clamp01(mp * 1.35));
      if (g > 0.01) {
        const ePts: [number, number][] = [
          p(0, -U_HALF * g),
          p(0, U_HALF * g),
        ];
        strokePath(ctx, ePts, RED, hover === "E" && mp >= 1 ? 3.4 : 2.8, g);
        // intersection points C~ ∩ E = {(0,±1)}
        const dotA = clamp01((mp - 0.8) / 0.2);
        if (dotA > 0) {
          for (const yy of [1, -1]) {
            const [dx, dy] = p(0, yy);
            ctx.beginPath();
            ctx.arc(dx, dy, 3, 0, Math.PI * 2);
            ctx.fillStyle = RED;
            ctx.globalAlpha = dotA;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
        // label E
        if (mp >= 1) {
          const [ex, ey] = p(0, -U_HALF);
          ctx.font = "italic 15px Georgia, serif";
          ctx.fillStyle = RED;
          ctx.fillText("E", ex - 14, ey + 16);
        }
      }

      // fire resolved once
      if (mp >= 1 && !firedRef.current) {
        firedRef.current = true;
        setTimeout(() => {
          setResolved(true);
          onResolved();
        }, 250);
      }
    },
    [camFar, camNear, hover, startResolved, onResolved]
  );

  const canvasRef = useStage(draw);
  const projNear = project(camNear, w, h);
  const [eAx, eAy] = projNear(0, 1.0);
  const [cAx, cAy] = projNear(T_MAX * 0.82 * (T_MAX * 0.82) - 1, T_MAX * 0.82);

  // invisible fat hit-paths for the two curves
  const eHit = `M ${projNear(0, -U_HALF)[0]} ${projNear(0, -U_HALF)[1]} L ${projNear(0, U_HALF)[0]} ${projNear(0, U_HALF)[1]}`;
  const cHit = sampleCurve((u) => morph(u, 1), -T_MAX, T_MAX, 80, projNear)
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");

  const caption = resolved
    ? "chart (x, y′) ⊂ Bl₀ 𝔸² :   y′² = x + 1,   E = { x = 0 } ≅ P¹"
    : undefined;

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />

      {resolved && (
        <>
          <svg className="absolute inset-0 h-full w-full">
            <path
              d={eHit}
              stroke="transparent"
              strokeWidth={30}
              fill="none"
              style={{ cursor: "pointer", pointerEvents: "stroke" }}
              onMouseEnter={() => setHover("E")}
              onMouseLeave={() => setHover(null)}
              onClick={onPapers}
            />
            <path
              d={cHit}
              stroke="transparent"
              strokeWidth={30}
              fill="none"
              style={{ cursor: "pointer", pointerEvents: "stroke" }}
              onMouseEnter={() => setHover("C")}
              onMouseLeave={() => setHover(null)}
              onClick={onTalks}
            />
          </svg>

          <Callout
            ax={eAx}
            ay={eAy}
            lx={Math.max(150, eAx - 235)}
            ly={Math.max(70, eAy - 135)}
            title="E ≅ P¹ — papers & works"
            sub="the exceptional divisor"
            color="red"
            onClick={onPapers}
            delay={300}
          />
          <Callout
            ax={cAx}
            ay={cAy}
            lx={Math.min(w - 170, cAx + w * 0.17)}
            ly={Math.min(h - 140, cAy + h * 0.22)}
            title="C̃ — talks & notes"
            sub="the strict transform"
            color="ink"
            onClick={onTalks}
            delay={650}
          />

          <div
            className="absolute bottom-8 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4 text-center transition-opacity duration-1000"
            style={{ transitionDelay: "500ms" }}
          >
            <div className="font-serif text-base italic text-stone-600">{caption}</div>
            <button
              onClick={onBack}
              className="mt-2 font-serif text-sm italic text-stone-400 underline decoration-stone-300 underline-offset-4 hover:text-stone-700"
            >
              ← back to the singular curve
            </button>
          </div>
        </>
      )}

      {!resolved && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center font-serif text-base italic text-stone-500">
          blowing up the origin…
        </div>
      )}
    </div>
  );
};
