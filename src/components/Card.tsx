import React, { useEffect } from "react";
import { RED } from "@/lib/stage";

interface CardProps {
  open: boolean;
  onClose: () => void;
  kicker?: string;
  title: string;
  children: React.ReactNode;
}

// manuscript-style modal card
export const Card: React.FC<CardProps> = ({ open, onClose, kicker, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="card-pop relative max-h-[82vh] w-full max-w-lg overflow-y-auto border border-stone-800/25 bg-[#fbf7ee] p-7 shadow-[6px_8px_0_rgba(43,41,37,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-3 font-serif text-xl italic text-stone-500 hover:text-stone-900"
          aria-label="close"
        >
          ×
        </button>
        {kicker && (
          <div className="mb-1 font-serif text-sm italic" style={{ color: RED }}>
            {kicker}
          </div>
        )}
        <h2 className="mb-4 font-serif text-2xl leading-snug text-stone-900">{title}</h2>
        <div className="font-serif text-[15px] leading-relaxed text-stone-700">{children}</div>
      </div>
    </div>
  );
};
