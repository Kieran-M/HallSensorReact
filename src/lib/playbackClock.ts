import * as THREE from "three";
import type { SimulationFrame } from "../types/simulation";

/**
 * High-frequency playback cursor for the 3D magnet pose.
 *
 * `playbackFrameRef` is authoritative for WebGL (updated every animation frame).
 * Zustand `currentFrame` is a throttled mirror for charts / HUD only — do not
 * drive mesh transforms from the store or orbit controls will hitch.
 */
export const playbackFrameRef = { current: 0 };

/** Active smooth seek (e.g. Reset). Null when idle. */
export const seekTweenRef: {
  current: null | {
    from: number;
    to: number;
    startMs: number;
    durationMs: number;
  };
} = { current: null };

const _qa = new THREE.Quaternion();
const _qb = new THREE.Quaternion();
const _euler = new THREE.Euler();

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Pause playback and ease the frame cursor toward `to` over `durationSec`. */
export function startSmoothSeek(to: number, durationSec = 0.55): void {
  seekTweenRef.current = {
    from: playbackFrameRef.current,
    to,
    startMs: performance.now(),
    durationMs: Math.max(durationSec, 0.05) * 1000,
  };
}

/** Advance an active smooth seek. Returns true while the tween is running. */
export function tickSmoothSeek(nowMs: number = performance.now()): boolean {
  const tween = seekTweenRef.current;
  if (!tween) return false;

  const u = Math.min(1, (nowMs - tween.startMs) / tween.durationMs);
  const frame = tween.from + (tween.to - tween.from) * easeInOutCubic(u);
  syncPlaybackFrame(frame);

  if (u >= 1) {
    seekTweenRef.current = null;
    syncPlaybackFrame(tween.to);
    return false;
  }
  return true;
}

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

export function syncPlaybackFrame(frame: number): void {
  playbackFrameRef.current = frame;
}

/** Cancel an in-flight smooth seek (e.g. user scrubs the timeline). */
export function cancelSmoothSeek(): void {
  seekTweenRef.current = null;
}
