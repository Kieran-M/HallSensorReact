import { useState } from 'react'
import { useSimulatorStore } from '../../../store/simulatorStore'
import { ThemeToggle } from '../../ui/Theme'

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
    waveform: 'Sinusoidal',
    magnetType: 'Disc — Diametric',
    tags: ['absolute', 'rotary', 'encoder'],
  },
  {
    id: 'slide-by',
    label: 'Slide-by',
    category: 'Linear',
    description: 'Bar magnet translating laterally past the sensor at a fixed air gap. Generates bipolar field transition used for position detection and speed sensing.',
    fieldStrength: '±45 mT',
    waveform: 'Sinusoidal',
    magnetType: 'Bar — Axial',
    tags: ['linear', 'position', 'bipolar'],
  },
  {
    id: 'incremental-encoding',
    label: 'Incremental Encoding',
    category: 'Rotary',
    description: 'Multi-pole ring magnet with alternating N/S segments passing the sensor. Produces quadrature pulse output for direction and incremental position.',
    fieldStrength: '20–70 mT',
    waveform: 'Square',
    magnetType: 'Ring — Multi-pole',
    tags: ['quadrature', 'ring-magnet', 'incremental'],
  },
  {
    id: 'head-on',
    label: 'Head On',
    category: 'Switch',
    description: 'Axially magnetized cylinder magnet approaching the sensor along the sensing axis. Monotonically increasing Bz field — classic switch and proximity topology.',
    fieldStrength: '0–120 mT',
    waveform: 'Linear Ramp',
    magnetType: 'Cylinder — Axial',
    tags: ['proximity', 'switch', 'axial'],
  },
  {
    id: 'lid-closure',
    label: 'Lid Closure',
    category: 'Switch',
    description: 'Small NdFeB block magnet mounted on a hinged lid, swinging into range. Models smartphone flip cover, appliance door, and safety interlock detection.',
    fieldStrength: '0–80 mT',
    waveform: 'Step',
    magnetType: 'Block — Lateral',
    tags: ['lid', 'switch', 'consumer'],
  },
]

function MagnetIcon({ type }: { type: string }) {
  if (type.includes('Ring')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-(--accent) opacity-80">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  }
  if (type.includes('Disc') || type.includes('Cylinder')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-(--accent) opacity-80">
        <ellipse cx="12" cy="8" rx="8" ry="3" />
        <line x1="4" y1="8" x2="4" y2="16" />
        <line x1="20" y1="8" x2="20" y2="16" />
        <ellipse cx="12" cy="16" rx="8" ry="3" />
      </svg>
    )
  }
  if (type.includes('Block')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-(--accent) opacity-80">
        <rect x="3" y="7" width="18" height="10" rx="1" />
        <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-(--accent) opacity-80">
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <line x1="12" y1="9" x2="12" y2="15" strokeDasharray="2 2" />
    </svg>
  )
}

