import { useEffect } from "react";

/**
 * A small trailing ring for fine pointers. It echoes the marked points in
 * the drawings and widens over anything interactive. Touch devices and
 * reduced-motion users never see it.
 */
export function Cursor() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = document.querySelector<HTMLDivElement>(".cursor-ring");
    if (!el) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let visible = false;
    let active = false;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        x = targetX;
        y = targetY;
        visible = true;
        el.style.opacity = "1";
      }
      const hit = !!(event.target as Element | null)?.closest?.(
        "a, button, [data-cursor='active']",
      );
      if (hit !== active) {
        active = hit;
        el.dataset.active = String(active);
      }
    };

    const loop = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(loop);
    };

    const hide = () => {
      el.style.opacity = "0";
      visible = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, []);

  return <div className="cursor-ring" aria-hidden="true" />;
}
