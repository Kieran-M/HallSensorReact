import { lazy, Suspense } from "react";
import { useSimulatorStore } from "./store/simulatorStore";
import SelectionView from "./components/simulator/scene/SelectionView";
import { ThemeProvider } from "./components/ui/Theme";

/** Design + 3D + charts — loaded only after leaving the presets view. */
const DesignPage = lazy(() =>
  import("./pages/DesignPage").then((m) => ({ default: m.DesignPage })),
);

function WorkspaceFallback() {
  return (
    <div className="h-dvh flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div
        className="font-mono text-[13px] uppercase tracking-widest px-4 py-3 rounded-sm"
        style={{
          border: "1px solid var(--border)",
          color: "var(--accent)",
          backgroundColor:
            "color-mix(in srgb, var(--card) 90%, transparent)",
        }}
      >
        Loading workspace…
      </div>
    </div>
  );
}

/**
 * Shell for standalone or host-site embed. View switching is Zustand-only —
 * never browser history / path routing (required for ESM embed on the main site).
 */
export default function App() {
  const view = useSimulatorStore((s) => s.view);

  return (
    <ThemeProvider>
      {view === "presets" ? (
        <SelectionView />
      ) : (
        <Suspense fallback={<WorkspaceFallback />}>
          <DesignPage />
        </Suspense>
      )}
    </ThemeProvider>
  );
}
