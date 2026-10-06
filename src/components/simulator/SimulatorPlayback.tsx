import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulatorStore } from "../../store/simulatorStore";
import {
  playbackFrameRef,
  seekTweenRef,
  syncPlaybackFrame,
  tickSmoothSeek,
} from "../../lib/playbackCursor";

/** How often charts / HUD pull from the high-frequency clock (ms). */
const UI_SYNC_MS = 80;

/**
 * Advances the playback frame ref every rAF (cheap).
 * Also drives smooth seeks (Reset). Throttles Zustand UI sync.
 */
export function SimulationPlayback() {
  const lastUiSync = useRef(0);

  useFrame((_, delta) => {
    const state = useSimulatorStore.getState();
    const fps = state.fps > 0 ? state.fps : 60;
    const now = performance.now();

    // Smooth Reset / seek takes priority over normal playback.
    if (seekTweenRef.current) {
      const running = tickSmoothSeek(now);
      if (now - lastUiSync.current >= UI_SYNC_MS || !running) {
        lastUiSync.current = now;
        const frame = playbackFrameRef.current;
        if (!running) {
          state.setCurrentFrame(frame);
        } else {
          useSimulatorStore.setState({
            currentFrame: frame,
            currentTime: frame / fps,
          });
        }
      }
      return;
    }

    if (!state.playing) return;

    const frameCount = state.simulation?.frames.length ?? 0;
    const last = Math.max(frameCount - 1, 0);
    if (last <= 0) {
      state.pause();
      return;
    }

    const speed = state.playbackSpeed > 0 ? state.playbackSpeed : 1;
    const dt = Math.min(Math.max(delta, 0), 1 / 20);
    const next = playbackFrameRef.current + dt * fps * speed;

    if (next >= last) {
      syncPlaybackFrame(last);
      state.setCurrentFrame(last);
      state.pause();
      lastUiSync.current = now;
      return;
    }

    syncPlaybackFrame(next);

    if (now - lastUiSync.current >= UI_SYNC_MS) {
      lastUiSync.current = now;
      useSimulatorStore.setState({
        currentFrame: next,
        currentTime: next / fps,
      });
    }
  });

  return null;
}
