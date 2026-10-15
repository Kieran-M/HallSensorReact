import { useState } from 'react'
import { useSimulatorStore } from '../../store/simulatorStore'
import type { MagnetParams, MagnetShape } from '../../types/magnet'
import { useApiHealth } from '../../hooks/useApiHealth'
import { useSimulation } from '../../hooks/useSimulation'
import { Accordion } from './Accordion'
import { SelectInput } from './inputs/SelectInput'
import { GeometryFields } from './panel/GeometryFields'
import { MotionFields } from './panel/MotionFields'
import { SensorPackageFields } from './panel/SensorPackageFields'
import {
  getMagnetMaterial,
  gradesForMaterial,
} from '../../lib/magnetCatalog'
import { MATERIALS, SHAPES } from './panel/options'
import { XYZGroup } from './panel/XYZGroup'

// ── Page ──────────────────────────────────────────────────────────────────────

export function SidePanel() {
  const magnet = useSimulatorStore((s) => s.magnet)
  const animation = useSimulatorStore((s) => s.animation)
  const sensor = useSimulatorStore((s) => s.sensor)
  const duration = useSimulatorStore((s) => s.duration)
  const fps = useSimulatorStore((s) => s.fps)
  const setMagnetShape = useSimulatorStore((s) => s.setMagnetShape)
  const setMagnetParam = useSimulatorStore((s) => s.setMagnetParam)
  const setMotionType = useSimulatorStore((s) => s.setMotionType)
  const patchAnimation = useSimulatorStore((s) => s.patchAnimation)
  const setSensorPosition = useSimulatorStore((s) => s.setSensorPosition)
  const setDuration = useSimulatorStore((s) => s.setDuration)
  const setFps = useSimulatorStore((s) => s.setFps)
  const { simulate, simulating, simulationError } = useSimulation()
  const { status: apiStatus } = useApiHealth()
  const apiDown = apiStatus === 'down'

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
        <div className="font-mono text-sm uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
          Control Panel
        </div>
        <div className="font-mono text-base text-[var(--foreground)] font-semibold">
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
          <SelectInput<string>
            label="Material"
            value={magnet.material}
            options={MATERIALS}
            onChange={(v) => {
              const mat = getMagnetMaterial(v)
              const grade = mat?.grades[0]
              setMagnetParam('material', v as MagnetParams['material'])
              if (mat) setMagnetParam('tempCoefficient', mat.tempCoefficient)
              if (grade) {
                setMagnetParam(
                  'materialGrade',
                  grade.id as MagnetParams['materialGrade'],
                )
                setMagnetParam('remanence', grade.remanenceT)
              }
            }}
          />
          <SelectInput<string>
            label="Grade"
            value={magnet.materialGrade}
            options={gradesForMaterial(magnet.material).map((g) => ({
              label: g.label,
              value: g.id,
            }))}
            onChange={(v) => {
              setMagnetParam(
                'materialGrade',
                v as MagnetParams['materialGrade'],
              )
              const grade = gradesForMaterial(magnet.material).find(
                (g) => g.id === v,
              )
              if (grade) setMagnetParam('remanence', grade.remanenceT)
            }}
          />
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="font-mono text-sm uppercase tracking-wide text-[var(--muted-foreground)]">
              No. of Poles
            </span>
            <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
              2 (dipole)
            </span>
          </div>
          <p className="font-mono text-sm text-[var(--muted-foreground)] leading-relaxed">
            Material and grade set typical Br and temp coefficient (editable
            under Geometry). Phase 1 models a 2-pole magnet; the field uses Br
            and shape.
          </p>
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
            duration={duration}
            fps={fps}
            setDuration={setDuration}
            setFps={setFps}
          />
        </Accordion>
      </div>

      <div className="p-4 border-t border-[var(--border)] space-y-2">
        <button
          type="button"
          onClick={() => void simulate()}
          disabled={simulating || apiDown}
          title={apiDown ? 'Simulation API is offline' : undefined}
          className="w-full font-mono text-sm uppercase tracking-wide bg-[var(--accent)] text-[var(--accent-foreground)] py-3 rounded-sm hover:bg-[var(--accent-hover)] transition-colors font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {simulating ? 'Running…' : apiDown ? 'API Offline' : '▶ Simulate'}
        </button>
        {apiDown && !simulationError && (
          <p className="font-mono text-sm text-red-400 text-center leading-relaxed">
            Can&apos;t reach the simulation API. Start the backend, then try again.
          </p>
        )}
        {simulationError && (
          <p className="font-mono text-sm text-red-400 text-center leading-relaxed">
            {simulationError}
          </p>
        )}
        <p className="font-mono text-sm text-[var(--muted-foreground)] text-center leading-snug break-words px-1">
          {magnet.shape} · {magnet.materialGrade} · Br{" "}
          {magnet.remanence.toFixed(2)} T
        </p>
      </div>
    </aside>
  )
}
