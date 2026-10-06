import type { SimulationFrame } from "../types/simulation";
import type { MotionType } from "../types/motion";

export interface FieldSample {
  /** Time (s) — used by scrubber / HUD, not the SRS chart X axis. */
  t: number;
  /** Path displacement from start (mm). */
  displacement: number;
  /** Motion angle metric from backend (deg). */
  angle: number;
  /** Chart X: displacement (mm) or angle (deg) per motion type. */
  x: number;
  bx: number;
  by: number;
  bz: number;
  btotal: number;
  vout: number;
  code: number;
}

export type ChartXMode = "displacement" | "angle";

/** SRS: linear → displacement (mm); rotate / hinge → magnet angle (deg). */
export function chartXModeForMotion(type: MotionType | string | undefined): ChartXMode {
  return type === "linear" ? "displacement" : "angle";
}

export function chartXLabel(mode: ChartXMode): string {
  return mode === "displacement" ? "Magnet Displacement" : "Magnet Angle";
}

export function chartXUnit(mode: ChartXMode): string {
  return mode === "displacement" ? "mm" : "deg";
}

// Magpylib B is Tesla; SRS field graphs use Gauss.
const TESLA_TO_G = 10_000;

export function framesToDataset(
  frames: SimulationFrame[],
  fps: number,
  motionType?: MotionType | string,
): FieldSample[] {
  if (frames.length === 0) return [];

  const safeFps = fps > 0 ? fps : 60;
  const last = frames.length - 1;
  const mode = chartXModeForMotion(motionType);

  return frames.map((frame, i) => {
    const displacement = parseFloat(Number(frame.displacement).toFixed(3));
    const angle = parseFloat(Number(frame.angle).toFixed(3));
    return {
      t: parseFloat((last === 0 ? 0 : i / safeFps).toFixed(4)),
      displacement,
      angle,
      x: mode === "displacement" ? displacement : angle,
      bx: parseFloat((frame.bx * TESLA_TO_G).toFixed(2)),
      by: parseFloat((frame.by * TESLA_TO_G).toFixed(2)),
      bz: parseFloat((frame.bz * TESLA_TO_G).toFixed(2)),
      btotal: parseFloat((frame.magnitude * TESLA_TO_G).toFixed(2)),
      vout: parseFloat(frame.output_voltage.toFixed(4)),
      code: frame.output_code,
    };
  });
}
