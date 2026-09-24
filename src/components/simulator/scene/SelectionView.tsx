import { useState } from 'react'
import { useSimulatorStore } from '../../../store/simulatorStore'

interface Simulation {
  id: string
  label: string
  category: string
  description: string
  fieldStrength: string
  frequency: string
  waveform: string
  magnetType: string
  airGap: string
  tags: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
}

const SIMULATIONS: Simulation[] = [
  {
    id: 'angle-encoding',
    label: 'Angle Encoding',
    category: 'Rotary',
    description: 'Diametrically magnetized disc magnet rotating above sensor face. Full 360° sinusoidal Bx/By field for absolute angle reconstruction.',
    fieldStrength: '±60 mT',
    frequency: '0–6000 RPM',
    waveform: 'Sinusoidal',
    magnetType: 'Disc — Diametric',
    airGap: '1.0 mm',
    tags: ['absolute', 'rotary', 'encoder'],
    difficulty: 'intermediate',
  },
  {
    id: 'slide-by',
    label: 'Slide-by',
    category: 'Linear',
    description: 'Bar magnet translating laterally past the sensor at a fixed air gap. Generates bipolar field transition used for position detection and speed sensing.',
    fieldStrength: '±45 mT',
    frequency: '0–2 m/s',
    waveform: 'Sinusoidal',
    magnetType: 'Bar — Axial',
    airGap: '2.0 mm',
    tags: ['linear', 'position', 'bipolar'],
    difficulty: 'basic',
  },
  {
    id: 'incremental-encoding',
    label: 'Incremental Encoding',
    category: 'Rotary',
    description: 'Multi-pole ring magnet with alternating N/S segments passing the sensor. Produces quadrature pulse output for direction and incremental position.',
    fieldStrength: '20–70 mT',
    frequency: '100–5000 Hz',
    waveform: 'Square',
    magnetType: 'Ring — Multi-pole',
    airGap: '0.8 mm',
    tags: ['quadrature', 'ring-magnet', 'incremental'],
    difficulty: 'intermediate',
  },
  {
    id: 'head-on',
    label: 'Head On',
    category: 'Switch',
    description: 'Axially magnetized cylinder magnet approaching the sensor along the sensing axis. Monotonically increasing Bz field — classic switch and proximity topology.',
    fieldStrength: '0–120 mT',
    frequency: '0 Hz (DC)',
    waveform: 'Linear Ramp',
    magnetType: 'Cylinder — Axial',
    airGap: '0.5–5 mm',
    tags: ['proximity', 'switch', 'axial'],
    difficulty: 'basic',
  },
  {
    id: 'lid-closure',
    label: 'Lid Closure',
    category: 'Switch',
    description: 'Small NdFeB block magnet mounted on a hinged lid, swinging into range. Models smartphone flip cover, appliance door, and safety interlock detection.',
    fieldStrength: '0–80 mT',
    frequency: '< 5 Hz',
    waveform: 'Step',
    magnetType: 'Block — Lateral',
    airGap: '1.5–8 mm',
    tags: ['lid', 'switch', 'consumer'],
    difficulty: 'basic',
  },
]

const DIFFICULTY_COLOR: Record<string, string> = {
  basic: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  intermediate: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
  advanced: 'text-rose-400 border-rose-400/30 bg-rose-400/5',
}

function MagnetIcon({ type }: { type: string }) {
  if (type.includes('Ring')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[var(--accent)] opacity-80">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  }
  if (type.includes('Disc') || type.includes('Cylinder')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[var(--accent)] opacity-80">
        <ellipse cx="12" cy="8" rx="8" ry="3" />
        <line x1="4" y1="8" x2="4" y2="16" />
        <line x1="20" y1="8" x2="20" y2="16" />
        <ellipse cx="12" cy="16" rx="8" ry="3" />
      </svg>
    )
  }
  if (type.includes('Block')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[var(--accent)] opacity-80">
        <rect x="3" y="7" width="18" height="10" rx="1" />
        <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[var(--accent)] opacity-80">
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <line x1="12" y1="9" x2="12" y2="15" strokeDasharray="2 2" />
    </svg>
  )
}

