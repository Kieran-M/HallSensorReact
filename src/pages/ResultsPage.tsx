import { useMemo } from "react";
import { ResultsView } from "../components/simulator/scene/ResultsView";
import { GraphPanel } from "../components/graphs/GraphsPanel";
import { useSimulatorStore } from "../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import { buildDataset } from "../lib/fieldMath";

export function ResultsPage() {
  const { animation, magnet, duration } = useSimulatorStore(
    useShallow((s) => ({
      animation: s.animation,
      magnet: s.magnet,
      duration: s.duration,
    }))
  );

  const dataset = useMemo(
    () =>
      buildDataset(
        animation.startPosition,
        animation.endPosition,
        magnet.remanence,
        duration
      ),
    [animation, magnet.remanence, duration]
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Sticky header spanning full width */}
      <Header />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <ResultsView dataset={dataset} />
        <GraphPanel dataset={dataset} />
      </div>
    </div>
  );
}

function Header() {
  const { view, magnet } = useSimulatorStore(
    useShallow((s) => ({ view: s.view, magnet: s.magnet }))
  );

  const handleBack = () => {
    useSimulatorStore.setState({ view: "design" });
  };

  if (view !== "results") return null;

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 backdrop-blur-sm"
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "color-mix(in srgb, var(--background) 90%, transparent)",
      }}
    >
      {/* Left — back + logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="font-mono text-[10px] uppercase tracking-widest transition-colors"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--foreground)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--muted-foreground)")
          }
        >
          ← Back to Setup
        </button>

        <div
          className="w-px h-4"
          style={{ backgroundColor: "var(--border)" }}
        />

        <div className="flex items-center gap-3">
          <div className="w-5 h-5 relative flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 60%, transparent)" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
          </div>
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            HallSim
          </span>
        </div>
      </div>

      {/* Right — save / export / preset label / step */}
      <div className="flex items-center gap-3">
        <button
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors"
          style={{
            border: "1px solid var(--border)",
            color: "var(--muted-foreground)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor =
              "color-mix(in srgb, var(--accent) 50%, transparent)";
            e.currentTarget.style.color = "var(--foreground)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--muted-foreground)";
          }}
        >
          Export
        </button>

        <button
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent)")
          }
        >
          Save
        </button>

        <div
          className="w-px h-4"
          style={{ backgroundColor: "var(--border)" }}
        />

        <span
          className="font-mono text-[10px] border px-2 py-0.5 rounded-sm"
          style={{
            color: "var(--foreground)",
            borderColor: "var(--border)",
          }}
        >
          {magnet.shape}
        </span>

        <span
          className="font-mono text-[10px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          3 / 3
        </span>
      </div>
    </header>
  );
}