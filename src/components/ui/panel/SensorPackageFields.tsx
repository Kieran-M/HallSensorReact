import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { listSensorPackages } from "../../../lib/simulationApi";
import {
  hallTypeColor,
  PACKAGE_OUTLINE_LABELS,
} from "../../../lib/packageVisuals";
import { useSimulatorStore } from "../../../store/simulatorStore";
import type { HallType, SensorPackageInfo } from "../../../types/simulation";
import { PackageThumb } from "./PackageThumb";

type TypeFilter = "all" | HallType;

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "linear", label: "Linear" },
  { value: "unipolar", label: "Unipolar" },
  { value: "latch", label: "Latch" },
  { value: "omnipolar", label: "Omnipolar" },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s\-_./]+/g, "");
}

function matchesQuery(pkg: SensorPackageInfo, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const qNorm = normalize(q);
  const haystacks = [
    pkg.partNumber,
    pkg.id,
    pkg.description,
    pkg.hallType,
    pkg.outputType,
    pkg.packageOutline,
    ...pkg.packages,
    `${pkg.bopTypGauss ?? ""}`,
    `${pkg.brpTypGauss ?? ""}`,
  ];

  if (haystacks.some((h) => h.toLowerCase().includes(q))) return true;
  if (haystacks.some((h) => normalize(h).includes(qNorm))) return true;
  return false;
}

function TypeBadge({ type }: { type: HallType }) {
  const c = hallTypeColor(type);
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
      style={{
        color: c.accent,
        backgroundColor: c.soft,
        border: `1px solid color-mix(in srgb, ${c.accent} 45%, transparent)`,
      }}
    >
      {c.label}
    </span>
  );
}

function PackageMeta({ pkg }: { pkg: SensorPackageInfo }) {
  return (
    <div className="font-mono text-xs text-[var(--muted-foreground)] space-y-0.5">
      <div>
        {PACKAGE_OUTLINE_LABELS[pkg.packageOutline]}
        {pkg.packages[0] ? ` · ${pkg.packages[0]}` : ""}
      </div>
      <div>
        {pkg.outputType} · {pkg.supply} V · axis {pkg.sensingAxis.toUpperCase()}
      </div>
      {pkg.hallType === "linear" ? (
        <div>
          Sensitivity {pkg.sensitivityVPerT ?? "—"} V/T · Vref {pkg.vref ?? "—"}{" "}
          V
        </div>
      ) : (
        <div>
          Bop {pkg.bopTypGauss ?? "—"} G · Brp {pkg.brpTypGauss ?? "—"} G
        </div>
      )}
    </div>
  );
}

