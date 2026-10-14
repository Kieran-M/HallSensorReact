import { useMemo } from "react";
import type { FieldSample } from "../../lib/fieldMath";

interface PositionRunnerProps {
  dataset: FieldSample[];
  currentFrame: number;
  lastFrame: number;
  xUnit: string;
  xLabel: string;
  playing: boolean;
  sensingAxis: string;
  digital: boolean;
  onSeek: (frame: number) => void;
}

function Sparkline({
  values,
  progress,
}: {
  values: number[];
  progress: number;
}) {
  const path = useMemo(() => {
    if (values.length < 2) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const w = 100;
    const h = 100;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / span) * (h - 8) - 4;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [values]);

  if (!path) return null;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeOpacity="0.45"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={progress * 100}
        y1="0"
        x2={progress * 100}
        y2="100"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeOpacity="0.85"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function PositionRunner({
  dataset,
  currentFrame,
  lastFrame,
  xUnit,
  xLabel,
  playing,
  sensingAxis,
  digital,
  onSeek,
}: PositionRunnerProps) {
  const frame = Math.min(Math.round(currentFrame), lastFrame);
  const row = dataset[frame];
  const first = dataset[0];
  const last = dataset[dataset.length - 1];
  const progress = lastFrame > 0 ? frame / lastFrame : 0;

  const xFmt = (v: number) =>
    `${v.toFixed(xUnit === "deg" ? 1 : 2)} ${xUnit}`;

  const step = (delta: number) => {
    onSeek(Math.max(0, Math.min(lastFrame, frame + delta)));
  };

  const btn =
    "font-mono text-xs uppercase tracking-wide px-2 py-1 rounded-sm border transition-colors disabled:opacity-35 disabled:cursor-not-allowed";

  return (
    <div
      className="rounded-sm p-3 space-y-2.5"
      style={{
        border: "1px solid var(--border)",
        backgroundColor:
          "color-mix(in srgb, var(--background) 55%, transparent)",
      }}
      role="region"
      aria-label="Chart playhead"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between min-w-0">
        <div className="min-w-0">
          <div
            className="font-mono text-xs uppercase tracking-wide"
            style={{ color: "var(--accent)" }}
          >
            Chart playhead
          </div>
          <p
            className="font-mono text-xs mt-1 leading-snug"
            style={{ color: "var(--muted-foreground)" }}
          >
            Scrub {xLabel.toLowerCase()} · sense {sensingAxis.toUpperCase()}
            {digital ? " · digital" : ""}
          </p>
        </div>
        <div className="sm:text-right min-w-0">
          <div
            className="font-mono text-sm font-semibold tabular-nums"
            style={{ color: "var(--foreground)" }}
          >
            {row ? xFmt(row.x) : "—"}
          </div>
          <div
            className="font-mono text-xs tracking-wide mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            {playing ? "Playing" : "Paused"} · {frame}/{lastFrame}
          </div>
        </div>
      </div>

      <div
        className="relative h-10 rounded-sm overflow-hidden"
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <Sparkline
          values={dataset.map((d) => d.btotal)}
          progress={progress}
        />
        <input
          type="range"
          min={0}
          max={lastFrame || 0}
          step={1}
          value={frame}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="hs-scrubber hs-scrubber-overlay absolute inset-0 w-full h-full"
          aria-label={`Scrub ${xLabel}`}
          style={{ margin: 0 }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 font-mono text-xs tabular-nums min-w-0">
        <span
          className="truncate"
          style={{ color: "var(--muted-foreground)" }}
        >
          {first ? xFmt(first.x) : "—"}
        </span>
        <span
          className="shrink-0 hidden xs:inline sm:inline"
          style={{ color: "var(--muted-foreground)" }}
        >
          |B|
        </span>
        <span
          className="truncate text-right"
          style={{ color: "var(--muted-foreground)" }}
        >
          {last ? xFmt(last.x) : "—"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          className={btn}
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
          disabled={frame <= 0}
          onClick={() => step(-1)}
          title="Previous frame"
        >
          ← Step
        </button>
        <button
          type="button"
          className={btn}
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
          disabled={frame >= lastFrame}
          onClick={() => step(1)}
          title="Next frame"
        >
          Step →
        </button>
        <button
          type="button"
          className={btn}
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
          disabled={frame === 0}
          onClick={() => onSeek(0)}
          title="Jump to start"
        >
          Start
        </button>
        <button
          type="button"
          className={btn}
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
          disabled={frame >= lastFrame}
          onClick={() => onSeek(lastFrame)}
          title="Jump to end"
        >
          End
        </button>
      </div>

      {row && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {(
            [
              { label: "Bx", value: `${row.bx.toFixed(1)} G`, color: "#f87171" },
              {
                label: "By",
                value: `${row.by.toFixed(1)} G`,
                color: "var(--accent)",
              },
              { label: "Bz", value: `${row.bz.toFixed(1)} G`, color: "#a78bfa" },
              {
                label: "|B|",
                value: `${row.btotal.toFixed(1)} G`,
                color: "#34d399",
              },
              {
                label: "Vout",
                value: `${row.vout.toFixed(3)} V`,
                color: "#fbbf24",
              },
              ...(digital
                ? [
                    {
                      label: "Code",
                      value: String(row.code),
                      color: "#94a3b8",
                    },
                  ]
                : []),
            ] as const
          ).map((cell) => (
            <div
              key={cell.label}
              className="rounded-sm px-2 py-1.5"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
              }}
            >
              <div
                className="font-mono text-[9px] uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                {cell.label}
              </div>
              <div
                className="font-mono text-[12px] font-semibold tabular-nums mt-0.5"
                style={{ color: cell.color }}
              >
                {cell.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
