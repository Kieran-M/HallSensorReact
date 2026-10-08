import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";

import { Magnet } from "../MagnetMesh";
import { MotionPathGhost } from "../MotionPathGhost";
import { Sensor } from "../Sensor";
import { PersistentOrbitControls } from "../PersistentOrbitControls";
import { SimulationPlayback } from "../SimulatorPlayback";

import { useSimulatorStore } from "../../../store/simulatorStore";
import { useTheme } from "../../ui/Theme";
import { mmToWorld } from "../../../lib/utils";

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

interface DesignViewProps {
  /**
   * When false (mobile Graphs tab), pause the rAF loop so the hidden WebGL
   * layer does not keep the GPU busy. Stays mounted to avoid remount flicker.
   */
  active?: boolean;
}

/** Shared 3D viewport for design + results (never remounted on Simulate). */
export function DesignView({ active = true }: DesignViewProps) {
  const magnet = useSimulatorStore((s) => s.magnet);
  const sensor = useSimulatorStore((s) => s.sensor);
  const sensorPackageId = useSimulatorStore((s) => s.sensorPackageId);
  const sensorCatalog = useSimulatorStore((s) => s.sensorCatalog);
  const simulationPackage = useSimulatorStore((s) => s.simulation?.sensorPackage);
  const cameraView = useSimulatorStore((s) => s.cameraView);
  const isResults = useSimulatorStore((s) => s.view === "results");
  const simulating = useSimulatorStore((s) => s.simulating);
  const { theme } = useTheme();

  const activePackage =
    simulationPackage ??
    sensorCatalog.find((p) => p.id === sensorPackageId) ??
    null;

  const { canvasBg, gridCell, gridSection } = useMemo(
    () => ({
      canvasBg: readCssVar("--canvas", "#0c1f30"),
      gridCell: readCssVar("--grid-cell", "#4a7fa3"),
      gridSection: readCssVar("--grid-section", "#8ec5e0"),
    }),
    [theme],
  );

  return (
    <div className="relative w-full h-full bg-[var(--background)] hs-canvas-fade-in">
      <div className="absolute inset-0">
        <Canvas
          frameloop={active ? "always" : "demand"}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          camera={{
            position: cameraView.position,
            fov: 50,
            near: 0.001,
            far: 1000,
          }}
          style={{
            width: "100%",
            height: "100%",
            background: canvasBg,
          }}
        >
          <color attach="background" args={[canvasBg]} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[1, 2, 1]} intensity={2.5} />
          <directionalLight position={[-1, 1, -1]} intensity={1} />

          <SimulationPlayback />
          <MotionPathGhost />
          <Magnet config={magnet} />
          <Sensor
            position={[
              mmToWorld(sensor.x),
              mmToWorld(sensor.y),
              mmToWorld(sensor.z),
            ]}
            outline={activePackage?.packageOutline ?? "sot23"}
            hallType={activePackage?.hallType ?? "linear"}
          />

          <Grid
            infiniteGrid
            args={[1, 1]}
            cellSize={0.005}
            sectionSize={0.05}
            cellThickness={theme === "dark" ? 0.85 : 0.65}
            sectionThickness={theme === "dark" ? 1.35 : 1.15}
            fadeDistance={4.5}
            fadeStrength={1.75}
            fadeFrom={0.35}
            cellColor={gridCell}
            sectionColor={gridSection}
          />

          <PersistentOrbitControls />
        </Canvas>
      </div>

      <div
        className="hs-canvas-vignette absolute inset-0 z-[1] pointer-events-none"
        aria-hidden
      />

      <div
        className={[
          "absolute inset-0 z-[2] pointer-events-none transition-opacity duration-300",
          simulating ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background:
            "color-mix(in srgb, var(--background) 45%, transparent)",
        }}
        aria-hidden={!simulating}
      >
        {simulating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="font-mono text-[13px] uppercase tracking-widest px-3 py-2 rounded-sm backdrop-blur-sm"
              style={{
                color: "var(--accent)",
                border: "1px solid var(--border)",
                backgroundColor:
                  "color-mix(in srgb, var(--card) 90%, transparent)",
              }}
            >
              Computing field…
            </div>
          </div>
        )}
      </div>

      {!isResults && (
        <>
          <div className="absolute top-4 left-4 z-[3] pointer-events-none space-y-1">
            <div className="font-mono text-xs uppercase tracking-widest text-(--muted-foreground) bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
              Drag to orbit · Scroll to zoom
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-[3] pointer-events-none flex flex-col gap-2 max-w-[min(100%,28rem)]">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
                <div className="w-2 h-2 rounded-sm bg-[#c0392b]" />
                <span className="font-mono text-xs text-(--muted-foreground)">
                  N pole
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
                <div className="w-2 h-2 rounded-sm bg-[#2980b9]" />
                <span className="font-mono text-xs text-(--muted-foreground)">
                  S pole
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full border border-(--accent)" />
                <span className="font-mono text-xs text-(--muted-foreground)">
                  Sensor
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
                <div
                  className="w-3 h-0.5 rounded-full"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, #c0d0e0 0 3px, transparent 3px 5px)",
                  }}
                />
                <span className="font-mono text-xs text-(--muted-foreground)">
                  Path
                </span>
              </div>
            </div>
            <div className="bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
              <span className="font-mono text-[10px] text-(--muted-foreground) leading-relaxed">
                B-field from Magpylib · idealised magnet model
              </span>
            </div>
          </div>
        </>
      )}

      {isResults && (
        <div className="absolute bottom-4 left-4 z-[3] pointer-events-none">
          <div className="bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
            <span className="font-mono text-[10px] text-(--muted-foreground)">
              B-field from Magpylib · idealised magnet model
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
