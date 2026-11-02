import * as THREE from "three";

/** Live main-viewport camera pose for the corner axis gizmo overlay. */
export const cameraBridge = {
  quaternion: new THREE.Quaternion(),
  target: new THREE.Vector3(),
  distance: 0.12,
};

export type CameraSnapAxis = "x" | "y" | "z" | "-x" | "-y" | "-z" | "iso";

export const cameraSnapRequest = {
  current: null as CameraSnapAxis | null,
};

export function requestCameraSnap(axis: CameraSnapAxis): void {
  cameraSnapRequest.current = axis;
}

/** Avoid exact polar poles where OrbitControls azimuth is unstable. */
export const CAMERA_SNAP_POLE_EPS = 1e-3;

/**
 * OrbitControls spherical (θ azimuth, φ polar) for a view along a world axis
 * when `camera.up = +Z` (Magpylib). Internally controls map +Z → Y-up space:
 * polar 0 = +Z; after that map, world −Y → θ=0 and world +X → θ=+π/2.
 */
export function snapSphericalAngles(snap: CameraSnapAxis): {
  theta: number;
  phi: number;
} {
  switch (snap) {
    case "z":
      return { theta: 0, phi: CAMERA_SNAP_POLE_EPS };
    case "-z":
      return { theta: 0, phi: Math.PI - CAMERA_SNAP_POLE_EPS };
    case "x":
      return { theta: Math.PI / 2, phi: Math.PI / 2 };
    case "-x":
      return { theta: -Math.PI / 2, phi: Math.PI / 2 };
    case "y":
      return { theta: Math.PI, phi: Math.PI / 2 };
    case "-y":
      return { theta: 0, phi: Math.PI / 2 };
    case "iso":
    default:
      return { theta: Math.PI / 4, phi: Math.PI / 3 };
  }
}
