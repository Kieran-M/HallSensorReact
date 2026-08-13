import { runSimulation } from "../lib/simulationApi";
import { useSimulatorStore } from "../store/simulatorStore";

export function useSimulation() {
  const store = useSimulatorStore((s) => s);

  const setSimulationFrames = useSimulatorStore((s) => s.setSimulationFrames);

  const setCurrentTime = useSimulatorStore((s) => s.setCurrentTime);

  const setMode = useSimulatorStore((s) => s.setMode);

  const setView = useSimulatorStore((s) => s.setView);

  const play = useSimulatorStore((s) => s.play);

  const simulate = async () => {
    const result = await runSimulation({
      movement: {
        type: "linear",
        startPosition: store.animation.startPosition,
        endPosition: store.animation.endPosition,
        startRotation: store.animation.startRotation,
        endRotation: store.animation.endRotation,
      },
      fps: 60,
      duration: store.duration,
    });

    setSimulationFrames(result.frames);

    setCurrentTime(0);

    setMode("playback");

    setView("results");

    play();
  };

  return { simulate };
}
