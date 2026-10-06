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
