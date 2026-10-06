import { useEffect, useMemo, useState, type ReactNode } from "react";
import { listSensorPackages } from "../../../lib/simulationApi";
import {
  hallTypeColor,
  PACKAGE_OUTLINE_LABELS,
} from "../../../lib/packageVisuals";
import { useSimulatorStore } from "../../../store/simulatorStore";
import type { MagnetShape } from "../../../types/magnet";
import type { MotionType } from "../../../types/motion";
import type { HallType, SensorPackageInfo } from "../../../types/simulation";
import { MOTION_TYPES, SHAPES } from "../../ui/panel/options";
import { PackageThumb } from "../../ui/panel/PackageThumb";
import { MagnetShapePreview, MotionPreview } from "./SetupPreviews";

type Step = "motion" | "magnet" | "sensor" | "summary";

const STEPS: { id: Step; label: string }[] = [
  { id: "motion", label: "Motion" },
  { id: "magnet", label: "Magnet" },
  { id: "sensor", label: "Sensor" },
  { id: "summary", label: "Summary" },
];

const MOTION_COPY: Record<
  MotionType,
  { title: string; blurb: string; tags: string[] }
> = {
  linear: {
    title: "Linear",
    blurb:
      "Magnet translates between two positions — slide-by or head-on field profiles.",
    tags: ["slide-by", "head-on", "position"],
  },
  rotate: {
    title: "Rotate",
    blurb:
      "Magnet spins in place about an axis — typical for angle / rotary encoding.",
    tags: ["rotary", "angle", "360°"],
  },
  hinge: {
    title: "Hinge / Arc",
    blurb:
      "Magnet swings on an arm about a pivot — door, pedal, and arc motions.",
    tags: ["arc", "pivot", "bounce"],
  },
};

const SHAPE_COPY: Partial<Record<MagnetShape, string>> = {
  bar: "Rectangular block — common for linear slide-by.",
  diametric_cylinder: "Disc magnetized across diameter — rotary encoding.",
  axial_cylinder: "Cylinder magnetized along height — head-on / proximity.",
  ring: "Ring with diametric polarization.",
  axial_ring: "Ring with axial polarization.",
  sphere: "Spherical magnet for omnidirectional demos.",
};

type TypeFilter = "all" | HallType;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s\-_./]+/g, "");
}

function matchesQuery(pkg: SensorPackageInfo, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const qNorm = normalize(q);
  const hay = [
    pkg.partNumber,
    pkg.id,
    pkg.description,
    pkg.hallType,
    pkg.outputType,
    ...pkg.packages,
  ];
  return (
    hay.some((h) => h.toLowerCase().includes(q)) ||
    hay.some((h) => normalize(h).includes(qNorm))
  );
}

