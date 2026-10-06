import { lazy, Suspense, useState } from 'react'
import { useSimulatorStore } from '../../../store/simulatorStore'
import { PRESET_LIST, type PresetMeta } from '../../../lib/presets'
import {
  prefetchCustomSetup,
  prefetchDesignWorkspace,
} from '../../../lib/prefetch'
import { ThemeToggle } from '../../ui/Theme'
import { DynamicPreview } from './PresetPreview'
import { MotionPreview } from './SetupPreviews'

const CustomSetupFlow = lazy(() =>
  import('./CustomSetupFlow').then((m) => ({ default: m.CustomSetupFlow })),
)

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
      className={`preset-card flex flex-col border rounded-sm transition-all duration-200 ${selected
        ? 'border-(--accent) bg-(--accent)/5 shadow-[0_0_28px_color-mix(in_srgb,var(--accent)_12%,transparent)]'
        : 'border-(--border) bg-(--card) hover:border-(--accent)/40'
        }`}
    >
      <button onClick={onSelect} className="w-full text-left p-5 cursor-pointer flex-1">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center gap-2">
            <MagnetIcon type={sim.magnetType} />
            <span className="font-mono text-[13px] uppercase tracking-widest text-(--muted-foreground)">
              {sim.category}
            </span>
          </div>
        </div>

        <h3
          className={`text-base font-semibold leading-tight mb-2 transition-colors ${selected ? 'text-(--accent)' : 'text-(--card-foreground)'
            }`}
        >
          {sim.label}
        </h3>

        <p className="text-xs text-(--muted-foreground) leading-relaxed mb-4 line-clamp-3">
          {sim.description}
        </p>

        <div className="border-b border-(--border) mb-4" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
          <Stat label="Magnet Type" value={sim.magnetType} />
          <Stat label="Waveform" value={sim.waveform} />
        </div>

        <div className="border border-(--border) rounded-sm bg-(--background)/60 mb-4 overflow-hidden flex items-center justify-center">
          <DynamicPreview id={sim.id} />
        </div>

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

      <div className="px-5 pb-5">
        <button
          onClick={onOpen}
          onMouseEnter={() => prefetchDesignWorkspace()}
          onFocus={() => prefetchDesignWorkspace()}
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

function CustomSetupBanner({ onClick }: { onClick: () => void }) {
  return (
    <section
      className="mb-10 rounded-sm border border-(--border) overflow-hidden"
      style={{
        background:
          'linear-gradient(120deg, color-mix(in srgb, var(--accent) 10%, var(--card)), var(--card) 55%)',
      }}
    >
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-0">
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div className="font-mono text-[13px] uppercase tracking-widest text-(--accent) mb-3">
            Custom setup
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Build your own simulation
          </h2>
          <p className="text-sm text-(--muted-foreground) leading-relaxed max-w-xl mb-6">
            Pick a motion type, magnet shape, and catalog sensor — review a
            summary, then open the design workspace with those defaults.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {['1 · Motion', '2 · Magnet', '3 · Sensor', '4 · Create'].map((s) => (
              <span
                key={s}
                className="font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-sm border border-(--border) text-(--muted-foreground) bg-(--background)/50"
              >
                {s}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => {
              prefetchCustomSetup()
              prefetchDesignWorkspace()
            }}
            onFocus={() => {
              prefetchCustomSetup()
              prefetchDesignWorkspace()
            }}
            className="w-full sm:w-auto self-start font-mono text-[13px] uppercase tracking-widest px-6 py-3 rounded-sm bg-(--accent) text-(--accent-foreground) hover:bg-(--accent-hover) transition-colors cursor-pointer"
          >
            Start custom setup →
          </button>
        </div>

        <div
          className="p-5 md:p-6 grid sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-(--border)"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--background) 55%, transparent)',
          }}
        >
          {(
            [
              { type: 'linear' as const, label: 'Linear' },
              { type: 'rotate' as const, label: 'Rotate' },
              { type: 'hinge' as const, label: 'Hinge' },
            ] as const
          ).map((m) => (
            <div
              key={m.type}
              className="rounded-sm border border-(--border) bg-(--card)/80 p-2 flex flex-col"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-(--muted-foreground) px-1 mb-1">
                {m.label}
              </div>
              <div className="rounded-sm overflow-hidden flex-1 flex items-center">
                <MotionPreview type={m.type} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const [selected, setSelected] = useState<string | null>(null)
  const [mode, setMode] = useState<'gallery' | 'custom'>('gallery')
  const applyPreset = useSimulatorStore((s) => s.applyPreset)

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
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

      {mode === 'custom' ? (
        <div className="px-6 py-12">
          <Suspense
            fallback={
              <div className="max-w-4xl mx-auto font-mono text-[13px] uppercase tracking-widest text-(--accent)">
                Loading custom setup…
              </div>
            }
          >
            <CustomSetupFlow onCancel={() => setMode('gallery')} />
          </Suspense>
        </div>
      ) : (
        <>
          <div className="px-6 pt-16 pb-8 max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mb-4">
              Hall Sensor<br />
              <span className="text-(--accent)">Simulation</span>
            </h1>
            <p className="text-sm text-(--muted-foreground) max-w-xl leading-relaxed">
              Build a custom setup, or jump in with a preconfigured magnetic
              field scenario.
            </p>
          </div>

          <div className="px-6 pb-24 max-w-6xl mx-auto">
            <CustomSetupBanner onClick={() => setMode('custom')} />

            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-(--muted-foreground) mb-1">
                  Application examples
                </div>
                <h2 className="text-lg font-semibold text-(--foreground)">
                  Presets
                </h2>
              </div>
            </div>

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
        </>
      )}
    </div>
  )
}
