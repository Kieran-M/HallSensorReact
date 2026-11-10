import type { PackageOutline } from "../types/simulation";

/**
 * Official Diodes package STEP → GLB assets (metres).
 * Resolve by datasheet package *label* when possible — outline alone is too coarse
 * (e.g. all DFNs were incorrectly sharing the 1410 mesh).
 * SC59 / SOT553 have no public STEP on diodes.com — procedural fallback.
 */

export type PackageModelSpec = {
  url: string;
  /**
   * Local Euler XYZ (radians) applied before centering so marking/top → Magpylib +Z
   * and the board/pads → −Z.
   */
  rotation: [number, number, number];
  /** Stable key for thumbs / preload. */
  id: string;
  /**
   * Optional mesh-name filters for AABB origin (body only — ignore long leads).
   * Matched case-insensitively as substrings along the object→parent name chain.
   */
  centerMeshNameIncludes?: string[];
  /**
   * Drop STEP meshes whose names match (e.g. TO-92S stock leads ~18 mm long).
   * Short display leads can be drawn procedurally instead.
   */
  omitMeshNameIncludes?: string[];
  /** Draw short SIP/TO-92 lead stubs after omitting the STEP leadframe. */
  proceduralSipLeads?: boolean;
};

const HALF_PI = Math.PI / 2;

const MODELS = {
  sot23: {
    id: "sot23",
    url: "/models/packages/sot23.glb",
    // Body already roughly Z-up (thickness ~Z).
    rotation: [0, 0, 0] as [number, number, number],
  },
  sip3: {
    id: "sip3",
    url: "/models/packages/sip3.glb",
    rotation: [0, 0, 0] as [number, number, number],
    // Official TO-92S STEP includes ~18 mm unformed stock leads (NAUO2) that
    // dwarf the 4×3 mm body in the sim — omit them and draw short stubs.
    centerMeshNameIncludes: ["nauo3", "nauo4"],
    omitMeshNameIncludes: ["nauo2"],
    proceduralSipLeads: true,
  },
  /** X2-DFN1410-4 / DFN1410A-4 — face XY, thickness +Z. */
  dfn1410: {
    id: "dfn1410",
    url: "/models/packages/dfn.glb",
    rotation: [0, 0, 0] as [number, number, number],
  },
  /** X2-DFN1010-4 Type B / DFN1010H4B-4 — STEP thickness on +X; pads on +X end. */
  dfn1010: {
    id: "dfn1010",
    url: "/models/packages/dfn1010h4b-4.glb",
    // Ry(+π/2): +X → −Z so leadframe/pads face board (−Z), marking +Z.
    rotation: [0, HALF_PI, 0] as [number, number, number],
  },
  /** U-DFN2020-6 — STEP thickness on +Y; leadframe on +Y end. */
  dfn2020: {
    id: "dfn2020",
    url: "/models/packages/u-dfn2020-6.glb",
    // Rx(−π/2): +Y → −Z so pads face board (−Z), marking +Z.
    rotation: [-HALF_PI, 0, 0] as [number, number, number],
  },
} as const satisfies Record<string, PackageModelSpec>;

/** @deprecated Prefer resolvePackageModel(outline, label). */
export const PACKAGE_GLB_URL: Partial<Record<PackageOutline, string>> = {
  sot23: MODELS.sot23.url,
  sip3: MODELS.sip3.url,
  dfn: MODELS.dfn1410.url,
};

export function normalizePackageLabel(label: string | null | undefined): string {
  return (label ?? "").toUpperCase().replace(/\s+/g, " ").trim();
}

/**
 * Pick the official mesh for a mechanical variant.
 * Label wins over outline so AH1381’s X2-DFN1010-4 Type B ≠ DFN1410.
 */
export function resolvePackageModel(
  outline: PackageOutline,
  label?: string | null,
): PackageModelSpec | null {
  const blob = normalizePackageLabel(label);

  if (
    blob.includes("DFN1010") ||
    blob.includes("1010H4B") ||
    blob.includes("1010-4")
  ) {
    return MODELS.dfn1010;
  }
  if (
    blob.includes("DFN1410") ||
    blob.includes("1410A") ||
    blob.includes("1410-4")
  ) {
    return MODELS.dfn1410;
  }
  if (
    blob.includes("DFN2020") ||
    blob.includes("U-DFN2020") ||
    blob.includes("2020-6")
  ) {
    return MODELS.dfn2020;
  }

  if (outline === "sot23" || blob.includes("SOT23") || blob.includes("SOT-23")) {
    return MODELS.sot23;
  }
  if (
    outline === "sip3" ||
    blob.includes("SIP") ||
    blob.includes("TO92") ||
    blob.includes("TO-92")
  ) {
    return MODELS.sip3;
  }
  if (outline === "dfn" || blob.includes("DFN") || blob.includes("WLB")) {
    // Generic DFN family → 1410 mesh (most common in the Hall catalog).
    return MODELS.dfn1410;
  }

  // sc59 / sot553 — no STEP
  return null;
}

export function hasPackageGlb(
  outline: PackageOutline,
  label?: string | null,
): boolean {
  return resolvePackageModel(outline, label) != null;
}

/** All distinct official URLs (for preload). */
export function allPackageGlbUrls(): string[] {
  return [...new Set(Object.values(MODELS).map((m) => m.url))];
}

/** All official package model specs (for catalog thumb warm-up). */
export function allPackageModels(): PackageModelSpec[] {
  return Object.values(MODELS);
}

/** Thumb / catalog key when a GLB exists; else outline. */
export function packageThumbKey(
  outline: PackageOutline,
  label?: string | null,
): string {
  return resolvePackageModel(outline, label)?.id ?? outline;
}
