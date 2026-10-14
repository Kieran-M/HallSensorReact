export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <label
        className="font-mono text-sm uppercase tracking-wide text-[var(--muted-foreground)] min-w-0 flex-1 leading-snug pr-2"
        title={label}
      >
        {label}
      </label>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-[5rem] font-mono text-sm tabular-nums bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] rounded-sm px-2 py-1.5 text-right focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        {unit ? (
          <span className="font-mono text-sm text-[var(--muted-foreground)] min-w-[2rem] text-left">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default NumberInput;
