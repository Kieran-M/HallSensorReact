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
    if (n <= 2) return 2;
    // Nearest multiple of 4 (not floor) so steppers can move past 4 → 8.
    const rounded = Math.round(n / 4) * 4;
    return Math.min(64, Math.max(4, rounded));
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

/**
 * Apply a spinner / typed value, nudging when HTML step + snap would stick
 * (e.g. axial ring at 4 with step 4 / min 2, or floor-snap loops).
 */
export function stepPoles(
  shape: MagnetShape,
  current: number,
  requested: number,
): number {
  const prev = normalizePoles(shape, current);
  if (!Number.isFinite(requested)) return prev;

  if (shape === "axial_ring") {
    if (prev === 2 && requested > current) return 4;
    if (prev === 4 && requested < current) return 2;
  }

  let next = normalizePoles(shape, requested);
  if (next === prev && requested !== current) {
    const step = polesStep(shape);
    next = normalizePoles(
      shape,
      prev + (requested > current ? step : -step),
    );
  }
  return next;
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
