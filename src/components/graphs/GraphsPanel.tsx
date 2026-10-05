import type { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useSimulatorStore } from "../../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import type { FieldSample } from "../../lib/fieldMath";

// ── Shared styles ─────────────────────────────────────────────────────────────

const tooltipStyle = (): React.CSSProperties => ({
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "2px",
  fontFamily: "monospace",
  fontSize: "10px",
  color: "var(--foreground)",
});

const AXIS_STYLE = {
  fontFamily: "monospace",
  fontSize: 9,
  fill: "var(--muted-foreground)",
};

// ── GraphCard ─────────────────────────────────────────────────────────────────

function GraphCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-sm p-4"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      <div className="mb-3">
        <div
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          {title}
        </div>
        <div
          className="font-mono text-[9px] mt-0.5"
          style={{ color: "var(--muted-foreground)" }}
        >
          {subtitle}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface GraphPanelProps {
  dataset: FieldSample[];
}

export const GraphPanel: FC<GraphPanelProps> = ({ dataset }) => {
  const { playing, currentTime, duration } = useSimulatorStore(
    useShallow((s) => ({
      playing: s.playing,
      currentTime: s.currentTime,
      duration: s.duration,
    }))
  );

  const done = !playing && currentTime >= duration;
  const showMarker = playing || done;

  return (
    <aside
      className="w-96 flex flex-col overflow-y-auto"
      style={{
        borderLeft: "1px solid var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* Panel header */}
      <div
        className="p-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
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

      {/* Charts */}
      <div className="p-4 space-y-4">
        {/* Bx · By · Bz */}
        <GraphCard
          title="Magnetic Field Components"
          subtitle="Bx · By · Bz  [mT]"
        >
          <ResponsiveContainer width="100%" height={140}>
            <LineChart
              data={dataset}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--chart-grid)"
              />
              <XAxis
                dataKey="t"
                tick={AXIS_STYLE}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "s",
                  position: "insideBottomRight",
                  offset: 0,
                  style: AXIS_STYLE,
                }}
              />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle()} />
              {showMarker && (
                <ReferenceLine
                  x={currentTime}
                  stroke="var(--accent)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              )}
              <Line
                type="monotone"
                dataKey="bx"
                stroke="#f87171"
                strokeWidth={1.5}
                dot={false}
                name="Bx"
              />
              <Line
                type="monotone"
                dataKey="by"
                stroke="var(--accent)"
                strokeWidth={1.5}
                dot={false}
                name="By"
              />
              <Line
                type="monotone"
                dataKey="bz"
                stroke="#a78bfa"
                strokeWidth={1.5}
                dot={false}
                name="Bz"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex gap-3 mt-1">
            {(
              [
                ["Bx", "#f87171"],
                ["By", "var(--accent)"],
                ["Bz", "#a78bfa"],
              ] as const
            ).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-3" style={{ backgroundColor: color, height: 2 }} />
                <span
                  className="font-mono text-[9px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </GraphCard>

        {/* |B| total */}
        <GraphCard title="Total Field Magnitude" subtitle="|B|  [mT]">
          <ResponsiveContainer width="100%" height={110}>
            <LineChart
              data={dataset}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--chart-grid)"
              />
              <XAxis
                dataKey="t"
                tick={AXIS_STYLE}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle()} />
              {showMarker && (
                <ReferenceLine
                  x={currentTime}
                  stroke="var(--accent)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              )}
              <Line
                type="monotone"
                dataKey="btotal"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                name="|B|"
              />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Vout */}
        <GraphCard
          title="Output Voltage"
          subtitle="Vout  [V]  — ratiometric 3.3 V supply"
        >
          <ResponsiveContainer width="100%" height={110}>
            <LineChart
              data={dataset}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--chart-grid)"
              />
              <XAxis
                dataKey="t"
                tick={AXIS_STYLE}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 3.3]}
                tick={AXIS_STYLE}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle()} />
              {showMarker && (
                <ReferenceLine
                  x={currentTime}
                  stroke="var(--accent)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              )}
              <ReferenceLine
                y={1.65}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="vout"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
                name="Vout"
              />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Summary */}
        {done && (
          <div
            className="rounded-sm p-4"
            style={{
              border: "1px solid rgba(52,211,153,0.2)",
              backgroundColor: "rgba(52,211,153,0.05)",
            }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-3"
              style={{ color: "#34d399" }}
            >
              Simulation Complete
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Peak |B|",
                  value: `${Math.max(...dataset.map((d) => d.btotal)).toFixed(1)} mT`,
                },
                {
                  label: "Min |B|",
                  value: `${Math.min(...dataset.map((d) => d.btotal)).toFixed(1)} mT`,
                },
                {
                  label: "Vout max",
                  value: `${Math.max(...dataset.map((d) => d.vout)).toFixed(3)} V`,
                },
                {
                  label: "Vout min",
                  value: `${Math.min(...dataset.map((d) => d.vout)).toFixed(3)} V`,
                },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="font-mono text-[9px] uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {s.label}
                  </div>
                  <div
                    className="font-mono text-[11px] mt-0.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};