import type { ReactNode, RefObject } from "react";
import {
  HALL_TYPE_FILTERS,
  OUTLINE_FILTERS,
  outlinesInCatalog,
  sensorCatalogFiltersActive,
  type HallTypeFilter,
  type OutlineFilter,
  type SensorCatalogFilterState,
} from "../../../lib/sensorCatalogFilters";
import { hallTypeColor } from "../../../lib/packageVisuals";
import type { SensorPackageInfo } from "../../../types/simulation";

function ChipRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="font-mono text-sm uppercase tracking-widest text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
  accent = "var(--accent)",
  soft = "transparent",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  accent?: string;
  soft?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="font-mono text-sm uppercase tracking-widest px-2.5 py-1.5 rounded-sm transition-colors border"
      style={{
        borderColor: active ? accent : "var(--border)",
        color: active ? accent : "var(--muted-foreground)",
        backgroundColor: active ? soft : "transparent",
      }}
    >
      {label}
    </button>
  );
}

export function SensorCatalogFilters({
  packages,
  filters,
  onChange,
  searchRef,
  searchPlaceholder = "Search PN, package, type, description…",
}: {
  packages: SensorPackageInfo[];
  filters: SensorCatalogFilterState;
  onChange: (next: SensorCatalogFilterState) => void;
  searchRef?: RefObject<HTMLInputElement | null>;
  searchPlaceholder?: string;
}) {
  const outlineOptions = outlinesInCatalog(packages);
  const active = sensorCatalogFiltersActive(filters);

  function patch(partial: Partial<SensorCatalogFilterState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={searchRef}
          type="search"
          value={filters.query}
          onChange={(e) => patch({ query: e.target.value })}
          placeholder={searchPlaceholder}
          className="w-full rounded-sm border border-[var(--border)] bg-[var(--background)] pl-3 pr-9 py-2.5 font-mono text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]/70"
          aria-label="Search sensor catalog"
        />
        {filters.query && (
          <button
            type="button"
            onClick={() => patch({ query: "" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-0 bg-transparent cursor-pointer px-1"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <ChipRow label="Hall type">
        {HALL_TYPE_FILTERS.map((f) => {
          const color =
            f.value === "all"
              ? { accent: "var(--accent)", soft: "transparent" }
              : hallTypeColor(f.value);
          return (
            <FilterChip
              key={f.value}
              active={filters.hallType === f.value}
              label={f.label}
              accent={color.accent}
              soft={color.soft}
              onClick={() => patch({ hallType: f.value as HallTypeFilter })}
            />
          );
        })}
      </ChipRow>

      <ChipRow label="Package">
        {OUTLINE_FILTERS.filter((f) => outlineOptions.includes(f.value)).map(
          (f) => (
            <FilterChip
              key={f.value}
              active={filters.outline === f.value}
              label={f.label}
              onClick={() => patch({ outline: f.value as OutlineFilter })}
            />
          ),
        )}
      </ChipRow>

      {active && (
        <button
          type="button"
          onClick={() =>
            onChange({
              query: "",
              hallType: "all",
              outline: "all",
            })
          }
          className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--accent)] border-0 bg-transparent cursor-pointer px-0"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
