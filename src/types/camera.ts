/** Shared orbit camera so Design → Results keeps the same view. */
export interface CameraViewState {
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * Magpylib / HallSim world up = +Z (sensing / face-normal).
 * OrbitControls and the floor grid use this so screen-up matches physics-up.
 */
export const WORLD_UP: [number, number, number] = [0, 0, 1];

export const DEFAULT_CAMERA_VIEW: CameraViewState = {
  // ~80 mm iso from +X/+Y/+Z — Z is above the XY board plane
  position: [0.08, 0.06, 0.08],
  target: [0, 0, 0],
};
