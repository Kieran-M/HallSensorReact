import { PACKAGE_OUTLINE_LABELS } from "./packageVisuals";
import type {
  HallType,
  PackageOutline,
  SensorPackageInfo,
} from "../types/simulation";

export type HallTypeFilter = "all" | HallType;
export type OutlineFilter = "all" | PackageOutline;

export interface SensorCatalogFilterState {
  query: string;
  hallType: HallTypeFilter;
  outline: OutlineFilter;
}

export const DEFAULT_SENSOR_CATALOG_FILTERS: SensorCatalogFilterState = {
  query: "",
  hallType: "all",
  outline: "all",
};

export const HALL_TYPE_FILTERS: { value: HallTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "linear", label: "Linear" },
  { value: "unipolar", label: "Unipolar" },
  { value: "latch", label: "Latch" },
  { value: "omnipolar", label: "Omnipolar" },
];

export const OUTLINE_FILTERS: { value: OutlineFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...(
    Object.entries(PACKAGE_OUTLINE_LABELS) as [PackageOutline, string][]
  ).map(([value, label]) => ({ value, label })),
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s\-_./]+/g, "");
}

export function matchesSensorQuery(
  pkg: SensorPackageInfo,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const qNorm = normalize(q);
  const outlineLabel = PACKAGE_OUTLINE_LABELS[pkg.packageOutline] ?? "";
  const haystacks = [
    pkg.partNumber,
    pkg.id,
    pkg.description,
    pkg.hallType,
    pkg.outputType,
    pkg.packageOutline,
    outlineLabel,
    ...pkg.packages,
    `${pkg.bopTypGauss ?? ""}`,
    `${pkg.brpTypGauss ?? ""}`,
  ];

  if (haystacks.some((h) => h.toLowerCase().includes(q))) return true;
  if (haystacks.some((h) => normalize(h).includes(qNorm))) return true;
  return false;
}

export function filterSensorPackages(
  packages: SensorPackageInfo[],
  filters: SensorCatalogFilterState,
): SensorPackageInfo[] {
  return packages
    .filter((pkg) => {
      if (filters.hallType !== "all" && pkg.hallType !== filters.hallType) {
        return false;
      }
      if (filters.outline !== "all" && pkg.packageOutline !== filters.outline) {
        return false;
      }
      return matchesSensorQuery(pkg, filters.query);
    })
    .sort((a, b) =>
      a.partNumber.localeCompare(b.partNumber, undefined, {
        sensitivity: "base",
      }),
    );
}

export function sensorCatalogFiltersActive(
  filters: SensorCatalogFilterState,
): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.hallType !== "all" ||
    filters.outline !== "all"
  );
}

/** Outlines that appear at least once in the loaded catalog. */
export function outlinesInCatalog(
  packages: SensorPackageInfo[],
): OutlineFilter[] {
  const seen = new Set<PackageOutline>();
  for (const pkg of packages) seen.add(pkg.packageOutline);
  return [
    "all",
    ...OUTLINE_FILTERS.map((o) => o.value).filter(
      (v): v is PackageOutline => v !== "all" && seen.has(v),
    ),
  ];
}