function MiniGraph({ waveform }: { waveform: string }) {
  const points: Record<string, string> = {
    'Sinusoidal': '0,30 10,2 20,30 30,58 40,30 50,2 60,30 70,58 80,30',
    'Square': '0,58 0,2 20,2 20,58 40,58 40,2 60,2 60,58 80,58',
    'Linear Ramp': '0,58 80,2',
    'Step': '0,58 35,58 35,2 80,2',
  }
  const pts = points[waveform] || '0,30 80,30'
  return (
    <svg viewBox="0 0 80 60" className="w-full h-10" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke="#00d4ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5">{label}</div>
      <div className="font-mono text-[11px] text-[var(--foreground)]">{value}</div>
    </div>
  )
}

function SimCard({
  sim,
  selected,
  onSelect,
  onOpen,
}: {
  sim: Simulation
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}) {

  const setView = useSimulatorStore((s) => s.setView);

  return (
    <div
      className={`flex flex-col border rounded-sm transition-all duration-200 ${
        selected
          ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_28px_rgba(0,212,255,0.08)]'
          : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/40'
      }`}
    >
      {/* Clickable body */}
      <button onClick={onSelect} className="w-full text-left p-5 cursor-pointer flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <MagnetIcon type={sim.magnetType} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
              {sim.category}
            </span>
          </div>
          <span
            className={`font-mono text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded-sm ${DIFFICULTY_COLOR[sim.difficulty]}`}
          >
            {sim.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-semibold leading-tight mb-2 transition-colors ${
            selected ? 'text-[var(--accent)]' : 'text-[var(--card-foreground)]'
          }`}
        >
          {sim.label}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-4 line-clamp-3">
          {sim.description}
        </p>

        <div className="border-b border-[var(--border)] mb-4" />

        {/* Specs */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
          <Stat label="Magnet Type" value={sim.magnetType} />
          <Stat label="Air Gap" value={sim.airGap} />
          <Stat label="B Field" value={sim.fieldStrength} />
          <Stat label="Frequency" value={sim.frequency} />
          <Stat label="Waveform" value={sim.waveform} />
        </div>

        {/* Waveform preview */}
        <div className="border border-[var(--border)] rounded-sm px-3 py-1 bg-[var(--muted)]/20 mb-4">
          <MiniGraph waveform={sim.waveform} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {sim.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] border border-[var(--border)] px-1.5 py-0.5 rounded-sm"
            >                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             {t}
            </span>
          ))}
        </div>
      </button>

      {/* Open Design button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => setView('design')}
          className={`w-full font-mono text-[10px] uppercase tracking-widest py-2 rounded-sm border transition-all ${
            selected
              ? 'border-[var(--accent)] text-[var(--accent-foreground)] bg-[var(--accent)] hover:bg-white hover:border-white'
              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]'
          }`}
        >
          Open Design →
        </button>
      </div>
    </div>
  )
}

export default function Landing() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-sm bg-[var(--background)]/90">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[var(--accent)]/60" />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">HallSim</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)]">
              Sensor Simulation Platform
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">v2.4.1</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">Ready</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 pt-16 pb-12 max-w-6xl mx-auto">
        <div className="mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-2 py-0.5 rounded-sm">
            Preset Library
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mt-4 mb-4">
          Hall Sensor<br />
          <span className="text-[var(--accent)]">Simulation Presets</span>
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Select a preconfigured magnetic field scenario. Each preset defines magnet geometry, excitation waveform, air gap, and field profile for deterministic sensor emulation.
        </p>

        <div className="flex gap-8 mt-8 pt-8 border-t border-[var(--border)]">
          {[
            { label: 'Presets', value: '5' },
            { label: 'Field Range', value: '±120 mT' },
            { label: 'Min Air Gap', value: '0.8 mm' },
            { label: 'Resolution', value: '12-bit' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-mono text-xl font-bold text-[var(--foreground)]">{s.value}</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)] mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {SIMULATIONS.map((sim) => (
            <SimCard
              key={sim.id}
              sim={sim}
              selected={selected === sim.id}
              onSelect={() => setSelected((prev) => (prev === sim.id ? null : sim.id))}
            onOpen={() => 0}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
