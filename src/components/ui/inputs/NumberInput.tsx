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
    <div className="flex items-center justify-between gap-3">
      <label className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)] shrink-0">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 font-mono text-sm bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] rounded-sm px-2 py-1.5 text-right focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        {unit && (
          <span className="font-mono text-xs text-[var(--muted-foreground)] w-5 shrink-0">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default NumberInput;
