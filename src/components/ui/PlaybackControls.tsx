import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useSimulatorStore } from "../../store/simulatorStore";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function PlaybackControls() {
  const playing = useSimulatorStore((s) => s.playing);
  const play = useSimulatorStore((s) => s.play);
  const pause = useSimulatorStore((s) => s.pause);

  const currentTime = useSimulatorStore((s) => s.currentTime);
  const duration = useSimulatorStore((s) => s.duration);

  const setCurrentTime = useSimulatorStore(
    (s) => s.setCurrentTime
  );

  const skip = (seconds: number) => {
    setCurrentTime(
      Math.min(
        duration,
        Math.max(0, currentTime + seconds)
      )
    );
  };

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white border shadow-sm p-4">
      {/* Transport Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => skip(-5)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={() =>
            playing ? pause() : play()
          }
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {playing ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}
        </button>

        <button
          onClick={() => skip(5)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Current Time */}
      <span className="text-sm font-mono text-gray-600 min-w-[45px]">
        {formatTime(currentTime)}
      </span>

      {/* Timeline */}
      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={(e) =>
            setCurrentTime(
              Number(e.target.value)
            )
          }
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Duration */}
      <span className="text-sm font-mono text-gray-600 min-w-[45px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}