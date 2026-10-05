import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { Magnet } from "../MagnetMesh";
import { Sensor } from "../Sensor";
import { SimulationPlayback } from "../SimulatorPlayback";
import { useSimulatorStore } from "../../../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import { memo } from "react";
import { mmToWorld } from "../../../lib/utils";
import type { FieldSample } from "../../../lib/fieldMath";

interface ResultsViewProps {
  dataset: FieldSample[];
}

export const ResultsView = memo(({ dataset }: ResultsViewProps) => {
  const { magnet, sensor, view, playing, currentTime, duration } =
    useSimulatorStore(
      useShallow((s) => ({
        magnet: s.magnet,
        sensor: s.sensor,
        view: s.view,
        playing: s.playing,
        currentTime: s.currentTime,
        duration: s.duration,
      }))
    );

  const { play, pause, setCurrentTime } = useSimulatorStore.getState();

  const progress = duration > 0 ? currentTime / duration : 0;
  const done = !playing && currentTime >= duration;
  const liveRow = dataset[Math.min(Math.round(progress * 120), 120)];

  function handlePlay() {
    if (currentTime >= duration) setCurrentTime(0);
    play();
  }

  function handleReset() {
    pause();
    setCurrentTime(0);
  }

  if (view !== "results") return null;

  return (
    <div className="relative flex-1 min-h-0">
      <Canvas
        frameloop="always"
        camera={{ position: [0.3, 0.3, 0.3], fov: 50, near: 0.001, far: 1000 }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[1, 2, 1]} intensity={2.5} />
        <directionalLight position={[-1, 1, -1]} intensity={1} />

        <SimulationPlayback />

        <Magnet config={magnet} />
        <Sensor
          position={[
            mmToWorld(sensor.x),
            mmToWorld(sensor.y),
            mmToWorld(sensor.z),
          ]}
          scale={2}
        />

        <Grid
          args={[1, 1]}
          cellSize={0.01}
          sectionSize={0.1}
          fadeDistance={5}
        />
        <OrbitControls makeDefault minDistance={0.001} />
      </Canvas>

      {/* Live readout overlay */}
      {(playing || done) && liveRow && (
        <div
          className="absolute top-4 right-4 rounded-sm p-3 space-y-1.5 pointer-events-none backdrop-blur-sm"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--background) 85%, transparent)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="font-mono text-[9px] uppercase tracking-widest mb-2"
            style={{ color: "var(--accent)" }}
          >
            Live Output
          </div>
          {[
            { label: "Bx", value: `${liveRow.bx} mT`, color: "#f87171" },
            { label: "By", value: `${liveRow.by} mT`, color: "var(--accent)" },
            { label: "Bz", value: `${liveRow.bz} mT`, color: "#a78bfa" },
            { label: "|B|", value: `${liveRow.btotal} mT`, color: "#34d399" },
            { label: "Vout", value: `${liveRow.vout} V`, color: "#fbbf24" },
          ].map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-4"
            >
              <span
                className="font-mono text-[9px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {r.label}
              </span>
              <span
                className="font-mono text-[10px] font-semibold"
                style={{ color: r.color }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Playback controls */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[min(32rem,calc(100%-2rem))]">
        <div
          className="rounded-sm p-3 shadow-lg backdrop-blur-md"
          style={{
            border: "1px solid var(--border)",
            backgroundColor:
              "color-mix(in srgb, var(--card) 95%, transparent)",
          }}
        >
          {/* Status row */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className={`h-1.5 w-1.5 rounded-full ${playing ? "animate-pulse" : ""}`}
                style={{
                  backgroundColor: playing
                    ? "var(--accent)"
                    : done
                      ? "#34d399"
                      : "var(--muted-foreground)",
                }}
              />
              <span
                className="font-mono text-[9px] uppercase tracking-widest"
                style={{
                  color: playing
                    ? "var(--accent)"
                    : done
                      ? "#34d399"
                      : "var(--muted-foreground)",
                }}
              >
                {playing
                  ? "Running"
                  : done
                    ? "Complete"
                    : currentTime > 0
                      ? "Paused"
                      : "Ready"}
              </span>
            </div>
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)" }}
            >
              {currentTime.toFixed(2)}s / {duration}s
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="mb-3 h-1 overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <div
              className="h-full transition-none rounded-full"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: "var(--accent)",
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={playing ? pause : handlePlay}
              className="min-w-24 cursor-pointer rounded-sm px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors"
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
              {playing
                ? "Ⅱ Pause"
                : currentTime > 0 && !done
                  ? "▶ Resume"
                  : "▶ Play"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer rounded-sm px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors"
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
              ■ Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});