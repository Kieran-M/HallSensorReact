/**
 * Package outline visuals + Hall-type accent colors.
 * Outlines are approximate mechanical families (not vendor STEP/GLTF assets).
 */

import type { HallType, PackageOutline } from "../types/simulation";

export const HALL_TYPE_COLORS: Record<
  HallType,
  { accent: string; soft: string; label: string }
> = {
  linear: { accent: "#38bdf8", soft: "rgba(56,189,248,0.18)", label: "Linear" },
  unipolar: {
    accent: "#34d399",
    soft: "rgba(52,211,153,0.18)",
    label: "Unipolar",
  },
  latch: { accent: "#f59e0b", soft: "rgba(245,158,11,0.18)", label: "Latch" },
  omnipolar: {
    accent: "#22d3ee",
    soft: "rgba(34,211,238,0.18)",
    label: "Omnipolar",
  },
};

export const PACKAGE_OUTLINE_LABELS: Record<PackageOutline, string> = {
  sot23: "SOT-23",
  sc59: "SC59",
  sot553: "SOT-553",
  sip3: "SIP-3 / TO-92",
  dfn: "DFN / WLB",
};

export function hallTypeColor(type: HallType) {
  return HALL_TYPE_COLORS[type] ?? HALL_TYPE_COLORS.linear;
}
