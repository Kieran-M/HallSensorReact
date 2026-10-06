import { useEffect } from "react";
import { useSimulatorStore } from "../../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import type { FieldSample } from "../../lib/fieldMath";
import { startSmoothSeek } from "../../lib/playbackCursor";

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2] as const;

interface PlaybackHudProps {
  dataset: FieldSample[];
}

/** Live readout + transport controls overlaid on the shared 3D canvas. */
export function PlaybackHud({ dataset }: PlaybackHudProps) {
  const {
    playing,
    currentFrame,
    currentTime,
    fps,
    frameCount,
    playbackSpeed,
  } = useSimulatorStore(
    useShallow((s) => ({
      playing: s.playing,
      currentFrame: s.currentFrame,
      currentTime: s.currentTime,
      fps: s.fps,
      frameCount: s.simulation?.frames.length ?? 0,
      playbackSpeed: s.playbackSpeed,
    })),
  );

  const { play, pause, setCurrentFrame, setPlaybackSpeed } =
    useSimulatorStore.getState();

  const lastFrame = Math.max(frameCount - 1, 0);
  const done = !playing && currentFrame >= lastFrame && dataset.length > 0;
  const liveIdx =
    dataset.length <= 1
      ? 0
      : Math.min(Math.round(currentFrame), dataset.length - 1);
  const liveRow = dataset[liveIdx];

  function handlePlay() {
    if (currentFrame >= lastFrame) setCurrentFrame(0);
    play();
  }

  function handleReset() {
    pause();
    // Ease the 3D pose / playhead back to the start instead of snapping.
    startSmoothSeek(0, 0.55);
  }

  function seek(frame: number) {
    pause();
    setCurrentFrame(Math.max(0, Math.min(frame, lastFrame)));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        const s = useSimulatorStore.getState();
        const frames = s.simulation?.frames.length ?? 0;
        const last = Math.max(frames - 1, 0);
        if (s.playing) {
          s.pause();
        } else {
          if (s.currentFrame >= last) s.setCurrentFrame(0);
          s.play();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {(playing || done) && liveRow && (
        <div
          className="absolute top-3 left-3 sm:top-4 sm:left-4 rounded-sm p-2.5 sm:p-3 space-y-1.5 pointer-events-none backdrop-blur-sm z-10 w-[12rem] hs-canvas-fade-in"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--background) 85%, transparent)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="font-mono text-xs uppercase tracking-widest mb-2"
            style={{ color: "var(--accent)" }}
          >
            Live Output
          </div>
          {[
            { label: "Bx", value: `${liveRow.bx} G`, color: "#f87171" },
            { label: "By", value: `${liveRow.by} G`, color: "var(--accent)" },
            { label: "Bz", value: `${liveRow.bz} G`, color: "#a78bfa" },
            { label: "|B|", value: `${liveRow.btotal} G`, color: "#34d399" },
            { label: "Vout", value: `${liveRow.vout} V`, color: "#fbbf24" },
            { label: "Code", value: `${liveRow.code}`, color: "#94a3b8" },
          ].map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 sm:gap-4"
            >
              <span
                className="font-mono text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {r.label}
              </span>
              <span
                className="font-mono text-[13px] font-semibold"
                style={{ color: r.color }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-[min(36rem,calc(100%-1.25rem))] z-10 hs-canvas-fade-in">
        <div
          className="rounded-sm p-2.5 sm:p-3 shadow-lg backdrop-blur-md"
          style={{
            border: "1px solid var(--border)",
            backgroundColor:
              "color-mix(in srgb, var(--card) 95%, transparent)",
          }}
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${playing ? "animate-pulse" : ""}`}
                style={{
                  backgroundColor: playing
                    ? "var(--accent)"
                    : done
                      ? "#34d399"
                      : "var(--muted-foreground)",
                }}
              />
              <span
                className="font-mono text-xs uppercase tracking-widest truncate"
                style={{
                  color: playing
                    ? "var(--accent)"
                    : done
                      ? "#34d399"
                      : "var(--muted-foreground)",
                }}
              >
                {playing
                  ? "Running"
                  : done
                    ? "Complete"
                    : currentTime > 0
                      ? "Paused"
                      : "Ready"}
              </span>
            </div>
            <span
              className="font-mono text-xs uppercase tracking-widest shrink-0"
              style={{ color: "var(--muted-foreground)" }}
              title="Space toggles play/pause"
            >
              {Math.round(currentFrame)} / {lastFrame} ·{" "}
              {currentTime.toFixed(2)}s
              <span className="hidden sm:inline">
                {fps > 0 ? ` · ${fps}fps` : ""} · {playbackSpeed}×
              </span>
            </span>
          </div>

          <input
            type="range"
            className="hs-scrubber mb-2.5"
            min={0}
            max={lastFrame || 0}
            step={1}
            value={Math.min(Math.round(currentFrame), lastFrame)}
            disabled={frameCount === 0}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Scrub playback time"
          />

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={playing ? pause : handlePlay}
              className="min-w-20 sm:min-w-24 rounded-sm px-3 sm:px-4 py-1.5 font-mono text-[13px] uppercase tracking-widest transition-colors bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            >
              {playing
                ? "Ⅱ Pause"
                : currentTime > 0 && !done
                  ? "▶ Resume"
                  : "▶ Play"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-sm px-3 sm:px-4 py-1.5 font-mono text-[13px] uppercase tracking-widest transition-colors border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50"
            >
              ■ Reset
            </button>

            <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:ml-1 sm:pl-2 sm:border-l sm:border-[var(--border)]">
              <span
                className="font-mono text-xs uppercase tracking-widest mr-1 hidden sm:inline"
                style={{ color: "var(--muted-foreground)" }}
              >
                Speed
              </span>
              {SPEED_OPTIONS.map((speed) => {
                const active = playbackSpeed === speed;
                return (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackSpeed(speed)}
                    className="rounded-sm px-1.5 py-1 font-mono text-xs uppercase tracking-widest transition-colors hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                    style={{
                      border: "1px solid",
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--accent) 20%, transparent)"
                        : "transparent",
                      color: active
                        ? "var(--accent)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    {speed}×
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
