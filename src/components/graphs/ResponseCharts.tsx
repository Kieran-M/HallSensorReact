import type { ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ChartXMode, FieldSample } from "../../lib/fieldMath";
import { chartXLabel, chartXUnit } from "../../lib/fieldMath";
import { GraphCard, SeriesToggle } from "./ChartPrimitives";
import {
  CHART_MARGIN,
  SERIES_META,
  VALUE_Y_AXIS_PROPS,
  motionXAxisProps,
  type SeriesKey,
} from "./seriesMeta";

interface ResponseChartsProps {
  dataset: FieldSample[];
  xMode: ChartXMode;
  visible: Record<SeriesKey, boolean>;
  onToggle: (key: SeriesKey) => void;
  sharedTooltip: ReactNode;
  playhead: ReactNode;
  partNumber?: string;
  supply: number;
  vref: number | null;
  digital?: boolean;
  summary: {
    peakB: number;
    minB: number;
    vmax: number;
    vmin: number;
  } | null;
  showSummary: boolean;
}

/** Field + device-output charts per SRS §10. */
export function ResponseCharts({
  dataset,
  xMode,
  visible,
  onToggle,
  sharedTooltip,
  playhead,
  partNumber,
  supply,
  vref,
  digital = false,
  summary,
  showSummary,
}: ResponseChartsProps) {
  const xAxis = motionXAxisProps(chartXUnit(xMode));
  const xTitle = chartXLabel(xMode);

  return (
    <>
      <GraphCard
        title="Magnetic Field Density"
        subtitle={`vs ${xTitle} · Flux density (G)`}
        toggles={
          <>
            <SeriesToggle
              seriesKey="bx"
              active={visible.bx}
              onToggle={() => onToggle("bx")}
            />
            <SeriesToggle
              seriesKey="by"
              active={visible.by}
              onToggle={() => onToggle("by")}
            />
            <SeriesToggle
              seriesKey="bz"
              active={visible.bz}
              onToggle={() => onToggle("bz")}
            />
            <SeriesToggle
              seriesKey="btotal"
              active={visible.btotal}
              onToggle={() => onToggle("btotal")}
            />
          </>
        }
      >
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dataset} syncId="hallsim" margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--chart-grid)" />
            <XAxis {...xAxis} />
            <YAxis {...VALUE_Y_AXIS_PROPS} width={48} unit=" G" />
            {sharedTooltip}
            {playhead}
            {visible.bx && (
              <Line
                type="monotone"
                dataKey="bx"
                stroke={SERIES_META.bx.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name="Bx"
                isAnimationActive={false}
              />
            )}
            {visible.by && (
              <Line
                type="monotone"
                dataKey="by"
                stroke={SERIES_META.by.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name="By"
                isAnimationActive={false}
              />
            )}
            {visible.bz && (
              <Line
                type="monotone"
                dataKey="bz"
                stroke={SERIES_META.bz.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name="Bz"
                isAnimationActive={false}
              />
            )}
            {visible.btotal && (
              <Line
                type="monotone"
                dataKey="btotal"
                stroke={SERIES_META.btotal.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name="|B|"
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </GraphCard>

      <GraphCard
        title="Device Output"
        subtitle={`vs ${xTitle} · ${partNumber ?? "sensor"} · ${supply} V${digital ? " · digital" : ""}`}
        toggles={
          <>
            <SeriesToggle
              seriesKey="vout"
              active={visible.vout}
              onToggle={() => onToggle("vout")}
            />
            <SeriesToggle
              seriesKey="code"
              active={visible.code}
              onToggle={() => onToggle("code")}
            />
          </>
        }
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dataset} syncId="hallsim" margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--chart-grid)" />
            <XAxis {...xAxis} />
            <YAxis
              yAxisId="v"
              domain={[0, supply]}
              {...VALUE_Y_AXIS_PROPS}
              width={44}
              unit=" V"
            />
            {visible.code && (
              <YAxis
                yAxisId="code"
                orientation="right"
                {...VALUE_Y_AXIS_PROPS}
                width={40}
              />
            )}
            {sharedTooltip}
            {playhead}
            {vref != null && (
              <ReferenceLine
                yAxisId="v"
                y={vref}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
            )}
            {visible.vout && (
              <Line
                yAxisId="v"
                type={digital ? "stepAfter" : "monotone"}
                dataKey="vout"
                stroke={SERIES_META.vout.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name="Vout"
                isAnimationActive={false}
              />
            )}
            {visible.code && (
              <Line
                yAxisId="code"
                type="stepAfter"
                dataKey="code"
                stroke={SERIES_META.code.color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                name="Code"
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </GraphCard>

      {showSummary && summary && (
        <div
          className="rounded-sm p-4"
          style={{
            border: "1px solid rgba(52,211,153,0.25)",
            backgroundColor: "rgba(52,211,153,0.06)",
          }}
        >
          <div
            className="font-mono text-xs uppercase tracking-widest mb-3"
            style={{ color: "#34d399" }}
          >
            Simulation Complete
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Peak |B|", value: `${summary.peakB.toFixed(1)} G` },
              { label: "Min |B|", value: `${summary.minB.toFixed(1)} G` },
              { label: "Vout max", value: `${summary.vmax.toFixed(3)} V` },
              { label: "Vout min", value: `${summary.vmin.toFixed(3)} V` },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="font-mono text-xs uppercase tracking-widest"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {s.label}
                </div>
                <div
                  className="font-mono text-[12px] mt-0.5"
                  style={{ color: "var(--foreground)" }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
