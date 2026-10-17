import { useState } from "react";
import { site } from "@/config";
import { NodeScene } from "@/scenes/NodeScene";
import { BlowupScene } from "@/scenes/BlowupScene";
import { CircleScene } from "@/scenes/CircleScene";
import { FamilyScene } from "@/scenes/FamilyScene";

type Scene = "node" | "blowup" | "circle" | "family";

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
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-baseline justify-between px-6 py-4">
        <button
          onClick={() => setScene("node")}
          className="pointer-events-auto font-serif text-lg italic text-stone-800 hover:text-red-800"
        >
          {site.name}
        </button>
        <div className="font-serif text-xs italic text-stone-400">
          a homepage, resolved by blow-up
        </div>
      </header>

      <main className="h-full w-full" key={scene}>
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
    </div>
  );
}

export default App;