function ChoiceCard({
  selected,
  title,
  subtitle,
  tags,
  onClick,
  accent,
  preview,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  tags?: string[];
  onClick: () => void;
  accent?: string;
  preview?: ReactNode;
}) {
  const border = selected ? (accent ?? "var(--accent)") : "var(--border)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-4 rounded-sm border transition-all cursor-pointer w-full flex flex-col"
      style={{
        borderColor: border,
        backgroundColor: selected
          ? `color-mix(in srgb, ${accent ?? "var(--accent)"} 12%, transparent)`
          : "var(--card)",
      }}
    >
      {preview && (
        <div
          className="mb-3 rounded-sm overflow-hidden flex items-center justify-center"
          style={{
            border: "1px solid var(--border)",
            backgroundColor:
              "color-mix(in srgb, var(--background) 70%, transparent)",
            minHeight: "4.25rem",
          }}
        >
          {preview}
        </div>
      )}
      <div
        className="font-mono text-sm font-semibold mb-1"
        style={{
          color: selected ? (accent ?? "var(--accent)") : "var(--foreground)",
        }}
      >
        {title}
      </div>
      <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed flex-1">
        {subtitle}
      </p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-[var(--border)] text-[var(--muted-foreground)]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

interface CustomSetupFlowProps {
  onCancel: () => void;
}

export function CustomSetupFlow({ onCancel }: CustomSetupFlowProps) {
  const applyCustomSetup = useSimulatorStore((s) => s.applyCustomSetup);
  const setSensorCatalog = useSimulatorStore((s) => s.setSensorCatalog);

  const [step, setStep] = useState<Step>("motion");
  const [motionType, setMotionType] = useState<MotionType | null>(null);
  const [magnetShape, setMagnetShape] = useState<MagnetShape | null>(null);
  const [sensorPackageId, setSensorPackageId] = useState<string | null>(null);

  const [packages, setPackages] = useState<SensorPackageInfo[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listSensorPackages()
      .then((list) => {
        if (cancelled) return;
        setPackages(list);
        setSensorCatalog(list);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load sensor catalog",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setSensorCatalog]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (typeFilter !== "all" && pkg.hallType !== typeFilter) return false;
      return matchesQuery(pkg, query);
    });
  }, [packages, query, typeFilter]);

  const selectedSensor =
    packages.find((p) => p.id === sensorPackageId) ?? null;

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function canContinue(): boolean {
    if (step === "motion") return motionType != null;
    if (step === "magnet") return magnetShape != null;
    if (step === "sensor") return sensorPackageId != null;
    return true;
  }

  function goNext() {
    if (step === "motion") setStep("magnet");
    else if (step === "magnet") setStep("sensor");
    else if (step === "sensor") setStep("summary");
  }

  function goBack() {
    if (step === "magnet") setStep("motion");
    else if (step === "sensor") setStep("magnet");
    else if (step === "summary") setStep("sensor");
    else onCancel();
  }

  function createSim() {
    if (!motionType || !magnetShape || !sensorPackageId) return;
    applyCustomSetup({ motionType, magnetShape, sensorPackageId });
  }

  const motionLabel =
    MOTION_TYPES.find((m) => m.value === motionType)?.label ?? motionType;
  const shapeLabel =
    SHAPES.find((s) => s.value === magnetShape)?.label ?? magnetShape;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="font-mono text-[13px] uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-3"
          >
            ← Back to presets
          </button>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Custom <span className="text-[var(--accent)]">setup</span>
          </h2>
          <p className="font-mono text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed max-w-xl">
            Pick motion, magnet shape, and a sensor from the catalog. You can
            fine-tune dimensions and paths on the design page after creating.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <ol className="flex flex-wrap gap-2 mb-8">
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const done = i < stepIndex;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={i > stepIndex}
                onClick={() => {
                  if (i <= stepIndex) setStep(s.id);
                }}
                className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-colors disabled:opacity-40"
                style={{
                  borderColor: active || done ? "var(--accent)" : "var(--border)",
                  color: active || done ? "var(--accent)" : "var(--muted-foreground)",
                  backgroundColor: active
                    ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                    : "transparent",
                }}
              >
                {i + 1}. {s.label}
              </button>
            </li>
          );
        })}
      </ol>

      <div
        className="rounded-sm border border-[var(--border)] bg-[var(--card)] p-5 md:p-6 mb-6"
      >
        {step === "motion" && (
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
              Choose motion / function type
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {(Object.keys(MOTION_COPY) as MotionType[]).map((type) => {
                const copy = MOTION_COPY[type];
                return (
                  <ChoiceCard
                    key={type}
                    selected={motionType === type}
                    title={copy.title}
                    subtitle={copy.blurb}
                    tags={copy.tags}
                    onClick={() => setMotionType(type)}
                    preview={<MotionPreview type={type} />}
                  />
                );
              })}
            </div>
          </div>
        )}

        {step === "magnet" && (
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
              Choose magnet shape
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SHAPES.map((shape) => (
                <ChoiceCard
                  key={shape.value}
                  selected={magnetShape === shape.value}
                  title={shape.label}
                  subtitle={
                    SHAPE_COPY[shape.value] ??
                    "Default N42 dimensions — editable after create."
                  }
                  onClick={() => setMagnetShape(shape.value)}
                  preview={<MagnetShapePreview shape={shape.value} />}
                />
              ))}
            </div>
          </div>
        )}

        {step === "sensor" && (
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
              Choose sensor from catalog
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search part number, type, description…"
              className="w-full rounded-sm border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-[13px] outline-none focus:border-[var(--accent)]/70"
            />
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  "all",
                  "linear",
                  "unipolar",
                  "latch",
                  "omnipolar",
                ] as TypeFilter[]
              ).map((f) => {
                const active = typeFilter === f;
                const color =
                  f === "all"
                    ? { accent: "var(--accent)", soft: "transparent" }
                    : hallTypeColor(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTypeFilter(f)}
                    className="font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded-sm border transition-colors"
                    style={{
                      borderColor: active ? color.accent : "var(--border)",
                      color: active ? color.accent : "var(--muted-foreground)",
                      backgroundColor: active ? color.soft : "transparent",
                    }}
                  >
                    {f === "all" ? "All" : hallTypeColor(f).label}
                  </button>
                );
              })}
            </div>

            {loadError && (
              <p className="font-mono text-xs text-red-400">{loadError}</p>
            )}
            {loading && (
              <p className="font-mono text-xs text-[var(--muted-foreground)]">
                Loading catalog…
              </p>
            )}
            {!loading && !loadError && filteredPackages.length === 0 && (
              <p className="font-mono text-xs text-[var(--muted-foreground)]">
                No sensors match.
              </p>
            )}

            <ul className="max-h-[min(50vh,28rem)] overflow-y-auto grid sm:grid-cols-2 gap-2 pr-1">
              {filteredPackages.map((pkg) => {
                const selected = pkg.id === sensorPackageId;
                const c = hallTypeColor(pkg.hallType);
                return (
                  <li key={pkg.id}>
                    <button
                      type="button"
                      onClick={() => setSensorPackageId(pkg.id)}
                      className="w-full text-left p-3 rounded-sm border flex gap-3 items-start cursor-pointer transition-colors"
                      style={{
                        borderColor: selected ? c.accent : "var(--border)",
                        backgroundColor: selected
                          ? c.soft
                          : "color-mix(in srgb, var(--background) 60%, transparent)",
                      }}
                    >
                      <PackageThumb
                        outline={pkg.packageOutline}
                        hallType={pkg.hallType}
                        size={52}
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="font-mono text-[13px] font-semibold">
                          {pkg.partNumber}
                        </div>
                        <div
                          className="font-mono text-[10px] uppercase tracking-widest"
                          style={{ color: c.accent }}
                        >
                          {c.label} · {PACKAGE_OUTLINE_LABELS[pkg.packageOutline]}
                        </div>
                        <p className="font-mono text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {step === "summary" && (
          <div className="space-y-5">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
              Review your custom setup
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-sm border border-[var(--border)] p-4 bg-[var(--background)]/50 space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                  Motion
                </div>
                {motionType && (
                  <div
                    className="rounded-sm overflow-hidden mb-1"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <MotionPreview type={motionType} />
                  </div>
                )}
                <div className="font-mono text-sm font-semibold text-[var(--accent)]">
                  {motionLabel}
                </div>
                <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {motionType ? MOTION_COPY[motionType].blurb : "—"}
                </p>
              </div>
              <div className="rounded-sm border border-[var(--border)] p-4 bg-[var(--background)]/50 space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                  Magnet
                </div>
                {magnetShape && (
                  <div
                    className="rounded-sm overflow-hidden mb-1"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <MagnetShapePreview shape={magnetShape} />
                  </div>
                )}
                <div className="font-mono text-sm font-semibold text-[var(--accent)]">
                  {shapeLabel}
                </div>
                <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Default N42 size — adjust on the design page.
                </p>
              </div>
              <div className="rounded-sm border border-[var(--border)] p-4 bg-[var(--background)]/50 space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                  Sensor
                </div>
                {selectedSensor ? (
                  <>
                    <div className="flex gap-2 items-start">
                      <PackageThumb
                        outline={selectedSensor.packageOutline}
                        hallType={selectedSensor.hallType}
                        size={44}
                      />
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-semibold text-[var(--accent)]">
                          {selectedSensor.partNumber}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                          {hallTypeColor(selectedSensor.hallType).label}
                        </div>
                      </div>
                    </div>
                    <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                      {selectedSensor.description}
                    </p>
                  </>
                ) : (
                  <div className="font-mono text-sm">—</div>
                )}
              </div>
            </div>
            <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
              Creating opens the design workspace with these defaults. You can
              still change motion path, magnet size, and sensor position before
              simulating.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 rounded-sm border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
        >
          {step === "motion" ? "Cancel" : "Back"}
        </button>

        {step !== "summary" ? (
          <button
            type="button"
            disabled={!canContinue()}
            onClick={goNext}
            className="font-mono text-[13px] uppercase tracking-widest px-5 py-2.5 rounded-sm bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={createSim}
            className="font-mono text-[13px] uppercase tracking-widest px-5 py-2.5 rounded-sm bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors font-semibold"
          >
            Create simulation →
          </button>
        )}
      </div>
    </div>
  );
}
