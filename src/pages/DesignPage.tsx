import { useEffect, useMemo, useState } from "react";
import { DesignView } from "../components/simulator/scene/DesignView";
import { AxisGizmoOverlay } from "../components/simulator/AxisGizmoOverlay";
import { SidePanel } from "../components/ui/SidePanel";
import { GraphPanel } from "../components/graphs/GraphsPanel";
import { PlaybackHud } from "../components/simulator/PlaybackHud";
import { HallSimBrand } from "../components/brand/DiodesMark";
import { ApiStatusPill } from "../components/ui/ApiStatusPill";
import { ThemeToggle } from "../components/ui/Theme";
import { useSimulatorStore } from "../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import { framesToDataset } from "../lib/fieldMath";

type MobilePane = "scene" | "graphs";

/**
 * Shared workspace for design + results. The 3D Canvas stays mounted when
 * Simulate completes — only the side panel / HUD swap — so there is no flicker.
 */
export function DesignPage() {
  const {
    view,
    setView,
    activePreset,
    animationType,
    simulation,
    fps,
    pause,
    clearFrames,
    setMode,
    magnet,
  } = useSimulatorStore(
    useShallow((s) => ({
      view: s.view,
      setView: s.setView,
      activePreset: s.activePreset,
      animationType: s.animation.type,
      simulation: s.simulation,
      fps: s.fps,
      pause: s.pause,
      clearFrames: s.clearFrames,
      setMode: s.setMode,
      magnet: s.magnet,
    })),
  );

  const isResults = view === "results";
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobilePane, setMobilePane] = useState<MobilePane>("scene");
  const [isLg, setIsLg] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true,
  );

  useEffect(() => {
    if (isResults) setMobilePane("scene");
  }, [isResults]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLg(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const dataset = useMemo(
    () =>
      simulation
        ? framesToDataset(
            simulation.frames,
            simulation.fps || fps,
            animationType,
          )
        : [],
    [simulation, fps, animationType],
  );

  const handleBack = () => {
    if (isResults) {
      pause();
      clearFrames();
      setMode("edit");
      setView("design");
      return;
    }
    setView("presets");
  };

  /** Mobile tab only — desktop always shows both panes side by side. */
  const mobileSceneOn = !isResults || mobilePane === "scene";
  const mobileGraphsOn = isResults && mobilePane === "graphs";
  const sceneActive = !isResults || isLg || mobileSceneOn;
  const graphsAriaHidden = isResults && !isLg && !mobileGraphsOn;
  const sceneAriaHidden = isResults && !isLg && !mobileSceneOn;

  return (
    <div className="h-dvh bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 z-20 bg-[var(--background)]/90">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleBack}
            className="shrink-0 font-mono text-[12px] uppercase tracking-wide text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {isResults ? "← Setup" : "← Back"}
          </button>
          <div className="w-px h-4 bg-[var(--border)] shrink-0" />
          <div className="min-w-0 overflow-hidden">
            <HallSimBrand compact />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 flex-wrap justify-end">
          {isResults && (
            <div
              className="flex lg:hidden items-center rounded-sm p-0.5"
              style={{ border: "1px solid var(--border)" }}
              role="tablist"
              aria-label="Mobile workspace"
            >
              {(
                [
                  { id: "scene" as const, label: "Scene" },
                  { id: "graphs" as const, label: "Graphs" },
                ] as const
              ).map((tab) => {
                const active = mobilePane === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMobilePane(tab.id)}
                    className={[
                      "font-mono text-xs uppercase tracking-wide px-2 py-1 rounded-sm transition-colors",
                      active
                        ? "text-[var(--accent)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                    style={
                      active
                        ? {
                            backgroundColor:
                              "color-mix(in srgb, var(--accent) 22%, transparent)",
                          }
                        : undefined
                    }
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="hidden md:flex items-center gap-3 min-w-0">
            {!isResults && (
              <>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-xs uppercase tracking-wide text-[var(--muted-foreground)] shrink-0">
                    Preset
                  </span>
                  <span
                    className="font-mono text-[12px] text-[var(--foreground)] border border-[var(--border)] px-2 py-0.5 rounded-sm max-w-[9rem] truncate"
                    title={activePreset?.label ?? "Custom"}
                  >
                    {activePreset?.label ?? "Custom"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    Motion
                  </span>
                  <span className="font-mono text-[12px] text-[var(--foreground)]">
                    {animationType}
                  </span>
                </div>
              </>
            )}
            {isResults && simulation?.sensorPackage && (
              <span
                className="font-mono text-[12px] border border-[var(--border)] px-2 py-0.5 rounded-sm max-w-[8rem] truncate"
                title={simulation.sensorPackage.description}
              >
                {simulation.sensorPackage.partNumber}
              </span>
            )}
            {isResults && (
              <span
                className="font-mono text-[12px] border border-[var(--border)] px-2 py-0.5 rounded-sm max-w-[7rem] truncate"
                title={magnet.shape}
              >
                {magnet.shape}
              </span>
            )}
            <span className="font-mono text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              {isResults ? "Results" : "Setup"}
            </span>
          </div>

          <ApiStatusPill compact />
          <ThemeToggle />

          {!isResults && (
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              className="lg:hidden font-mono text-xs uppercase tracking-wide border border-[var(--border)] px-2 py-1 rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
            >
              {panelOpen ? "Close" : "Panel"}
            </button>
          )}
        </div>
      </header>

      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/*
          Scene pane MUST stay `relative` at every breakpoint so PlaybackHud /
          axis gizmo absolute children are contained to the canvas column —
          never the full workspace (which caused overlap with graphs on resize).
        */}
        <div
          className={[
            "relative flex-1 min-h-0 min-w-0 overflow-hidden hs-pane-fade",
            isResults
              ? [
                  "max-lg:absolute max-lg:inset-0",
                  mobileSceneOn
                    ? "max-lg:opacity-100 max-lg:visible max-lg:z-[1]"
                    : "max-lg:opacity-0 max-lg:invisible max-lg:pointer-events-none max-lg:z-0",
                ].join(" ")
              : "",
          ].join(" ")}
          aria-hidden={sceneAriaHidden}
        >
          <div className="absolute inset-0">
            <DesignView active={sceneActive} />
          </div>
          {/* Outside DesignView so fade/vignette stacking cannot hide it */}
          {sceneActive && <AxisGizmoOverlay />}
          {isResults && dataset.length > 0 && (
            <PlaybackHud dataset={dataset} />
          )}
        </div>

        {isResults ? (
          <div
            className={[
              "min-h-0 min-w-0 flex flex-col overflow-hidden hs-pane-fade",
              "bg-[var(--card)] border-l border-[var(--border)]",
              /* Mobile: full-bleed stack over scene */
              "max-lg:absolute max-lg:inset-0 max-lg:border-l-0",
              mobileGraphsOn
                ? "max-lg:opacity-100 max-lg:visible max-lg:z-[2]"
                : "max-lg:opacity-0 max-lg:invisible max-lg:pointer-events-none max-lg:z-0",
              /* Desktop: fixed-width sibling — never absolute, never overlaps scene */
              "lg:relative lg:z-auto lg:opacity-100 lg:visible lg:pointer-events-auto",
              "lg:w-[28rem] xl:w-[32rem] 2xl:w-[36rem] min-[2000px]:w-[40rem] lg:shrink-0",
            ].join(" ")}
            aria-hidden={graphsAriaHidden}
          >
            <GraphPanel
              dataset={dataset}
              sensorPackage={simulation?.sensorPackage}
            />
          </div>
        ) : (
          <>
            <div
              className={[
                "lg:relative lg:translate-y-0 lg:flex lg:shrink-0",
                "fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out",
                panelOpen ? "translate-y-0" : "translate-y-full",
                "lg:w-80 xl:w-96 2xl:w-[28rem] min-[2000px]:w-[32rem] w-full",
                "max-h-[70vh] lg:max-h-none",
                "border-t lg:border-t-0 lg:border-l border-[var(--border)]",
                "bg-[var(--background)] overflow-y-auto",
              ].join(" ")}
            >
              <SidePanel />
            </div>
            {panelOpen && (
              <button
                type="button"
                aria-label="Close panel"
                className="fixed inset-0 z-20 bg-black/40 lg:hidden border-0 p-0"
                onClick={() => setPanelOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
