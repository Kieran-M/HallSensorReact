import type { MagnetShape } from "../types/magnet";

/**
 * Pole-count rules by magnet shape.
 * - Bar / diametric ring: even counts
 * - Axial ring: 2, or multiples of 4 when > 2
 * - Axial/diametric cylinder + sphere: dipole only (2)
 */
export function normalizePoles(shape: MagnetShape, poles: number): number {
  let n = Math.round(Number(poles));
  if (!Number.isFinite(n) || n < 2) n = 2;

  if (
    shape === "diametric_cylinder" ||
    shape === "axial_cylinder" ||
    shape === "sphere"
  ) {
    return 2;
  }

  if (shape === "axial_ring") {
    if (n === 2) return 2;
    n = Math.max(4, n - (n % 4));
    return Math.min(n, 64);
  }

  // bar + ring
  if (n % 2 !== 0) n += 1;
  return Math.min(Math.max(n, 2), 64);
}

export function polesEditable(shape: MagnetShape): boolean {
  return shape === "bar" || shape === "ring" || shape === "axial_ring";
}

/** Spinner step that lands on valid pole counts for the shape. */
export function polesStep(shape: MagnetShape): number {
  return shape === "axial_ring" ? 4 : 2;
}

export function polesHint(shape: MagnetShape): string {
  switch (shape) {
    case "bar":
      return "Even pole counts (2, 4, 6…) subdivide the bar along its length.";
    case "ring":
      return "Even pole counts (2, 4, 6…) around the outer diameter (radial multipole).";
    case "axial_ring":
      return "Use 2, or a multiple of 4 (4, 8, 12…) for axial multipole rings.";
    case "diametric_cylinder":
    case "axial_cylinder":
    case "sphere":
      return "This shape is modelled as a 2-pole (dipole) magnet.";
    default:
      return "";
  }
}
