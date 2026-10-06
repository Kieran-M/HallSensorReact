export type SeriesKey = "bx" | "by" | "bz" | "btotal" | "vout" | "code";

export const SERIES_META: Record<
  SeriesKey,
  { label: string; color: string; unit: string }
> = {
  bx: { label: "Bx", color: "#f87171", unit: "mT" },
  by: { label: "By", color: "var(--accent)", unit: "mT" },
  bz: { label: "Bz", color: "#a78bfa", unit: "mT" },
  btotal: { label: "|B|", color: "#34d399", unit: "mT" },
  vout: { label: "Vout", color: "#fbbf24", unit: "V" },
  code: { label: "Code", color: "#94a3b8", unit: "" },
};

export const AXIS_TICK = {
  fontFamily: "ui-monospace, monospace",
  fontSize: 13,
  fill: "var(--muted-foreground)",
};

/** Props shared by every chart's time (X) axis. Spread onto <XAxis />. */
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

export const CHART_MARGIN = { top: 8, right: 12, left: 0, bottom: 4 };
