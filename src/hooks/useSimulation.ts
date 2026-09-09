import { runSimulation } from "../lib/simulationApi";
import {
  useSimulatorStore,
  simulationFramesRef,
} from "../store/simulatorStore";
import { useShallow } from "zustand/shallow";

// type SimConfig = {
//   startPosition: { x: number; y: number; z: number };
//   endPosition: { x: number; y: number; z: number };
//   startRotation: { x: number; y: number; z: number };
//   endRotation: { x: number; y: number; z: number };
//   duration: number;
// };

const useSimConfig = () =>
  useSimulatorStore(
    useShallow((s) => ({
      magnet: s.magnet,
      sensor: s.sensor,
      movement: s.animation,
      startPosition: s.animation.startPosition,
      endPosition: s.animation.endPosition,
      startRotation: s.animation.startRotation,
      endRotation: s.animation.endRotation,
      duration: s.duration,
    })),
  );

export function useSimulation(): {
  simulate: () => Promise<void>;
} {
  const cfg = useSimConfig();

  const { setCurrentTime, setMode, setView, play } =
    useSimulatorStore.getState();

  const simulate = async (): Promise<void> => {
    const result = await runSimulation({
      magnet: cfg.magnet,
      sensor: cfg.sensor,
      movement: {
        type: "linear",
        startPosition: cfg.startPosition,
        endPosition: cfg.endPosition,
        startRotation: cfg.startRotation,
        endRotation: cfg.endRotation,
      },
      fps: 60,
      duration: cfg.duration,
    });

    simulationFramesRef.current = result.frames;

    useSimulatorStore.setState({
      currentTime: 0,
      mode: "playback",
      view: "results",
    });
    setMode("playback");
    setView("results");
    play();
  };
  return { simulate };
}
