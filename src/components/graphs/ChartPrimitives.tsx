import type { ReactNode } from "react";
import { SERIES_META, type SeriesKey } from "./seriesMeta";

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
        className="font-mono text-[13px] uppercase tracking-widest mb-1.5"
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
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[13px] uppercase tracking-widest transition-all hover:opacity-100 hover:brightness-110"
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

export function GraphCard({
  title,
  subtitle,
  toggles,
  children,
}: {
  title: string;
  subtitle: string;
  toggles?: ReactNode;
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className="font-mono text-[13px] uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            {title}
          </div>
          <div
            className="font-mono text-[13px] mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            {subtitle}
          </div>
        </div>
      </div>
      {toggles && <div className="flex flex-wrap gap-1.5">{toggles}</div>}
      {children}
    </div>
  );
}
