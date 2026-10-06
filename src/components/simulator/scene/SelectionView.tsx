import { useState } from 'react'
import { useSimulatorStore } from '../../../store/simulatorStore'
import { PRESET_LIST, type PresetMeta } from '../../../lib/presets'
import { ThemeToggle } from '../../ui/Theme'
import { DynamicPreview } from './PresetPreview'

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-widest text-(--muted-foreground) mb-0.5">{label}</div>
      <div className="font-mono text-sm text-(--foreground)">{value}</div>
    </div>
  )
}

function SimCard({
  sim,
  selected,
  onSelect,
  onOpen,
}: {
  sim: PresetMeta
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
            <span className="font-mono text-[13px] uppercase tracking-widest text-(--muted-foreground)">
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
              className="font-mono text-xs uppercase tracking-wider text-(--muted-foreground) border border-(--border) px-1.5 py-0.5 rounded-sm"
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
          className={`w-full cursor-pointer font-mono text-[13px] uppercase tracking-widest py-2 rounded-sm border transition-all ${selected
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
  const applyPreset = useSimulatorStore((s) => s.applyPreset)

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
            <div className="font-mono text-xs uppercase tracking-widest text-(--muted-foreground)">
              Sensor Simulation Platform
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[13px] uppercase tracking-widest text-(--muted-foreground)">v2.4.1</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[13px] uppercase tracking-widest text-emerald-400">Ready</span>
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
          {PRESET_LIST.map((preset) => (
            <SimCard
              key={preset.meta.id}
              sim={preset.meta}
              selected={selected === preset.meta.id}
              onSelect={() =>
                setSelected((prev) =>
                  prev === preset.meta.id ? null : preset.meta.id,
                )
              }
              onOpen={() => applyPreset(preset.meta.id)}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
