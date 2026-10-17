import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { noteGroups, talks, type Talk } from "@/config";
import { Card } from "@/components/Card";
import { clamp01, lerp, INK, RED, useStage } from "@/lib/stage";
import { FAMILY_DURATION } from "@/lib/curveFamily";
import "./family.css";

type Pt = [number, number];

/* the seven members drawn at rest: −1 and +1 are the two marked ones */
const PARAMETERS = [-1, -0.65, -0.32, 0, 0.32, 0.65, 1];
const SAMPLES = 320;
const MORPH = 1.40;     // the strict transform turns into the family's pose
const REVEAL = 3.85;     // the notes appear once the family has settled
const CAM_THETA = 2.7;
const CAM_PHI = 1.35;

/* The family is drawn after Hartshorne, Algebraic Geometry (1977), III Fig. 11;
   the attribution lives here rather than on the page.
   The curve seen from camera angle `camera` ∈ [0,1]: 0 is the chart of the
   blow-up scene (face on), 1 is the settled pose of the family. `spread`
   pushes a member out of the centre curve in depth. */
function posedPoint(q: number, a: number, spread: number, camera: number, idle: number): Pt {
  const u = -1.42 + 2.84 * q;
  const x = 0.72 * (u * u - 1);
  const y = u;
  const z = 0.78 * (u * u * u - u) + 0.38 * (a * spread) * (u * u - 1);
  const theta = CAM_THETA * camera + idle;
  const phi = CAM_PHI * (1 - (1 - camera) ** 5) + idle * 0.4;
  const rx = x * Math.cos(theta) + z * Math.sin(theta);
  const rz = -x * Math.sin(theta) + z * Math.cos(theta);
  const ry = y * Math.cos(phi) - rz * Math.sin(phi);
  const depth = y * Math.sin(phi) + rz * Math.cos(phi);
  const roll = -0.08 * camera;
  const px = rx * Math.cos(roll) - ry * Math.sin(roll);
  const py = rx * Math.sin(roll) + ry * Math.cos(roll);
  const perspective = 1 / (1 + 0.045 * camera * depth);
  const zoom = 1 / (1 + 0.42 * Math.sin(theta) ** 2);
  return [px * 1.35 * perspective * zoom, py * perspective * zoom];
}

const familyPoint = (q: number, a: number, spread: number, idle: number): Pt =>
  posedPoint(q, a, spread, 1, idle);

const smooth = (t: number) => {
  const p = clamp01(t);
  return p * p * (3 - 2 * p);
};

/* ?at= freezes the clock in development, for deterministic screenshots */
const FROZEN = (() => {
  if (!import.meta.env.DEV) return null;
  const raw = new URLSearchParams(location.search).get("at");
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.min(12, value) : null;
})();

