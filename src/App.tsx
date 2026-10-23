import { useState } from "react";
import { site } from "@/config";
import { NodeScene } from "@/scenes/NodeScene";
import { BlowupScene } from "@/scenes/BlowupScene";
import { CircleScene } from "@/scenes/CircleScene";
import { FamilyScene } from "@/scenes/FamilyScene";
import { Cursor } from "@/components/Cursor";

type Scene = "node" | "blowup" | "circle" | "family";

const chapter: Record<Scene, { num: string; mark: string; label: string }> = {
  node: { num: "I", mark: "01", label: "Singularity" },
  blowup: { num: "II", mark: "02", label: "Resolution" },
  circle: { num: "IIIa", mark: "03", label: "Papers" },
  family: { num: "IIIb", mark: "03", label: "Notes" },
};

const getInitialScene = (): Scene => {
  const standalonePreview = import.meta.env.VITE_FAMILY_PREVIEW === "true";
  if (!import.meta.env.DEV && !standalonePreview) return "node";

  const requested = new URLSearchParams(window.location.search).get("scene");
  if (requested === "family" || requested === "blowup") return requested;
  return standalonePreview ? "family" : "node";
};

function App() {
  const initialScene = getInitialScene();
  const [scene, setScene] = useState<Scene>(initialScene);
  const [resolvedSeen, setResolvedSeen] = useState(
    initialScene === "family" || initialScene === "blowup"
  );

  return (
    <div className="relative h-full w-full">
      {/* header */}
      <header className={`site-header pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-baseline justify-between px-6 py-4 ${scene === "family" ? "family-header" : ""}`}>
        <button
          onClick={() => setScene("node")}
          className="site-name pointer-events-auto text-stone-800 hover:text-red-800"
        >
          {site.name}
        </button>
        <div className="flex items-baseline gap-5">
          <div className="site-tagline hidden sm:block">
            a homepage, resolved by blow-up
          </div>
          <a
            href="/minimal.html"
            className="site-link minimal-link pointer-events-auto"
          >
            Minimal Model Version
          </a>
        </div>
      </header>

      {scene !== "family" && (
        <div className="scene-watermark" aria-hidden="true">
          {chapter[scene].mark}
        </div>
      )}

      <main className="relative z-10 h-full w-full" key={scene}>
        <div className={scene === "family" ? "h-full w-full" : "scene-fade h-full w-full"}>
          {scene === "node" && <NodeScene onBlowup={() => setScene("blowup")} />}
          {scene === "blowup" && (
            <BlowupScene
              startResolved={resolvedSeen}
              onResolved={() => setResolvedSeen(true)}
              onPapers={() => setScene("circle")}
              onTalks={() => setScene("family")}
              onBack={() => setScene("node")}
            />
          )}
          {scene === "circle" && <CircleScene onBack={() => setScene("blowup")} />}
          {scene === "family" && <FamilyScene onBack={() => setScene("blowup")} />}
        </div>
      </main>

      <Cursor />

      <div className="scene-chrome" aria-hidden="true">
        <div className="scene-chapter">
          <span className="scene-num">{chapter[scene].num}</span>
          <span className="scene-rule" />
          <span>{chapter[scene].label}</span>
        </div>
        <div className="scene-colophon">
          <span>YunKai Ji</span>
          <span>MMXXVI</span>
        </div>
      </div>
    </div>
  );
}

export default App;
