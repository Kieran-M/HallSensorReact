import * as THREE from "three";
import type { SimulationFrame } from "../types/simulation";

export {
  playbackFrameRef,
  seekTweenRef,
  syncPlaybackFrame,
  startSmoothSeek,
  tickSmoothSeek,
  cancelSmoothSeek,
} from "./playbackCursor";

const _qa = new THREE.Quaternion();
const _qb = new THREE.Quaternion();
const _euler = new THREE.Euler();

/** Write interpolated pose for `frameFloat` into a Three.js Object3D. */
export function applyFramePose(
  frames: SimulationFrame[],
  frameFloat: number,
  target: THREE.Object3D,
): void {
  if (frames.length === 0) return;

  const last = frames.length - 1;
  const f = Math.min(Math.max(frameFloat, 0), last);
  const idx = Math.floor(f);
  const alpha = f - idx;

  const frameA = frames[idx] ?? frames[last];
  const frameB = frames[Math.min(idx + 1, last)] ?? frameA;

  const ax = frameA.position[0];
  const ay = frameA.position[1];
  const az = frameA.position[2];
  target.position.set(
    ax + (frameB.position[0] - ax) * alpha,
    ay + (frameB.position[1] - ay) * alpha,
    az + (frameB.position[2] - az) * alpha,
  );

  _euler.set(frameA.rotation[0], frameA.rotation[1], frameA.rotation[2], "XYZ");
  _qa.setFromEuler(_euler);
  _euler.set(frameB.rotation[0], frameB.rotation[1], frameB.rotation[2], "XYZ");
  _qb.setFromEuler(_euler);
  target.quaternion.copy(_qa).slerp(_qb, alpha);
}