export function FamilyScene({ onBack }: { onBack: () => void }) {
  const groups = useMemo(() => noteGroups.map(group => ({
    ...group,
    /* the card sits on the nearest member of the family, whatever the config asks for */
    parameter: PARAMETERS.reduce((best, p) => (Math.abs(p - group.parameter) < Math.abs(best - group.parameter) ? p : best), PARAMETERS[0]),
    notes: talks.filter(n => n.category === group.id),
  })), []);
  const [panel, setPanel] = useState<{ id: string; title: string; kicker: string; notes: Talk[] } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const phaseRef = useRef<HTMLSpanElement>(null);
  const clock = useRef({ age: 0, last: 0, ready: false });
  const paths = useRef(new Map<string, Pt[]>());
  const state = useRef({ hovered, paused, reduced, selected: !!panel });
  state.current = { hovered, paused, reduced, selected: !!panel };

  useEffect(() => {
    if (import.meta.env.DEV) {
      const id = new URLSearchParams(location.search).get("panel");
      const group = groups.find(g => g.id === id);
      if (group?.notes.length) setPanel({ id: group.id, title: group.title, kicker: `${String(group.notes.length).padStart(2, "0")} ${group.notes.length === 1 ? "note" : "notes"} · personal notes`, notes: group.notes });
    }
  }, [groups]);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = new URLSearchParams(location.search).get("motion") === "reduce";
    const update = () => setReduced(mq.matches || forced);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    const root = rootRef.current;
    if (!root) return;
    const s = state.current;
    const dt = clock.current.last ? Math.min(0.06, time - clock.current.last) : 0;
    clock.current.last = time;
    if (!s.paused && !s.selected && FROZEN === null) clock.current.age += dt;
    const age = s.reduced ? FAMILY_DURATION + 1 : (FROZEN ?? clock.current.age);

    const compact = w < 900;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const spreadAll = smooth(clamp01((age - 1.30) / 2.40));
    const idle = s.reduced ? 0 : Math.sin(Math.max(0, age - 3.9) * 0.34) * 0.016;
    const notesIn = smooth(clamp01((age - REVEAL) / 0.90));
    root.style.setProperty("--head", String(smooth(clamp01((age - 0.55) / 1.65))));


    const stroke = (pts: Pt[], color: string, width: number, alpha: number) => {
      if (pts.length < 2 || alpha <= 0) return;
      ctx.beginPath();
      ctx.moveTo(...pts[0]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    paths.current.clear();

    /* the seam: at camera 0 this reproduces the blow-up scene's last frame.
       On phones the canvas is a smaller box inside the page, so the blow-up's
       viewport coordinates are shifted by the canvas offset; the turn runs on
       every screen size, not only on the desktop layout. */
    const vw = window.innerWidth, vh = window.innerHeight;
    const box = ctx.canvas.getBoundingClientRect();
    const s0 = Math.min(vw / 5.0, vh / 5.2);
    const sf = compact ? Math.min(w * 0.42, h * 0.27) : Math.min(w * 0.24, (h - 230) * 0.29);
    const camera = smooth(clamp01(age / MORPH));
    const CX = lerp(vw * 0.5 - 0.0275 * s0 - box.left, compact ? w * 0.50 : w * 0.58, camera);
    const CY = lerp(vh * 0.5 - box.top, compact ? h * 0.52 : h * 0.51, camera);
    const SX = lerp(1.875 * s0, sf, camera);
    const SY = lerp(s0, sf, camera);
    const frame = ([X, Y]: Pt): Pt => [CX + X * SX, CY - Y * SY];

    /* marked members last, so they sit on top */
    const members = [...PARAMETERS].sort((a, b) => Number(Math.abs(a) === 1) - Number(Math.abs(b) === 1));

    /* the incoming curve: the strict transform itself, turning into place.
       The chart's parameter range is narrower than the family's, so the curve
       starts exactly on the blow-up frame and lengthens as it turns. */
    {
      const qa = 0.083 * (1 - camera);
      const pts: Pt[] = [];
      for (let i = 0; i <= SAMPLES; i++) pts.push(frame(posedPoint(qa + (1 - 2 * qa) * (i / SAMPLES), 0, 0, camera, idle)));
      stroke(pts, INK, 2.2 - 0.65 * camera, 1);
    }

    for (const a of members) {
      if (a === 0) continue;
      const group = groups.find(g => Math.abs(g.parameter - a) < 1e-6);
      /* outer members leave the centre curve a beat later: one gesture, not a fan */
      const k = smooth(clamp01((spreadAll - 0.16 * Math.abs(a)) / 0.84));
      if (k <= 0.02) continue;
      const alphaIn = clamp01(k / 0.35);
      const pts: Pt[] = [];
      for (let i = 0; i <= SAMPLES; i++) pts.push(frame(familyPoint(i / SAMPLES, a, k, idle)));
      const active = group && s.hovered === group.id;
      const width = group ? 1.9 : a === 0 ? 1.55 : 0.8;
      const alpha = s.hovered
        ? (active ? 0.98 : 0.2)
        : group ? 0.86 : a === 0 ? 0.8 : 0.3 + 0.08 * (1 - Math.abs(a));
      stroke(pts, active ? RED : INK, width + (active ? 0.45 : 0), alphaIn * alpha);
      if (group && notesIn > 0.65) paths.current.set(group.id, pts);
    }

    /* the marked points, their names, their leaders */
    type Anchor = { id: string; index: number; parameter: number; symbol: string; mx: number; my: number; sx: number; sy: number; card: HTMLElement; cw: number; ch: number };
    const anchors: Anchor[] = [];

    groups.forEach((group, index) => {
      const card = cardRefs.current[index];
      if (!card) return;
      const q = group.parameter < 0 ? 0.06 : 0.94;
      const [mx, my] = frame(familyPoint(q, group.parameter, 1, idle));
      const [sx, sy] = frame(familyPoint(q, group.parameter, 1, 0));

      ctx.globalAlpha = notesIn;
      ctx.beginPath();
      ctx.arc(mx, my, s.hovered === group.id ? 5 : 3.7, 0, Math.PI * 2);
      ctx.fillStyle = RED;
      ctx.fill();
      ctx.font = `italic ${compact ? 13 : 14}px Georgia, serif`;
      ctx.fillStyle = "#6c4a41";
      ctx.fillText(group.symbol, mx + 9, my - 9);
      ctx.globalAlpha = 1;

      /* a small traveller drifting along the marked curve */
      if (notesIn >= 1) {
        const t = ((age * 0.035 + index * 0.43) % 0.9) + 0.04;
        const [dx, dy] = frame(familyPoint(t, group.parameter, 1, idle));
        ctx.beginPath();
        ctx.arc(dx, dy, 2.1, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.globalAlpha = s.hovered === group.id ? 0.12 : 0.48;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      anchors.push({ id: group.id, index, parameter: group.parameter, symbol: group.symbol, mx, my, sx, sy, card, cw: card.offsetWidth, ch: card.offsetHeight });
    });

    if (compact) {
      for (const a of anchors) {
        a.card.style.opacity = String(notesIn);
        a.card.style.pointerEvents = notesIn > 0.7 ? "auto" : "none";
      }
    } else {
      /* negative parameters read on the left, positive on the right; cards stack
         without overlapping, so a third or fourth direction has a place to sit */
      const columns: [Anchor[], "left" | "right"][] = [
        [anchors.filter(a => a.parameter <= 0).sort((a, b) => a.sy - b.sy), "left"],
        [anchors.filter(a => a.parameter > 0).sort((a, b) => a.sy - b.sy), "right"],
      ];
      for (const [list, side] of columns) {
        let floor = side === "left" ? 210 : 92;
        for (const a of list) {
          const left = side === "left"
            ? Math.max(32, Math.min(w - a.cw - 32, a.sx - a.cw - 110))
            : Math.max(32, Math.min(w - a.cw - 32, a.sx + 58));
          const wanted = side === "left" ? a.sy - a.ch - 22 : a.sy - 24;
          const top = Math.min(Math.max(wanted, floor), h - a.ch - 26);
          a.card.style.left = `${left}px`;
          a.card.style.top = `${top}px`;
          a.card.style.opacity = String(notesIn);
          a.card.style.pointerEvents = notesIn > 0.7 ? "auto" : "none";
          floor = top + a.ch + 14;

          if (notesIn > 0) {
            const edge: Pt = side === "left" ? [left + a.cw + 13, top + a.ch - 14] : [left - 13, top + 22];
            const on = s.hovered === a.id;
            stroke([[a.mx, a.my], edge], on ? RED : "#8a8275", 0.8, notesIn * (on ? 0.8 : 0.5));
          }
        }
      }
    }

    if (phaseRef.current) {
      const text = age < 2.4 ? "a family opens in space" : "different directions, a common thread";
      if (phaseRef.current.textContent !== text) phaseRef.current.textContent = text;
    }
    root.dataset.animationTime = age.toFixed(2);
    if (notesIn >= 0.7 && !clock.current.ready) { clock.current.ready = true; setReady(true); }
  }, [groups]);

  const canvasRef = useStage(draw);

  const pick = (event: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    let best: string | null = null, bestD = 24;
    for (const [id, pts] of paths.current) {
      let d = Infinity;
      for (const p of pts) d = Math.min(d, Math.hypot(p[0] - x, p[1] - y));
      if (d < bestD) { bestD = d; best = id; }
    }
    return best;
  };

  const openGroup = (group: { id: string; title: string; notes: Talk[] }) => setPanel({
    id: group.id,
    title: group.title,
    kicker: `${String(group.notes.length).padStart(2, "0")} ${group.notes.length === 1 ? "note" : "notes"} · personal notes`,
    notes: group.notes,
  });

  const replay = () => {
    clock.current = { age: 0, last: 0, ready: false };
    setReady(false); setPaused(false); setHovered(null);
    setPanel(null);
  };

  return (
    <div className="family-scroll">
      <div className="family-scene" ref={rootRef} data-ready={ready} data-paused={paused} data-reduced-motion={reduced}>
        <div className="family-heading">
          <p className="family-eyebrow">talks &amp; notes</p>
          <h1>A family of notes</h1>
          <p className="family-intro">Select a marked curve. Follow a direction.</p>
        </div>

        {import.meta.env.DEV && (
        <div className="family-controls">
          <button type="button" onClick={replay} aria-label="Replay the transformation">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7a6 6 0 1 1-.2 5M4 3v4h4" /></svg>replay
          </button>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={() => setPaused(v => !v)} aria-pressed={paused} disabled={reduced}>{paused ? "resume" : "pause"}</button>
        </div>
        )}

        <div className="family-art">
          <canvas
            ref={canvasRef}
            className="family-canvas"
            aria-label="An animated family of curves with two marked members leading to the Birational geometry and VMRT notes."
            onPointerMove={event => { if (event.pointerType === "mouse") setHovered(pick(event)); }}
            onPointerLeave={() => setHovered(null)}
            onClick={event => {
              const id = pick(event);
              const group = groups.find(g => g.id === id);
              if (group?.notes.length) openGroup(group);
            }}
            style={{ cursor: hovered ? "pointer" : "default" }}
          />
        </div>

        {groups.map((group, index) => (
          <section
            key={group.id}
            ref={el => { cardRefs.current[index] = el; }}
            className={`family-card family-card-${group.id}`}
            data-active={hovered === group.id}
            onPointerEnter={() => setHovered(group.id)}
            onPointerLeave={() => setHovered(null)}
          >
            <div className="family-card-topline">
              <span className="family-card-symbol">{group.symbol}<sub>α</sub></span>
              <span>{String(group.notes.length).padStart(2, "0")} {group.notes.length === 1 ? "note" : "notes"}</span>
            </div>
            <h2>{group.title}</h2>
            <p className="family-card-subtitle">{group.subtitle}</p>
            <div className="family-card-rule" />
            <div className="family-card-actions">
              <button type="button" onClick={() => group.notes.length && openGroup(group)} disabled={!ready}>
                Open the notes <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ))}

        <footer className="family-footer">
          <span className="family-phase" ref={phaseRef}>a family opens in space</span>
          <p>
            <span className="family-formula">{"{ C"}<sub>α</sub>{" }"}</span>
            <sub>α ∈ Δ</sub> — a family of notes
          </p>
          <button type="button" onClick={onBack}>← back to the resolution</button>
        </footer>

        <Card
          open={!!panel}
          onClose={() => setPanel(null)}
          title={panel?.title ?? ""}
          kicker={panel?.kicker}
        >
          {panel && panel.notes.length > 1 && (
            <ul className="family-note-list">
              {panel.notes.map(note => (
                <li key={note.id ?? note.title} className="family-note-row">
                  <span className="family-note-row-title">{note.title}</span>
                  {note.href
                    ? <a href={note.href} target="_blank" rel="noreferrer">read ↗</a>
                    : <span className="family-note-row-pending">pending</span>}
                </li>
              ))}
            </ul>
          )}
          {panel && panel.notes.length === 1 && (
            <>
              <p className="mb-5">{panel.notes[0].abstract}</p>
              {panel.notes[0].href
                ? <a href={panel.notes[0].href} target="_blank" rel="noreferrer" className="family-card-link">Read the notes <span aria-hidden="true">↗</span></a>
                : <p className="family-pdf-pending">This PDF has not been uploaded yet.</p>}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
