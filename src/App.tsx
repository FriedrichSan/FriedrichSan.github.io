import { useState } from "react";
import { site } from "@/config";
import { NodeScene } from "@/scenes/NodeScene";
import { BlowupScene } from "@/scenes/BlowupScene";
import { CircleScene } from "@/scenes/CircleScene";
import { CubicScene } from "@/scenes/CubicScene";

type Scene = "node" | "blowup" | "circle" | "cubic";

function App() {
  const [scene, setScene] = useState<Scene>("node");
  const [resolvedSeen, setResolvedSeen] = useState(false);

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
        <div className="scene-fade h-full w-full">
          {scene === "node" && <NodeScene onBlowup={() => setScene("blowup")} />}
          {scene === "blowup" && (
            <BlowupScene
              startResolved={resolvedSeen}
              onResolved={() => setResolvedSeen(true)}
              onPapers={() => setScene("circle")}
              onTalks={() => setScene("cubic")}
              onBack={() => setScene("node")}
            />
          )}
          {scene === "circle" && <CircleScene onBack={() => setScene("blowup")} />}
          {scene === "cubic" && <CubicScene onBack={() => setScene("blowup")} />}
        </div>
      </main>
    </div>
  );
}

export default App;