// Animated SVG preview unique to each preset's physical motion
function DynamicPreview({ id }: { id: string }) {
  if (id === 'angle-encoding') {
    // Disc magnet rotating above a fixed sensor
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Sensor PCB */}
        <rect x="47" y="72" width="26" height="7" rx="1" fill="#1a3a2a" />
        <rect x="56" y="68" width="8" height="5" rx="0.5" fill="#111" />
        {/* Sensor axis dot */}
        <circle cx="60" cy="66" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Orbit path ghost */}
        <ellipse cx="60" cy="42" rx="22" ry="6" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
        {/* Rotating disc */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 60 42" to="360 60 42" dur="2.4s" repeatCount="indefinite" />
          <ellipse cx="60" cy="42" rx="14" ry="5" fill="#c0392b" opacity="0.95" />
          <ellipse cx="60" cy="42" rx="7" ry="5" fill="#2980b9" opacity="0.9" />
          {/* Field line */}
          <line x1="60" y1="47" x2="60" y2="65" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.15;0.5" dur="2.4s" repeatCount="indefinite" />
          </line>
        </g>
        {/* Label */}
        <text x="60" y="86" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">360° rotation</text>
      </svg>
    )
  }

  if (id === 'slide-by') {
    // Bar magnet translating laterally past sensor
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Sensor */}
        <rect x="47" y="52" width="26" height="7" rx="1" fill="#1a3a2a" />
        <rect x="56" y="48" width="8" height="5" rx="0.5" fill="#111" />
        <circle cx="60" cy="46" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Sliding bar magnet */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="-50,0; 50,0; -50,0" dur="2.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
          <rect x="33" y="30" width="18" height="10" rx="1" fill="#c0392b" />
          <rect x="51" y="30" width="18" height="10" rx="1" fill="#2980b9" />
          <text x="42" y="38" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="monospace" fontWeight="bold">N</text>
          <text x="60" y="38" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="monospace" fontWeight="bold">S</text>
          {/* Field lines */}
          {[-6, 0, 6].map((dx, i) => (
            <line key={i} x1={60 + dx} y1="41" x2={60 + dx} y2="47" stroke="var(--accent)" strokeWidth="0.7" opacity="0.4">
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.8s" repeatCount="indefinite" />
            </line>
          ))}
        </g>
        <text x="60" y="70" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">lateral translation</text>
      </svg>
    )
  }

  if (id === 'incremental-encoding') {
    // Multi-pole ring rotating
    const poles = 8
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Sensor */}
        <rect x="47" y="72" width="26" height="7" rx="1" fill="#1a3a2a" />
        <rect x="56" y="68" width="8" height="5" rx="0.5" fill="#111" />
        <circle cx="60" cy="66" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Rotating ring */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 60 42" to="360 60 42" dur="1.8s" repeatCount="indefinite" />
          {Array.from({ length: poles }, (_, i) => {
            const angle = (i / poles) * 2 * Math.PI
            const nextAngle = ((i + 1) / poles) * 2 * Math.PI
            const r = 20
            const x1 = 60 + r * Math.cos(angle)
            const y1 = 42 + r * Math.sin(angle)
            const x2 = 60 + r * Math.cos(nextAngle)
            const y2 = 42 + r * Math.sin(nextAngle)
            const largeArc = 1 / poles > 0.5 ? 1 : 0
            return (
              <path
                key={i}
                d={`M ${60 + 14 * Math.cos(angle)} ${42 + 14 * Math.sin(angle)}
                    A 14 14 0 ${largeArc} 1 ${60 + 14 * Math.cos(nextAngle)} ${42 + 14 * Math.sin(nextAngle)}
                    L ${x2} ${y2}
                    A 20 20 0 ${largeArc} 0 ${x1} ${y1} Z`}
                fill={i % 2 === 0 ? '#c0392b' : '#2980b9'}
                opacity="0.9"
              />
            )
          })}
          {/* Center hole */}
          <circle cx="60" cy="42" r="14" fill="var(--background)" />
          <circle cx="60" cy="42" r="3" fill="var(--muted)" />
        </g>
        <text x="60" y="86" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">quadrature output</text>
      </svg>
    )
  }

  if (id === 'head-on') {
    // Cylinder descending toward sensor
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Sensor */}
        <rect x="47" y="74" width="26" height="7" rx="1" fill="#1a3a2a" />
        <rect x="56" y="70" width="8" height="5" rx="0.5" fill="#111" />
        <circle cx="60" cy="68" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Descending cylinder */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,-20; 0,18; 0,-20" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
          <ellipse cx="60" cy="28" rx="12" ry="4" fill="#2980b9" />
          <rect x="48" y="28" width="24" height="16" fill="url(#cyl-grad)" />
          <ellipse cx="60" cy="44" rx="12" ry="4" fill="#c0392b" />
          <defs>
            <linearGradient id="cyl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2980b9" />
              <stop offset="100%" stopColor="#c0392b" />
            </linearGradient>
          </defs>
          {/* Field lines below */}
          {[-6, 0, 6].map((dx, i) => (
            <line key={i} x1={60 + dx} y1="48" x2={60 + dx} y2="58" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.05;0.5" dur="2.2s" repeatCount="indefinite" />
            </line>
          ))}
        </g>
        <text x="60" y="86" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">axial approach</text>
      </svg>
    )
  }

  if (id === 'lid-closure') {
    // Block swinging on a hinge
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Hinge point */}
        <circle cx="30" cy="56" r="2.5" fill="var(--muted-foreground)" />
        {/* Sensor on right */}
        <rect x="78" y="52" width="18" height="6" rx="1" fill="#1a3a2a" />
        <rect x="83" y="48" width="7" height="5" rx="0.5" fill="#111" />
        <circle cx="86" cy="46" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Swinging lid arm */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="-60 30 56" to="0 30 56" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0 0.4 1" additive="replace" />
          <line x1="30" y1="56" x2="72" y2="56" stroke="var(--muted-foreground)" strokeWidth="1.5" />
          {/* Block magnet at end */}
          <rect x="62" y="49" width="18" height="7" rx="1" fill="#c0392b" />
          <rect x="71" y="49" width="9" height="7" rx="1" fill="#2980b9" />
          <text x="67" y="55" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="monospace" fontWeight="bold">N</text>
          <text x="76" y="55" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="monospace" fontWeight="bold">S</text>
        </g>
        <text x="60" y="75" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">hinge sweep</text>
      </svg>
    )
  }

  return null
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-(--muted-foreground) mb-0.5">{label}</div>
      <div className="font-mono text-[11px] text-(--foreground)">{value}</div>
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
  return (
    <div
      className={`flex flex-col border rounded-sm transition-all duration-200 ${selected
        ? 'border-(--accent) bg-(--accent)/5 shadow-[0_0_28px_color-mix(in_srgb,var(--accent)_12%,transparent)]'
        : 'border-(--border) bg-(--card) hover:border-(--accent)/40'
        }`}
    >
      {/* Clickable body */}
      <button onClick={onSelect} className="w-full text-left p-5 cursor-pointer flex-1">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center gap-2">
            <MagnetIcon type={sim.magnetType} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-(--muted-foreground)">
              {sim.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-semibold leading-tight mb-2 transition-colors ${selected ? 'text-(--accent)' : 'text-(--card-foreground)'
            }`}
        >
          {sim.label}
        </h3>

        {/* Description */}
        <p className="text-xs text-(--muted-foreground) leading-relaxed mb-4 line-clamp-3">
          {sim.description}
        </p>

        <div className="border-b border-(--border) mb-4" />

        {/* Specs */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
          <Stat label="Magnet Type" value={sim.magnetType} />
          <Stat label="Waveform" value={sim.waveform} />
        </div>

        {/* Animated motion preview */}
        <div className="border border-(--border) rounded-sm bg-(--background)/60 mb-4 overflow-hidden flex items-center justify-center">
          <DynamicPreview id={sim.id} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {sim.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[9px] uppercase tracking-wider text-(--muted-foreground) border border-(--border) px-1.5 py-0.5 rounded-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </button>

      {/* Open Design button */}
      <div className="px-5 pb-5">
        <button
          onClick={onOpen}
          className={`w-full cursor-pointer font-mono text-[10px] uppercase tracking-widest py-2 rounded-sm border transition-all ${selected
            ? 'border-(--accent) text-(--accent-foreground) bg-(--accent) hover:bg-(--accent-hover) hover:border-(--accent-hover)'
            : 'border-(--border) text-(--muted-foreground) hover:border-(--accent)/50 hover:text-(--accent)'
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
  const setView = useSimulatorStore((s) => s.setView)
  // function handleOpen(sim: Simulation) {
  //   setPreset({
  //     id: sim.id,
  //     label: sim.label,
  //     magnetType: sim.magnetType,
  //     waveform: sim.waveform,
  //     fieldStrength: sim.fieldStrength,
  //     category: sim.category,
  //   })
  //   navigate('/setup')
  // }

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      {/* Header */}
      <header className="border-b border-(--border) px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-sm bg-(--background)/90">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-(--accent)/60" />
            <div className="w-2 h-2 rounded-full bg-(--accent)" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-(--accent)">HallSim</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-(--muted-foreground)">
              Sensor Simulation Platform
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-(--muted-foreground)">v2.4.1</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">Ready</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 pt-16 pb-12 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mb-4">
          Hall Sensor<br />
          <span className="text-(--accent)">Simulation Presets</span>
        </h1>
        <p className="text-sm text-(--muted-foreground) max-w-xl leading-relaxed">
          Select a preconfigured magnetic field scenario. Each preset defines magnet geometry, excitation waveform, air gap, and field profile for deterministic sensor emulation.
        </p>
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
              onOpen={() => setView("design")}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
