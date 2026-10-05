import { useState } from 'react'
import { useSimulatorStore, type MagnetParams, type MagnetShape } from '../../store/simulatorStore'
import NumberInput from './inputs/NumberInput'
import { ThemeToggle } from './Theme'
import { SelectInput } from './inputs/SelectInput'

const SHAPES = [
  { label: "Bar", value: "bar" },
  { label: "Diametric Cylinder", value: "diametric_cylinder" },
  { label: "Axial Cylinder", value: "axial_cylinder" },
  { label: "Diametric Ring", value: "ring" },
  { label: "Axial Ring", value: "axial_ring" },
  { label: "Sphere", value: "sphere" },
];

const MATERIALS = [
  { label: "NdFeB", value: "NdFeB" },
  { label: "SmCo", value: "SmCo" },
  { label: "Ferrite", value: "Ferrite" },
  { label: "AlNiCo", value: "AlNiCo" },
];

const GRADES = [
  { label: "N35", value: "N35" },
  { label: "N42", value: "N42" },
  { label: "N52", value: "N52" },
];

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-[var(--border)] rounded-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--muted)]/30 hover:bg-[var(--muted)]/60 transition-colors cursor-pointer"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">{title}</span>
        <svg
          viewBox="0 0 12 12"
          className="w-3 h-3 text-[var(--muted-foreground)] transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-4 space-y-3 border-t border-[var(--border)]">
          {children}
        </div>
      )}
    </div>
  )
}

function XYZGroup({
  label,
  xVal, yVal, zVal,
  onX, onY, onZ,
  min, max, step, unit,
}: {
  label: string
  xVal: number; yVal: number; zVal: number
  onX: (v: number) => void; onY: (v: number) => void; onZ: (v: number) => void
  min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {[['X', xVal, onX], ['Y', yVal, onY], ['Z', zVal, onZ]].map(([axis, val, handler]) => (
          <div key={axis as string} className="flex flex-col gap-1">
            <span className="font-mono text-[9px] text-[var(--muted-foreground)] text-center">{axis as string}{unit ? ` (${unit})` : ''}</span>
            <input
              type="number"
              value={val as number}
              min={min}
              max={max}
              step={step ?? 0.1}
              onChange={e => (handler as (v: number) => void)(parseFloat(e.target.value) || 0)}
              className="w-full font-mono text-[11px] bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] rounded-sm px-2 py-1.5 text-center focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Geometry fields by shape ──────────────────────────────────────────────────

function GeometryFields({ params, setParams }: { params: MagnetParams; setParams: (p: Partial<MagnetParams>) => void }) {
  const p = (key: keyof MagnetParams) => (v: number) => setParams({ [key]: v })

  switch (params.shape) {
    case 'diametric_cylinder':
    case 'axial_cylinder':
      return (
        <>
          <NumberInput label="Diameter" value={params.diameter} onChange={p('diameter')} min={0.01} max={2} step={0.01} unit="m" />
          <NumberInput label="Height" value={params.height} onChange={p('height')} min={0.01} max={2} step={0.01} unit="m" />
        </>
      )
    case 'ring':
      return (
        <>
          <NumberInput label="Outer Dia." value={params.diameter} onChange={p('diameter')} min={0.01} max={2} step={0.01} unit="m" />
          <NumberInput label="Height" value={params.height} onChange={p('height')} min={0.01} max={2} step={0.01} unit="m" />
          <NumberInput label="Wall Thick." value={params.length} onChange={p('length')} min={0.005} max={0.5} step={0.005} unit="m" />
        </>
      )
    case 'bar':
      return (
        <>
          <NumberInput label="Length" value={params.length} onChange={p('length')} min={0.01} max={4} step={0.01} unit="m" />
          <NumberInput label="Width" value={params.width} onChange={p('width')} min={0.01} max={2} step={0.01} unit="m" />
          <NumberInput label="Height" value={params.height} onChange={p('height')} min={0.01} max={2} step={0.01} unit="m" />
        </>
      )
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Setup() {
  const [open, setOpen] = useState<Record<string, boolean>>({
    spec: true,
    geometry: true,
    motion: false,
  })

  function toggle(key: string) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      {/* Control Panel */}
      <aside className="w-80 border-l border-[var(--border)] bg-[var(--card)] flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Control Panel</div>
          <div className="font-mono text-sm text-[var(--foreground)] font-semibold">Magnet Parameters</div>
        </div>

        <div className="p-4 space-y-3 flex-1">

          {/* ── Specification ── */}
          <Accordion title="Specification" open={open.spec} onToggle={() => toggle('spec')}>
            <SelectInput<MagnetShape>
              label="Shape"
              value={params.shape}
              options={SHAPES.values().map(s => s.value)}
              onChange={v => setParams({ shape: v })}
            />
            <NumberInput
              label="No. of Poles"
              value={params.poles}
              onChange={p('poles')}
              min={1} max={64} step={1}
            />
            <SelectInput<MagnetMaterial>
              label="Material"
              value={params.material}
              options={MATERIALS}
              onChange={()=> 0}
            />
            <SelectInput<MagnetGrade>
              label="Grade"
              value={"test"}
              options={availableGrades}
              onChange={v => setParams({ grade: v })}
            />
          </Accordion>

          {/* ── Geometry ── */}
          <Accordion title="Geometry" open={open.geometry} onToggle={() => toggle('geometry')}>
            <GeometryFields params={params} setParams={setParams} />
          </Accordion>

          {/* ── Motion ── */}
          <Accordion title="Motion" open={open.motion} onToggle={() => toggle('motion')}>
            <XYZGroup
              label="Start Position"
              xVal={params.startX} yVal={params.startY} zVal={params.startZ}
              onX={p('startX')} onY={p('startY')} onZ={p('startZ')}
              min={-4} max={4} step={0.1} unit="m"
            />
            <XYZGroup
              label="End Position"
              xVal={params.endX} yVal={params.endY} zVal={params.endZ}
              onX={p('endX')} onY={p('endY')} onZ={p('endZ')}
              min={-4} max={4} step={0.1} unit="m"
            />
            <XYZGroup
              label="Start Angle"
              xVal={params.startRotX} yVal={params.startRotY} zVal={params.startRotZ}
              onX={p('startRotX')} onY={p('startRotY')} onZ={p('startRotZ')}
              min={-180} max={180} step={1} unit="°"
            />
            <XYZGroup
              label="End Angle"
              xVal={params.endRotX} yVal={params.endRotY} zVal={params.endRotZ}
              onX={p('endRotX')} onY={p('endRotY')} onZ={p('endRotZ')}
              min={-180} max={180} step={1} unit="°"
            />
          </Accordion>

        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={() => setView("simulate")}
            className="w-full font-mono text-[11px] uppercase tracking-widest bg-[var(--accent)] text-[var(--accent-foreground)] py-3 rounded-sm hover:bg-[var(--accent-hover)] transition-colors font-semibold"
          >
            ▶ Simulate
          </button>
          <p className="font-mono text-[9px] text-[var(--muted-foreground)] text-center mt-2 uppercase tracking-widest">
            {params.shape} · {params.material} {params.grade}
          </p>
        </div>
      </aside>
    </>
  )
}