import { DesignView } from "../components/simulator/scene/DesignView";
import { SidePanel } from "../components/ui/SidePanel";
import { useSimulatorStore } from "../store/simulatorStore";

export function DesignPage() {
  const setView = useSimulatorStore((s) => s.setView);
  return (

    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-3 flex items-center justify-between z-20 bg-[var(--background)]/90">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('presets')}
            className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-[var(--border)]" />
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[var(--accent)]/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">HallSim</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)]">Preset</span>
            <span className="font-mono text-[10px] text-[var(--foreground)] border border-[var(--border)] px-2 py-0.5 rounded-sm">
              test label
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)]">Step</span>
            <span className="font-mono text-[10px] text-[var(--foreground)]">2 / 3</span>
          </div>
        </div>
      </header>
      <div className="flex flex-row max-h-screen h-dvh">
        <div className="flex-1">
          <DesignView />
        </div>

        <div className="w-100">
          <SidePanel />
        </div>
      </div>
    </div>
  );
}