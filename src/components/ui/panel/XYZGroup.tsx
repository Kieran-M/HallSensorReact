export function XYZGroup({
  label,
  xVal,
  yVal,
  zVal,
  onX,
  onY,
  onZ,
  min,
  max,
  step,
  unit,
}: {
  label: string
  xVal: number
  yVal: number
  zVal: number
  onX: (v: number) => void
  onY: (v: number) => void
  onZ: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ['X', xVal, onX],
            ['Y', yVal, onY],
            ['Z', zVal, onZ],
          ] as const
        ).map(([axis, val, handler]) => (
          <div key={axis} className="flex flex-col gap-1">
            <span className="font-mono text-xs text-[var(--muted-foreground)] text-center">
              {axis}
              {unit ? ` (${unit})` : ''}
            </span>
            <input
              type="number"
              value={val}
              min={min}
              max={max}
              step={step ?? 0.1}
              onChange={(e) => handler(parseFloat(e.target.value) || 0)}
              className="w-full font-mono text-sm bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] rounded-sm px-2 py-1.5 text-center focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
