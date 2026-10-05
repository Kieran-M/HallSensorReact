import { useState } from "react";
import { DesignView } from "../components/simulator/scene/DesignView";
import { SidePanel } from "../components/ui/SidePanel";
import { useSimulatorStore } from "../store/simulatorStore";

export function DesignPage() {
  const setView = useSimulatorStore((s) => s.setView);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="h-dvh bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-[var(--border)] px-4 sm:px-6 py-3 flex items-center justify-between z-20 bg-[var(--background)]/90">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setView("presets")}
            className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-[var(--border)]" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[var(--accent)]/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
              HallSim
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Preset + Step — hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)]">
                Preset
              </span>
              <span className="font-mono text-[10px] text-[var(--foreground)] border border-[var(--border)] px-2 py-0.5 rounded-sm">
                test label
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)]">
                Step
              </span>
              <span className="font-mono text-[10px] text-[var(--foreground)]">
                2 / 3
              </span>
            </div>
          </div>

          {/* Mobile panel toggle — only visible below lg */}
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="lg:hidden font-mono text-[10px] uppercase tracking-widest border border-[var(--border)] px-2 py-1 rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {panelOpen ? "Close" : "Panel"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <DesignView />
        </div>

        {/* Side panel — always visible on lg+, toggled on smaller screens */}
        <div
          className={[
            // Mobile: slide-up overlay from bottom
            "lg:relative lg:translate-y-0 lg:flex",
            "fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out",
            panelOpen ? "translate-y-0" : "translate-y-full",
            // Sizing
            "lg:w-72 xl:w-80 w-full",
            // On mobile constrain height so it's a partial sheet
            "max-h-[60vh] lg:max-h-none",
            "border-t lg:border-t-0 lg:border-l border-[var(--border)]",
            "bg-[var(--background)] overflow-y-auto",
          ].join(" ")}
        >
          <SidePanel />
        </div>

        {/* Mobile backdrop */}
        {panelOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}