import { useFrame } from "@react-three/fiber";
import { useSimulatorStore } from "../../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import { simulationFramesRef } from "../../store/simulatorStore";

export const PlaybackDriver = () => {
  const { playing, currentTime, setCurrentTime } = useSimulatorStore(
    useShallow((s) => ({
      playing: s.playing,
      currentTime: s.currentTime,
      setCurrentTime: s.setCurrentTime,
    }))
  );

  const frames = simulationFramesRef.current;
  const FPS = 60;

  useFrame((_state, delta) => {
    if (!playing || frames.length === 0) return;

    // advance the logical time (seconds)
    const next = currentTime + delta;
    const duration = frames.length / FPS; // total seconds of the simulation
    const clamped = next % duration;

    setCurrentTime(clamped);
  });

  return null;
};