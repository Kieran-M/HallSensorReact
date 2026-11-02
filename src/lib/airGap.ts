import type { MagnetParams } from "../types/magnet";

/** Half-extent of the magnet along Magpylib / world Z (mm) for face-gap estimates. */
export function magnetHalfHeightMm(magnet: MagnetParams): number {
  switch (magnet.shape) {
    case "sphere":
      return magnet.diameter / 2;
    case "bar":
    case "axial_cylinder":
    case "diametric_cylinder":
    case "ring":
    case "axial_ring":
      return magnet.height / 2;
  }
}

/**
 * Approximate face-to-sensor air gap (mm) when the magnet sits above the sensor
 * along +Z. Sensor at `sensorZ`; magnet centre at `magnetCenterZ`.
 */
export function faceAirGapMm(
  magnet: MagnetParams,
  magnetCenterZ: number,
  sensorZ = 0,
): number {
  return magnetCenterZ - sensorZ - magnetHalfHeightMm(magnet);
}

/** Magnet centre Z that yields the requested face air gap. */
export function magnetCenterZForFaceGap(
  magnet: MagnetParams,
  faceGapMm: number,
  sensorZ = 0,
): number {
  return sensorZ + magnetHalfHeightMm(magnet) + faceGapMm;
}
