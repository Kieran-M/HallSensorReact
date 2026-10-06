import { useMemo, useState, type FC } from "react";
import { Tooltip, ReferenceLine } from "recharts";
import { useSimulatorStore } from "../../store/simulatorStore";
import type { SensorPackageInfo } from "../../types/simulation";
import { useShallow } from "zustand/shallow";
import type { FieldSample } from "../../lib/fieldMath";
import { ChartTooltip } from "./ChartPrimitives";
import { ResponseCharts } from "./ResponseCharts";
import type { SeriesKey } from "./seriesMeta";

interface GraphPanelProps {
  dataset: FieldSample[];
  sensorPackage?: SensorPackageInfo;
}

export const GraphPanel: FC<GraphPanelProps> = ({ dataset, sensorPackage }) => {
  const { playing, currentFrame, currentTime, frameCount } = useSimulatorStore(
    useShallow((s) => ({
      playing: s.playing,
      currentFrame: s.currentFrame,
      currentTime: s.currentTime,
      frameCount: s.simulation?.frames.length ?? 0,
    })),
  );

  const { setCurrentFrame, pause } = useSimulatorStore.getState();

  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    bx: true,
    by: true,
    bz: true,
    btotal: true,
    vout: true,
    code: false,
  });

  const lastFrame = Math.max(frameCount - 1, 0);
  const done = !playing && currentFrame >= lastFrame && dataset.length > 0;
  const supply = sensorPackage?.supply ?? 5;
  const vref = sensorPackage?.vref ?? supply / 2;
  const playheadT = dataset.length
    ? (dataset[Math.min(Math.round(currentFrame), dataset.length - 1)]?.t ??
      currentTime)
    : currentTime;

  const summary = useMemo(() => {
    if (dataset.length === 0) return null;
    return {
      peakB: Math.max(...dataset.map((d) => d.btotal)),
      minB: Math.min(...dataset.map((d) => d.btotal)),
      vmax: Math.max(...dataset.map((d) => d.vout)),
      vmin: Math.min(...dataset.map((d) => d.vout)),
    };
  }, [dataset]);

  const toggle = (key: SeriesKey) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  const seek = (frame: number) => {
    pause();
    setCurrentFrame(frame);
  };

  const sharedTooltip = (
    <Tooltip
      content={<ChartTooltip />}
      cursor={{
        stroke: "var(--accent)",
        strokeWidth: 1,
        strokeDasharray: "4 3",
        strokeOpacity: 0.7,
      }}
      isAnimationActive={false}
      wrapperStyle={{ outline: "none", zIndex: 20 }}
    />
  );

  const playhead =
    dataset.length > 0 ? (
      <ReferenceLine
        x={playheadT}
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeDasharray="2 3"
        ifOverflow="extendDomain"
      />
    ) : null;

  return (
    <aside
      className="w-full h-full flex flex-col min-h-0 bg-[var(--card)]"
      style={{ backgroundColor: "var(--card)" }}
    >
      <div
        className="p-4 shrink-0 space-y-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <div
            className="font-mono text-xs uppercase tracking-widest mb-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Output
          </div>
          <div
            className="font-mono text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Sensor Response
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)" }}
            >
              Time runner
            </span>
            <span
              className="font-mono text-[13px]"
              style={{ color: "var(--foreground)" }}
            >
              fr {Math.round(currentFrame)} / {lastFrame}
              <span style={{ color: "var(--muted-foreground)" }}>
                {" "}
                · {playheadT.toFixed(3)} s
              </span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={lastFrame || 0}
            step={1}
            value={Math.min(Math.round(currentFrame), lastFrame)}
            disabled={dataset.length === 0}
            onChange={(e) => seek(Number(e.target.value))}
            className="hs-scrubber"
            aria-label="Scrub simulation time"
          />
          <p
            className="font-mono text-xs leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            Drag to seek · hover charts for values · click legend keys to
            show/hide
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
        <ResponseCharts
          dataset={dataset}
          visible={visible}
          onToggle={toggle}
          sharedTooltip={sharedTooltip}
          playhead={playhead}
          partNumber={sensorPackage?.partNumber}
          supply={supply}
          vref={vref}
          summary={summary}
          showSummary={done}
        />
      </div>
    </aside>
  );
};
