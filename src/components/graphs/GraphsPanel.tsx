import { useEffect, useMemo, useState, type FC } from "react";
import { Tooltip, ReferenceLine } from "recharts";
import { useSimulatorStore } from "../../store/simulatorStore";
import {
  isDigitalHall,
  type SensingAxis,
  type SensorPackageInfo,
} from "../../types/simulation";
import { useShallow } from "zustand/shallow";
import {
  chartXLabel,
  chartXModeForMotion,
  chartXUnit,
  type FieldSample,
} from "../../lib/fieldMath";
import { ChartTooltip } from "./ChartPrimitives";
import { ExportButtons } from "./ExportButtons";
import { PositionRunner } from "./PositionRunner";
import { ResponseCharts } from "./ResponseCharts";
import type { SeriesKey } from "./seriesMeta";
import { resolveOperateSupply } from "../../lib/sensitivityDisplay";
import type { SimulationExportContext } from "../../lib/exportSimulation";

interface GraphPanelProps {
  dataset: FieldSample[];
  sensorPackage?: SensorPackageInfo;
}

function defaultVisibility(
  axis: SensingAxis,
  digital: boolean,
): Record<SeriesKey, boolean> {
  return {
    bx: axis === "x",
    by: axis === "y",
    bz: axis === "z",
    btotal: true,
    vout: true,
    code: digital,
  };
}

export const GraphPanel: FC<GraphPanelProps> = ({ dataset, sensorPackage }) => {
  const {
    playing,
    currentFrame,
    frameCount,
    motionType,
    fps,
    duration,
    magnet,
    animation,
    supplyVdd,
    presetLabel,
  } = useSimulatorStore(
    useShallow((s) => ({
      playing: s.playing,
      currentFrame: s.currentFrame,
      frameCount: s.simulation?.frames.length ?? 0,
      motionType: s.animation.type,
      fps: s.simulation?.fps ?? s.fps,
      duration: s.simulation?.duration ?? s.duration,
      magnet: s.magnet,
      animation: s.animation,
      supplyVdd: s.supplyVdd,
      presetLabel: s.activePreset?.label ?? null,
    })),
  );

  const { setCurrentFrame, pause } = useSimulatorStore.getState();
  const digital = isDigitalHall(sensorPackage);
  const sensingAxis: SensingAxis = sensorPackage?.sensingAxis ?? "z";
  const xMode = chartXModeForMotion(motionType);
  const xUnit = chartXUnit(xMode);
  const supply = sensorPackage
    ? resolveOperateSupply(sensorPackage, supplyVdd)
    : 5;

  const exportContext: SimulationExportContext | null =
    dataset.length > 0 && sensorPackage
      ? {
          dataset,
          sensorPackage,
          xMode,
          fps,
          duration,
          magnet,
          animation,
          supplyV: supply,
          presetLabel,
        }
      : null;

  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>(() =>
    defaultVisibility(sensingAxis, digital),
  );

  // When package type/axis changes, re-focus Chart 2 on the sensing axis.
  useEffect(() => {
    setVisible(defaultVisibility(sensingAxis, digital));
  }, [sensingAxis, digital, sensorPackage?.id]);

  const lastFrame = Math.max(frameCount - 1, 0);
  const done = !playing && currentFrame >= lastFrame && dataset.length > 0;
  const vref = sensorPackage?.vref ?? (digital ? null : supply / 2);

  const liveIdx = dataset.length
    ? Math.min(Math.round(currentFrame), dataset.length - 1)
    : 0;
  const liveRow = dataset[liveIdx];
  const playheadX = liveRow?.x ?? 0;

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
      content={<ChartTooltip xUnit={xUnit} />}
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
        x={playheadX}
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
          {sensorPackage && (
            <div
              className="font-mono text-xs mt-1 truncate"
              style={{ color: "var(--muted-foreground)" }}
              title={`${sensorPackage.partNumber} · ${sensorPackage.hallType}${
                digital && sensorPackage.bopTypGauss != null
                  ? ` · Bop ${sensorPackage.bopTypGauss} G`
                  : ` · sense ${sensingAxis.toUpperCase()}`
              }`}
            >
              {sensorPackage.partNumber} · {sensorPackage.hallType}
              {digital &&
                sensorPackage.bopTypGauss != null &&
                ` · Bop ${sensorPackage.bopTypGauss} G`}
              {!digital && ` · sense ${sensingAxis.toUpperCase()}`}
            </div>
          )}
        </div>

        <ExportButtons context={exportContext} />

        {dataset.length > 0 ? (
          <PositionRunner
            dataset={dataset}
            currentFrame={currentFrame}
            lastFrame={lastFrame}
            xUnit={xUnit}
            xLabel={chartXLabel(xMode)}
            playing={playing}
            sensingAxis={sensingAxis}
            digital={digital}
            onSeek={seek}
          />
        ) : null}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
        {dataset.length === 0 ? (
          <div
            className="rounded-sm p-6 flex flex-col items-center justify-center gap-2 text-center min-h-[16rem]"
            style={{
              border: "1px dashed var(--border)",
              backgroundColor:
                "color-mix(in srgb, var(--background) 70%, transparent)",
            }}
          >
            <div
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              No simulation yet
            </div>
            <p
              className="font-mono text-sm leading-relaxed max-w-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              Run Simulate to plot magnetic field and device output vs{" "}
              {xUnit === "deg" ? "magnet angle" : "displacement"}.
            </p>
          </div>
        ) : (
          <ResponseCharts
            dataset={dataset}
            xMode={xMode}
            visible={visible}
            onToggle={toggle}
            sharedTooltip={sharedTooltip}
            playhead={playhead}
            partNumber={sensorPackage?.partNumber}
            supply={supply}
            vref={vref}
            digital={digital}
            bopGauss={digital ? (sensorPackage?.bopTypGauss ?? null) : null}
            brpGauss={digital ? (sensorPackage?.brpTypGauss ?? null) : null}
            sensingAxis={sensingAxis}
            summary={summary}
            showSummary={done}
          />
        )}
      </div>
    </aside>
  );
};