function SensorCatalogModal({
  open,
  onClose,
  packages,
  loading,
  loadError,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  packages: SensorPackageInfo[];
  loading: boolean;
  loadError: string | null;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const titleId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = window.setTimeout(() => searchRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      if (typeFilter !== "all" && pkg.hallType !== typeFilter) return false;
      return matchesQuery(pkg, query);
    });
  }, [packages, query, typeFilter]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        aria-label="Close catalog"
        className="absolute inset-0 border-0 p-0 cursor-pointer"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8,20,35,0.55), rgba(8,20,35,0.78))",
        }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[81] flex flex-col w-full sm:max-w-3xl max-h-[min(92dvh,44rem)] rounded-t-md sm:rounded-md overflow-hidden shadow-2xl"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      >
        <header
          className="shrink-0 px-4 py-4 flex items-start justify-between gap-3"
          style={{
            background:
              "linear-gradient(120deg, color-mix(in srgb, #38bdf8 18%, var(--card)), color-mix(in srgb, #34d399 12%, var(--card)), color-mix(in srgb, #f59e0b 10%, var(--card)))",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="min-w-0">
            <div
              id={titleId}
              className="font-mono text-sm font-semibold tracking-wide"
            >
              Sensor catalog
            </div>
            <p className="font-mono text-xs text-[var(--muted-foreground)] mt-0.5">
              {loading
                ? "Loading parts…"
                : `${filtered.length} of ${packages.length} parts · package meshes by outline`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-xs uppercase tracking-widest px-2 py-1 rounded-sm border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors bg-[var(--card)]/70"
          >
            Close
          </button>
        </header>

        <div
          className="shrink-0 px-4 py-3 space-y-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="relative">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PN, package, type, description…"
              className="w-full rounded-sm border border-[var(--border)] bg-[var(--background)] pl-3 pr-9 py-2.5 font-mono text-[13px] text-[var(--foreground)] outline-none focus:border-[var(--accent)]/70"
              aria-label="Search sensor catalog"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-0 bg-transparent cursor-pointer px-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map((f) => {
              const active = typeFilter === f.value;
              const color =
                f.value === "all"
                  ? { accent: "var(--accent)", soft: "transparent" }
                  : hallTypeColor(f.value);
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTypeFilter(f.value)}
                  className="font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded-sm transition-colors border"
                  style={{
                    borderColor: active ? color.accent : "var(--border)",
                    color: active ? color.accent : "var(--muted-foreground)",
                    backgroundColor: active ? color.soft : "transparent",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {loadError && (
            <p className="p-4 font-mono text-xs text-red-400 leading-relaxed">
              {loadError}
            </p>
          )}
          {!loadError && !loading && filtered.length === 0 && (
            <p className="p-6 font-mono text-xs text-[var(--muted-foreground)] text-center">
              No sensors match “{query.trim() || typeFilter}”.
            </p>
          )}
          <ul className="p-2 grid gap-2 sm:grid-cols-2">
            {filtered.map((pkg) => {
              const selected = pkg.id === selectedId;
              const c = hallTypeColor(pkg.hallType);
              return (
                <li key={pkg.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(pkg.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-sm transition-colors border cursor-pointer flex gap-3 items-start"
                    style={{
                      borderColor: selected ? c.accent : "var(--border)",
                      backgroundColor: selected
                        ? c.soft
                        : "color-mix(in srgb, var(--background) 55%, transparent)",
                    }}
                  >
                    <PackageThumb
                      outline={pkg.packageOutline}
                      hallType={pkg.hallType}
                      size={64}
                    />
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[13px] font-semibold text-[var(--foreground)]">
                          {pkg.partNumber}
                        </span>
                        <TypeBadge type={pkg.hallType} />
                        {selected && (
                          <span
                            className="font-mono text-[10px] uppercase tracking-widest"
                            style={{ color: c.accent }}
                          >
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                        {pkg.description}
                      </p>
                      <PackageMeta pkg={pkg} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Compact selected-sensor summary + catalog browser. */
export function SensorPackageFields() {
  const sensorPackageId = useSimulatorStore((s) => s.sensorPackageId);
  const setSensorPackageId = useSimulatorStore((s) => s.setSensorPackageId);
  const setSensorCatalog = useSimulatorStore((s) => s.setSensorCatalog);
  const packages = useSimulatorStore((s) => s.sensorCatalog);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listSensorPackages()
      .then((list) => {
        if (cancelled) return;
        setSensorCatalog(list);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load sensor packages",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setSensorCatalog]);

  const selected =
    packages.find((pkg) => pkg.id === sensorPackageId) ?? null;
  const selectedColor = selected
    ? hallTypeColor(selected.hallType)
    : hallTypeColor("linear");

  return (
    <div className="space-y-3">
      <div
        className="rounded-sm p-3 space-y-2"
        style={{
          border: `1px solid color-mix(in srgb, ${selectedColor.accent} 40%, var(--border))`,
          background: `linear-gradient(135deg, ${selectedColor.soft}, color-mix(in srgb, var(--background) 80%, transparent))`,
        }}
      >
        {loading && !selected ? (
          <p className="font-mono text-xs text-[var(--muted-foreground)]">
            Loading package…
          </p>
        ) : selected ? (
          <div className="flex gap-3 items-start">
            <PackageThumb
              outline={selected.packageOutline}
              hallType={selected.hallType}
              size={58}
            />
            <div className="min-w-0 space-y-1 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
                    Selected package
                  </div>
                  <div className="font-mono text-[13px] font-semibold text-[var(--foreground)]">
                    {selected.partNumber}
                  </div>
                </div>
                <TypeBadge type={selected.hallType} />
              </div>
              <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                {selected.description}
              </p>
              <PackageMeta pkg={selected} />
            </div>
          </div>
        ) : (
          <p className="font-mono text-xs text-[var(--muted-foreground)]">
            {loadError
              ? "Catalog unavailable"
              : `Unknown package “${sensorPackageId}”`}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setCatalogOpen(true)}
        disabled={loading && packages.length === 0 && !loadError}
        className="w-full font-mono text-[13px] uppercase tracking-widest py-2.5 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          border: `1px solid color-mix(in srgb, ${selectedColor.accent} 55%, var(--border))`,
          color: selectedColor.accent,
          backgroundColor: selectedColor.soft,
        }}
      >
        Browse catalog
        {!loading && packages.length > 0 ? ` · ${packages.length}` : ""}
      </button>

      {loadError && (
        <p className="font-mono text-xs text-red-400 leading-relaxed">
          {loadError}
        </p>
      )}

      <SensorCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        packages={packages}
        loading={loading}
        loadError={loadError}
        selectedId={sensorPackageId}
        onSelect={setSensorPackageId}
      />
    </div>
  );
}
