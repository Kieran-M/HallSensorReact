import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useShallow } from "zustand/shallow";
import { useSimulatorStore } from "../../store/simulatorStore";
import { formatTime } from "../../lib/utils";

export function PlaybackControls() {
  const {
    playing,
    play,
    pause,
    currentTime,
    setCurrentTime,
    duration,
  } = useSimulatorStore(
    useShallow((s) => ({
      playing: s.playing,
      play: s.play,
      pause: s.pause,
      currentTime: s.currentTime,
      setCurrentTime: s.setCurrentTime,
      duration: s.duration,
    }))
  );

  const skip = (seconds: number) => {
    const latest = useSimulatorStore.getState().currentTime;
    const newTime = Math.min(
      duration,
      Math.max(0, latest + seconds)
    );
    setCurrentTime(newTime);
  };

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white border shadow-sm p-4">
      {/* Transport controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => skip(-5)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Skip back 5 seconds"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={playing ? pause : play}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button
          onClick={() => skip(5)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Skip forward 5 seconds"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Current time */}
      <span className="text-sm font-mono text-gray-600 min-w-[45px]">
        {formatTime(currentTime)}
      </span>

      {/* Timeline slider */}
      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={(e) => setCurrentTime(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Total duration */}
      <span className="text-sm font-mono text-gray-600 min-w-[45px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}