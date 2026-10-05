import { useState } from 'react'
import {
  useSimulatorStore,
  type MagnetParams,
  type MagnetShape,
} from '../../store/simulatorStore'
import NumberInput from './inputs/NumberInput'
import { SelectInput } from './inputs/SelectInput'

const SHAPES: { label: string; value: MagnetShape }[] = [
  { label: 'Bar', value: 'bar' },
  { label: 'Diametric Cylinder', value: 'diametric_cylinder' },
  { label: 'Axial Cylinder', value: 'axial_cylinder' },
  { label: 'Diametric Ring', value: 'ring' },
  { label: 'Axial Ring', value: 'axial_ring' },
  { label: 'Sphere', value: 'sphere' },
]

const MATERIALS = [
  { label: 'NdFeB', value: 'NdFeB' },
  { label: 'SmCo', value: 'SmCo' },
  { label: 'Ferrite', value: 'Ferrite' },
  { label: 'AlNiCo', value: 'AlNiCo' },
]

const GRADES = [
  { label: 'N35', value: 'N35' },
  { label: 'N42', value: 'N42' },
  { label: 'N52', value: 'N52' },
]

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
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
          {title}
        </span>
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
      <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
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
            <span className="font-mono text-[9px] text-[var(--muted-foreground)] text-center">
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
              className="w-full font-mono text-[11px] bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] rounded-sm px-2 py-1.5 text-center focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Geometry fields by shape ──────────────────────────────────────────────────

