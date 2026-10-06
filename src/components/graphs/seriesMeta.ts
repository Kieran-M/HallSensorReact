export type SeriesKey = "bx" | "by" | "bz" | "btotal" | "vout" | "code";

export const SERIES_META: Record<
  SeriesKey,
  { label: string; color: string; unit: string }
> = {
  bx: { label: "Bx", color: "#f87171", unit: "G" },
  by: { label: "By", color: "var(--accent)", unit: "G" },
  bz: { label: "Bz", color: "#a78bfa", unit: "G" },
  btotal: { label: "|B|", color: "#34d399", unit: "G" },
  vout: { label: "Vout", color: "#fbbf24", unit: "V" },
  code: { label: "Code", color: "#94a3b8", unit: "" },
};

export const AXIS_TICK = {
  fontFamily: "ui-monospace, monospace",
  fontSize: 13,
  fill: "var(--muted-foreground)",
};

/** Motion X axis (displacement mm or angle deg) — SRS §10. */
export function motionXAxisProps(unit: string) {
  return {
    dataKey: "x" as const,
    type: "number" as const,
    domain: ["dataMin", "dataMax"] as [string, string],
    tick: AXIS_TICK,
    tickLine: false,
    axisLine: false,
    tickFormatter: (v: number | string) => Number(v).toFixed(unit === "deg" ? 0 : 1),
    label: {
      value: unit === "deg" ? "Magnet Angle (deg)" : "Magnet Displacement (mm)",
      position: "insideBottom" as const,
      offset: -2,
      style: {
        fill: "var(--muted-foreground)",
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
      },
    },
  };
}

/** @deprecated Prefer motionXAxisProps — kept for any time-axis callers. */
export const TIME_X_AXIS_PROPS = {
  dataKey: "t",
  type: "number" as const,
  domain: ["dataMin", "dataMax"] as [string, string],
  tick: AXIS_TICK,
  tickLine: false,
  axisLine: false,
  tickFormatter: (v: number | string) => Number(v).toFixed(1),
};

/** Props shared by every chart's value (Y) axis. Spread onto <YAxis />. */
export const VALUE_Y_AXIS_PROPS = {
  tick: AXIS_TICK,
  tickLine: false,
  axisLine: false,
};

export const CHART_MARGIN = { top: 8, right: 12, left: 0, bottom: 18 };
