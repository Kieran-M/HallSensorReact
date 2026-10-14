import type { ReactNode } from "react";
import { SERIES_META, THRESHOLD_META, type SeriesKey } from "./seriesMeta";

export function ChartTooltip({
  active,
  payload,
  label,
  xUnit = "mm",
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
  }>;
  label?: number | string;
  xUnit?: string;
}) {
  if (!active || !payload?.length) return null;

  const xVal =
    typeof label === "number"
      ? label.toFixed(xUnit === "deg" ? 1 : 2)
      : label;

  return (
    <div
      className="rounded-sm px-3 py-2 shadow-lg pointer-events-none"
      style={{
        backgroundColor: "color-mix(in srgb, var(--card) 96%, transparent)",
        border: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="font-mono text-sm uppercase tracking-widest mb-1.5"
        style={{ color: "var(--accent)" }}
      >
        {xVal} {xUnit}
      </div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const key = (entry.dataKey ?? entry.name ?? "") as SeriesKey;
          const meta = SERIES_META[key];
          const unit = meta?.unit ?? "";
          const value =
            typeof entry.value === "number"
              ? key === "code"
                ? String(Math.round(entry.value))
                : entry.value.toFixed(key === "vout" ? 4 : 2)
              : "—";
          return (
            <div
              key={String(entry.dataKey ?? entry.name)}
              className="flex items-center justify-between gap-6 font-mono text-sm"
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color ?? meta?.color }}
                />
                <span style={{ color: "var(--muted-foreground)" }}>
                  {meta?.label ?? entry.name}
                </span>
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {value}
                {unit ? ` ${unit}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SeriesToggle({
  seriesKey,
  active,
  onToggle,
}: {
  seriesKey: SeriesKey;
  active: boolean;
  onToggle: () => void;
}) {
  const meta = SERIES_META[seriesKey];
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      title={active ? `Hide ${meta.label}` : `Show ${meta.label}`}
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-xs uppercase tracking-wide transition-all hover:opacity-100 hover:brightness-110"
      style={{
        border: "1px solid",
        borderColor: active ? meta.color : "var(--border)",
        backgroundColor: active
          ? `color-mix(in srgb, ${meta.color} 18%, transparent)`
          : "transparent",
        color: active ? "var(--foreground)" : "var(--muted-foreground)",
        opacity: active ? 1 : 0.55,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: active ? meta.color : "var(--muted-foreground)",
        }}
      />
      {meta.label}
    </button>
  );
}

/** Non-interactive legend chip for digital Bop / Brp reference lines. */
export function ThresholdKey({
  kind,
  valueGauss,
}: {
  kind: keyof typeof THRESHOLD_META;
  valueGauss: number;
}) {
  const meta = THRESHOLD_META[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-xs tracking-wide"
      title={`${meta.fullLabel}: ${valueGauss} G`}
      style={{
        border: "1px solid",
        borderColor: `color-mix(in srgb, ${meta.color} 65%, var(--border))`,
        backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        color: "var(--foreground)",
      }}
    >
      <span
        aria-hidden
        className="inline-block w-3.5 h-[2px] shrink-0"
        style={{
          background: `repeating-linear-gradient(90deg, ${meta.color} 0 3px, transparent 3px 5px)`,
        }}
      />
      <span className="uppercase" style={{ color: meta.color }}>
        {meta.label}
      </span>
      <span
        className="tabular-nums normal-case"
        style={{ color: "var(--muted-foreground)" }}
      >
        {valueGauss.toFixed(Number.isInteger(valueGauss) ? 0 : 1)} G
      </span>
    </span>
  );
}

/** SVG label for Recharts ReferenceLine — pill with name + value. */
export function ThresholdLineLabel({
  viewBox,
  kind,
  valueGauss,
  offsetY = 0,
}: {
  viewBox?: { x?: number; y?: number; width?: number };
  kind: keyof typeof THRESHOLD_META;
  valueGauss: number;
  offsetY?: number;
}) {
  const meta = THRESHOLD_META[kind];
  const x = (viewBox?.x ?? 0) + (viewBox?.width ?? 0) - 6;
  const y = (viewBox?.y ?? 0) + offsetY;
  const text = `${meta.label} ${valueGauss.toFixed(Number.isInteger(valueGauss) ? 0 : 1)} G`;
  const w = Math.max(78, text.length * 7.2 + 16);
  const h = 18;
  return (
    <g transform={`translate(${x - w}, ${y - h - 2})`} style={{ pointerEvents: "none" }}>
      <rect
        width={w}
        height={h}
        rx={2}
        fill="color-mix(in srgb, var(--card) 92%, transparent)"
        stroke={meta.color}
        strokeWidth={1}
      />
      <text
        x={w / 2}
        y={h / 2 + 0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={meta.color}
        fontFamily="ui-monospace, monospace"
        fontSize={10}
        fontWeight={600}
      >
        {text}
      </text>
    </g>
  );
}

export function GraphCard({
  title,
  subtitle,
  toggles,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  toggles?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-sm p-4 flex flex-col gap-3"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--background)",
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <div
            className="font-mono text-[12px] uppercase tracking-wide truncate"
            style={{ color: "var(--accent)" }}
            title={title}
          >
            {title}
          </div>
          <div
            className="font-mono text-xs mt-0.5 leading-snug break-words"
            style={{ color: "var(--muted-foreground)" }}
            title={subtitle}
          >
            {subtitle}
          </div>
        </div>
        {actions ? (
          <div className="shrink-0 max-w-full">{actions}</div>
        ) : null}
      </div>
      {toggles && <div className="flex flex-wrap gap-1.5">{toggles}</div>}
      {children}
    </div>
  );
}

export function ChartZoomControls({
  zoomed,
  onZoomIn,
  onZoomOut,
  onPanLeft,
  onPanRight,
  onReset,
}: {
  zoomed: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onReset: () => void;
}) {
  const btn =
    "font-mono text-xs uppercase tracking-wide px-1.5 py-1 rounded-sm border transition-colors disabled:opacity-35 disabled:cursor-not-allowed";
  const style = {
    borderColor: "var(--border)",
    color: "var(--muted-foreground)",
    backgroundColor: "transparent",
  } as const;

  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Chart zoom">
      <button type="button" className={btn} style={style} onClick={onPanLeft} disabled={!zoomed} title="Pan left" aria-label="Pan left">
        ←
      </button>
      <button type="button" className={btn} style={style} onClick={onZoomOut} title="Zoom out" aria-label="Zoom out">
        −
      </button>
      <button type="button" className={btn} style={style} onClick={onZoomIn} title="Zoom in" aria-label="Zoom in">
        +
      </button>
      <button type="button" className={btn} style={style} onClick={onPanRight} disabled={!zoomed} title="Pan right" aria-label="Pan right">
        →
      </button>
      <button
        type="button"
        className={btn}
        style={{
          ...style,
          color: zoomed ? "var(--accent)" : "var(--muted-foreground)",
          borderColor: zoomed
            ? "color-mix(in srgb, var(--accent) 55%, var(--border))"
            : "var(--border)",
        }}
        onClick={onReset}
        disabled={!zoomed}
        title="Reset zoom"
        aria-label="Reset zoom"
      >
        Reset
      </button>
    </div>
  );
}
