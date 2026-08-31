import React from "react";
import { INK, RED } from "@/lib/stage";

interface CalloutProps {
  // anchor point on the curve (screen px)
  ax: number;
  ay: number;
  // label position (screen px)
  lx: number;
  ly: number;
  title: string;
  sub?: string;
  color?: "ink" | "red";
  onClick?: () => void;
  visible?: boolean;
  delay?: number;
}

// A hand-drawn style curved arrow from the label to the anchor point.
export const Callout: React.FC<CalloutProps> = ({
  ax,
  ay,
  lx,
  ly,
  title,
  sub,
  color = "ink",
  onClick,
  visible = true,
  delay = 0,
}) => {
  const stroke = color === "red" ? RED : INK;
  // control point: perpendicular bulge
  const mx = (ax + lx) / 2;
  const my = (ay + ly) / 2;
  const dx = ax - lx;
  const dy = ay - ly;
  const len = Math.hypot(dx, dy) || 1;
  const bulge = Math.min(46, len * 0.28);
  const cx = mx - (dy / len) * bulge;
  const cy = my + (dx / len) * bulge;
  // arrowhead at anchor: tangent of quadratic bezier at t=1 is (anchor - ctrl)
  const tx = ax - cx;
  const ty = ay - cy;
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const hs = 9;
  const p1x = ax - ux * hs * 1.9 - uy * hs * 0.7;
  const p1y = ay - uy * hs * 1.9 + ux * hs * 0.7;
  const p2x = ax - ux * hs * 1.9 + uy * hs * 0.7;
  const p2y = ay - uy * hs * 1.9 - ux * hs * 0.7;

  return (
    <div
      className="pointer-events-none absolute inset-0 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0, transitionDelay: `${delay}ms` }}
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <path
          d={`M ${lx} ${ly} Q ${cx} ${cy} ${ax - ux * 4} ${ay - uy * 4}`}
          fill="none"
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.85}
        />
        <path
          d={`M ${p1x} ${p1y} L ${ax} ${ay} L ${p2x} ${p2y}`}
          fill="none"
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      </svg>
      <button
        onClick={onClick}
        className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 text-left ${
          onClick ? "cursor-pointer" : "cursor-default"
        }`}
        style={{ left: lx, top: ly - 14 }}
      >
        <span
          className="block whitespace-nowrap font-serif text-lg italic leading-tight transition-transform hover:scale-105"
          style={{ color: stroke }}
        >
          {title}
        </span>
        {sub && (
          <span className="block whitespace-nowrap font-serif text-xs italic text-stone-500">
            {sub}
          </span>
        )}
      </button>
    </div>
  );
};
