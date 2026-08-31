import React, { useCallback, useState } from "react";
import { site } from "@/config";
import {
  useStage,
  useWindowSize,
  project,
  sampleCurve,
  strokePath,
  easeOutCubic,
  clamp01,
  INK,
  FAINT,
  RED,
} from "@/lib/stage";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";

// C : y^2 = x^3 + x^2, parametrized by x = t^2 - 1, y = t(t^2 - 1)
const node = (t: number): [number, number] => [t * t - 1, t * (t * t - 1)];
const T_MAX = 1.6;

interface Props {
  onBlowup: () => void;
}

export const NodeScene: React.FC<Props> = ({ onBlowup }) => {
  const { w, h } = useWindowSize();
  const [aboutOpen, setAboutOpen] = useState(false);

  const scale = Math.min(w / 6.0, h / 6.6);
  const cam = { cx: 1.05, cy: 0, scale };
  const proj = project(cam, w, h);
  const [singX, singY] = proj(0, 0);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, cw: number, ch: number, t: number) => {
      const p = project(cam, cw, ch);
      // axes
      strokePath(ctx, [p(-1.4, 0), p(3.9, 0)], FAINT, 1);
      strokePath(ctx, [p(0, -3), p(0, 3)], FAINT, 1);
      // axis labels
      ctx.font = "italic 13px Georgia, serif";
      ctx.fillStyle = "rgba(43,41,37,0.45)";
      ctx.fillText("x", p(3.8, 0)[0] + 4, p(3.8, 0)[1] - 6);
      ctx.fillText("y", p(0, 3)[0] + 6, p(0, 3)[1] + 4);

      // the node, drawing itself in
      const reveal = easeOutCubic(clamp01(t / 1.7));
      const tEnd = -T_MAX + 2 * T_MAX * reveal;
      const pts = sampleCurve(node, -T_MAX, tEnd, Math.max(2, Math.floor(240 * reveal)), p);
      strokePath(ctx, pts, INK, 2.2);

      if (reveal > 0.98) {
        // pulse at the singularity
        const pulse = 1 + 0.22 * Math.sin(t * 2.4);
        const [sx, sy] = p(0, 0);
        ctx.beginPath();
        ctx.arc(sx, sy, 5.5 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.9;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.fill();
        // equation caption, faint
        ctx.font = "italic 15px Georgia, serif";
        ctx.fillStyle = "rgba(43,41,37,0.55)";
        ctx.fillText("C : y² = x³ + x²", p(-1.25, 2.6)[0], p(-1.25, 2.6)[1]);
      }
    },
    [cam.cx, cam.cy, cam.scale]
  );

  const canvasRef = useStage(draw);

  // callout geometry (responsive)
  const offX = w < 640 ? -70 : -210;
  const offY = h < 560 ? -80 : -128;
  const lx = Math.max(110, singX + offX);
  const ly = Math.max(64, singY + offY);
  const ready = true; // callout fades in via delay

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />

      <Callout
        ax={singX}
        ay={singY}
        lx={lx}
        ly={ly}
        title="the singularity — about me"
        sub="an ordinary double point"
        color="red"
        onClick={() => setAboutOpen(true)}
        visible={ready}
        delay={1400}
      />

      {/* bottom hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center transition-opacity duration-1000"
        style={{ opacity: 1, transitionDelay: "1800ms" }}
      >
        <button
          onClick={onBlowup}
          className="group font-serif text-lg italic text-stone-700 transition-colors hover:text-stone-900"
        >
          blow up the singularity
          <span className="ml-2 inline-block transition-transform group-hover:translate-x-1.5">
            ⟶
          </span>
        </button>
        <div className="mt-1 font-serif text-xs italic text-stone-400">
          π : Bl₀ 𝔸² → 𝔸²
        </div>
      </div>

      <Card
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        kicker="the point (0,0)"
        title={`${site.name} — ${site.tagline}`}
      >
        {site.bio.map((p, i) => (
          <p key={i} className="mb-3">
            {p}
          </p>
        ))}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
          {site.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="italic text-stone-800 underline decoration-stone-400 underline-offset-4 hover:decoration-stone-800"
            >
              {l.label}
            </a>
          ))}
        </div>
        <button
          onClick={() => {
            setAboutOpen(false);
            onBlowup();
          }}
          className="mt-6 border border-stone-800/40 px-4 py-2 font-serif italic text-stone-800 transition-colors hover:bg-stone-900 hover:text-stone-50"
        >
          blow up the singularity ⟶
        </button>
      </Card>
    </div>
  );
};
