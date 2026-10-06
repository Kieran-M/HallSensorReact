/**
 * Playback frame cursor + seek tween — no Three.js dependency.
 * Safe for the Zustand store / presets shell (ESM embed first paint).
 *
 * Pose application for WebGL lives in playbackClock.ts.
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

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function syncPlaybackFrame(frame: number): void {
  playbackFrameRef.current = frame;
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

/** Cancel an in-flight smooth seek (e.g. user scrubs the timeline). */
export function cancelSmoothSeek(): void {
  seekTweenRef.current = null;
}
