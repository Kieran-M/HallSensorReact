/**
 * Shared HallSim ↔ Magpylib ↔ Three.js coordinate frame.
 *
 * World axes are identical in the UI (mm), Magpylib (m), and the Three scene (m):
 *   X / Y = board plane, Z = face-normal / sensing / “up” (air gap).
 * The viewport matches that: `camera.up = +Z`, floor grid on XY. Mesh data are
 * not remapped — only the camera/orbit basis differs from Three’s Y-up default.
 *
 * Magpylib primitives:
 *   Cuboid (bar):     dimension (length, width, height) along (X, Y, Z); pol ±Z
 *   Cylinder / ring:  axis +Z; diameter in XY; height along Z
 *                     axial pol (0,0,Br); diametric / radial pol (±Br,0,0)
 *   Sphere:           pol (0,0,Br) — N toward +Z
 *
 * Three.js `cylinderGeometry` / default sphere poles use +Y as the axis, so those
 * meshes must apply {@link THREE_Y_AXIS_TO_MAGPYLIB_Z} before world pose.
 */

import type { MagnetShape } from "../types/magnet";

/** Rotate a +Y-axis Three primitive so its axis lies on Magpylib +Z. */
export const THREE_Y_AXIS_TO_MAGPYLIB_Z: [number, number, number] = [
  -Math.PI / 2,
  0,
  0,
];

/** Shapes whose native Three mesh is Y-up and needs the Magpylib Z align. */
export function needsMagpylibZAlign(shape: MagnetShape): boolean {
  return (
    shape === "axial_cylinder" ||
    shape === "diametric_cylinder" ||
    shape === "ring" ||
    shape === "axial_ring" ||
    shape === "sphere"
  );
}

export function magpylibAxisRotation(
  shape: MagnetShape,
): [number, number, number] {
  return needsMagpylibZAlign(shape)
    ? THREE_Y_AXIS_TO_MAGPYLIB_Z
    : [0, 0, 0];
}

/**
 * Bar / cuboid box args in Three world units: (X, Y, Z) = (length, width, height)
 * matching Magpylib Cuboid dimension=(length, width, height).
 */
export function barBoxArgsMetres(
  lengthM: number,
  widthM: number,
  heightM: number,
): [number, number, number] {
  return [lengthM, widthM, heightM];
}
