import { useState } from 'react'
import { useSimulatorStore } from '../../store/simulatorStore'
import type { MagnetParams, MagnetShape } from '../../types/magnet'
import { useSimulation } from '../../hooks/useSimulation'
import { Accordion } from './Accordion'
import { NumberInput } from './inputs/NumberInput'
import { SelectInput } from './inputs/SelectInput'
import { GeometryFields } from './panel/GeometryFields'
import { MotionFields } from './panel/MotionFields'
import { SensorPackageFields } from './panel/SensorPackageFields'
import { GRADES, MATERIALS, SHAPES } from './panel/options'
import { XYZGroup } from './panel/XYZGroup'

// ── Page ──────────────────────────────────────────────────────────────────────

export function SidePanel() {
  const magnet = useSimulatorStore((s) => s.magnet)
  const animation = useSimulatorStore((s) => s.animation)
  const sensor = useSimulatorStore((s) => s.sensor)
  const setMagnetShape = useSimulatorStore((s) => s.setMagnetShape)
  const setMagnetParam = useSimulatorStore((s) => s.setMagnetParam)
  const setMotionType = useSimulatorStore((s) => s.setMotionType)
  const patchAnimation = useSimulatorStore((s) => s.patchAnimation)
  const setSensorPosition = useSimulatorStore((s) => s.setSensorPosition)
  const { simulate, simulating, simulationError } = useSimulation()

  const [open, setOpen] = useState<Record<string, boolean>>({
    spec: true,
    geometry: true,
    sensor: true,
    motion: true,
  })

  function toggle(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <aside className="w-full border-l border-[var(--border)] bg-[var(--card)] flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
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

        {/* ── Sensor ── */}
        <Accordion
          title="Sensor"
          open={open.sensor}
          onToggle={() => toggle('sensor')}
        >
          <SensorPackageFields />
          <XYZGroup
            label="Position"
            xVal={sensor.x}
            yVal={sensor.y}
            zVal={sensor.z}
            onX={(x) => setSensorPosition({ ...sensor, x })}
            onY={(y) => setSensorPosition({ ...sensor, y })}
            onZ={(z) => setSensorPosition({ ...sensor, z })}
            min={-1000}
            max={1000}
            step={0.1}
            unit="mm"
          />
        </Accordion>

        {/* ── Motion ── */}
        <Accordion
          title="Motion"
          open={open.motion}
          onToggle={() => toggle('motion')}
        >
          <MotionFields
            animation={animation}
            setMotionType={setMotionType}
            patchAnimation={patchAnimation}
          />
        </Accordion>
      </div>

      <div className="p-4 border-t border-[var(--border)] space-y-2">
        <button
          type="button"
          onClick={() => void simulate()}
          disabled={simulating}
          className="w-full font-mono text-sm uppercase tracking-widest bg-[var(--accent)] text-[var(--accent-foreground)] py-3 rounded-sm hover:bg-[var(--accent-hover)] transition-colors font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {simulating ? 'Running…' : '▶ Simulate'}
        </button>
        {simulationError && (
          <p className="font-mono text-xs text-red-400 text-center leading-relaxed">
            {simulationError}
          </p>
        )}
        <p className="font-mono text-xs text-[var(--muted-foreground)] text-center uppercase tracking-widest">
          {magnet.shape} · {magnet.material} {magnet.materialGrade}
        </p>
      </div>
    </aside>
  )
}