function GeometryFields({
  magnet,
  setMagnetParam,
}: {
  magnet: MagnetParams
  setMagnetParam: <K extends keyof MagnetParams>(
    key: K,
    value: MagnetParams[K],
  ) => void
}) {
  // Helper: cast key/value — safe because we only call within the correct case
  const p =
    <K extends keyof MagnetParams>(key: K) =>
    (v: number) =>
      setMagnetParam(key, v as MagnetParams[K])

  switch (magnet.shape) {
    case 'diametric_cylinder':
    case 'axial_cylinder':
      return (
        <>
          <NumberInput
            label="Outer Diameter"
            value={magnet.outerDiameter}
            onChange={p('outerDiameter' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Height"
            value={magnet.height}
            onChange={p('height' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
        </>
      )
    case 'ring':
    case 'axial_ring':
      return (
        <>
          <NumberInput
            label="Outer Diameter"
            value={magnet.outerDiameter}
            onChange={p('outerDiameter' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Inner Diameter"
            value={magnet.innerDiameter}
            onChange={p('innerDiameter' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Height"
            value={magnet.height}
            onChange={p('height' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
        </>
      )
    case 'bar':
      return (
        <>
          <NumberInput
            label="Length"
            value={magnet.length}
            onChange={p('length' as keyof MagnetParams)}
            min={0.01}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Width"
            value={magnet.width}
            onChange={p('width' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Height"
            value={magnet.height}
            onChange={p('height' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
        </>
      )
    case 'sphere':
      return (
        <NumberInput
          label="Diameter"
          value={magnet.diameter}
          onChange={p('diameter' as keyof MagnetParams)}
          min={0.01}
          max={500}
          step={0.1}
          unit="mm"
        />
      )
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

 export function SidePanel() {
  const magnet = useSimulatorStore((s) => s.magnet)
  const animation = useSimulatorStore((s) => s.animation)
  const setMagnetShape = useSimulatorStore((s) => s.setMagnetShape)
  const setMagnetParam = useSimulatorStore((s) => s.setMagnetParam)
  const setAnimationParam = useSimulatorStore((s) => s.setAnimationParam)
  const setView = useSimulatorStore((s) => s.setView)

  const [open, setOpen] = useState<Record<string, boolean>>({
    spec: true,
    geometry: true,
    motion: false,
  })

  function toggle(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <aside className="w-80 border-l border-[var(--border)] bg-[var(--card)] flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
          Control Panel
        </div>
        <div className="font-mono text-sm text-[var(--foreground)] font-semibold">
          Magnet Parameters
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        {/* ── Specification ── */}
        <Accordion
          title="Specification"
          open={open.spec}
          onToggle={() => toggle('spec')}
        >
          <SelectInput<MagnetShape>
            label="Shape"
            value={magnet.shape}
            options={SHAPES}
            onChange={(v) => setMagnetShape(v)}
          />
          <NumberInput
            label="No. of Poles"
            value={magnet.poles}
            onChange={(v) =>
              setMagnetParam('poles', v as MagnetParams['poles'])
            }
            min={1}
            max={64}
            step={1}
          />
          <SelectInput<string>
            label="Material"
            value={magnet.material}
            options={MATERIALS}
            onChange={(v) =>
              setMagnetParam('material', v as MagnetParams['material'])
            }
          />
          <SelectInput<string>
            label="Grade"
            value={magnet.materialGrade}
            options={GRADES}
            onChange={(v) =>
              setMagnetParam(
                'materialGrade',
                v as MagnetParams['materialGrade'],
              )
            }
          />
        </Accordion>

        {/* ── Geometry ── */}
        <Accordion
          title="Geometry"
          open={open.geometry}
          onToggle={() => toggle('geometry')}
        >
          <GeometryFields magnet={magnet} setMagnetParam={setMagnetParam} />
        </Accordion>

        {/* ── Motion ── */}
        <Accordion
          title="Motion"
          open={open.motion}
          onToggle={() => toggle('motion')}
        >
          <XYZGroup
            label="Start Position"
            xVal={animation.startPosition.x}
            yVal={animation.startPosition.y}
            zVal={animation.startPosition.z}
            onX={(x) =>
              setAnimationParam('startPosition', {
                ...animation.startPosition,
                x,
              })
            }
            onY={(y) =>
              setAnimationParam('startPosition', {
                ...animation.startPosition,
                y,
              })
            }
            onZ={(z) =>
              setAnimationParam('startPosition', {
                ...animation.startPosition,
                z,
              })
            }
            min={-1000}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <XYZGroup
            label="End Position"
            xVal={animation.endPosition.x}
            yVal={animation.endPosition.y}
            zVal={animation.endPosition.z}
            onX={(x) =>
              setAnimationParam('endPosition', {
                ...animation.endPosition,
                x,
              })
            }
            onY={(y) =>
              setAnimationParam('endPosition', {
                ...animation.endPosition,
                y,
              })
            }
            onZ={(z) =>
              setAnimationParam('endPosition', {
                ...animation.endPosition,
                z,
              })
            }
            min={-1000}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <XYZGroup
            label="Start Angle"
            xVal={animation.startRotation.x}
            yVal={animation.startRotation.y}
            zVal={animation.startRotation.z}
            onX={(x) =>
              setAnimationParam('startRotation', {
                ...animation.startRotation,
                x,
              })
            }
            onY={(y) =>
              setAnimationParam('startRotation', {
                ...animation.startRotation,
                y,
              })
            }
            onZ={(z) =>
              setAnimationParam('startRotation', {
                ...animation.startRotation,
                z,
              })
            }
            min={-180}
            max={180}
            step={1}
            unit="°"
          />
          <XYZGroup
            label="End Angle"
            xVal={animation.endRotation.x}
            yVal={animation.endRotation.y}
            zVal={animation.endRotation.z}
            onX={(x) =>
              setAnimationParam('endRotation', {
                ...animation.endRotation,
                x,
              })
            }
            onY={(y) =>
              setAnimationParam('endRotation', {
                ...animation.endRotation,
                y,
              })
            }
            onZ={(z) =>
              setAnimationParam('endRotation', {
                ...animation.endRotation,
                z,
              })
            }
            min={-180}
            max={180}
            step={1}
            unit="°"
          />
        </Accordion>
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={() => setView('results')}
          className="w-full font-mono text-[11px] uppercase tracking-widest bg-[var(--accent)] text-[var(--accent-foreground)] py-3 rounded-sm hover:bg-[var(--accent-hover)] transition-colors font-semibold"
        >
          ▶ Simulate
        </button>
        <p className="font-mono text-[9px] text-[var(--muted-foreground)] text-center mt-2 uppercase tracking-widest">
          {magnet.shape} · {magnet.material} {magnet.materialGrade}
        </p>
      </div>
    </aside>
  )
}