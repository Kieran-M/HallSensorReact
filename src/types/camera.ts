/** Shared orbit camera so Design → Results keeps the same view. */
export interface CameraViewState {
  position: [number, number, number];
  target: [number, number, number];
}

export const DEFAULT_CAMERA_VIEW: CameraViewState = {
  // ~80 mm orbit — comfortable for magnets in the 5–20 mm range
  position: [0.08, 0.06, 0.08],
  target: [0, 0, 0],
};
