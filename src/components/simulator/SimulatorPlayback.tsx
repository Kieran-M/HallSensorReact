import { useFrame } from "@react-three/fiber";
import { useSimulatorStore } from "../../store/simulatorStore";

export function SimulationPlayback() {
  useFrame((_, delta) => {
    const state =
      useSimulatorStore.getState();

    if (!state.playing) return;

    const nextTime =
      state.currentTime + delta;

    if (nextTime >= state.duration) {
      state.setCurrentTime(
        state.duration
      );

      state.pause();

      return;
    }

    state.setCurrentTime(nextTime);
  });

  return null;
}
