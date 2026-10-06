import type { SimulationFrame } from "../types/simulation";

export interface FieldSample {
  t: number;
  bx: number;
  by: number;
  bz: number;
  btotal: number;
  vout: number;
  code: number;
}

const TESLA_TO_MT = 1000;

export function framesToDataset(
  frames: SimulationFrame[],
  fps: number
): FieldSample[] {
  if (frames.length === 0) return [];

  const safeFps = fps > 0 ? fps : 60;
  const last = frames.length - 1;

  return frames.map((frame, i) => ({
    // Match backend sampling: t = i / fps across duration ≈ (n-1)/fps.
    t: parseFloat((last === 0 ? 0 : i / safeFps).toFixed(4)),
    bx: parseFloat((frame.bx * TESLA_TO_MT).toFixed(3)),
    by: parseFloat((frame.by * TESLA_TO_MT).toFixed(3)),
    bz: parseFloat((frame.bz * TESLA_TO_MT).toFixed(3)),
    btotal: parseFloat((frame.magnitude * TESLA_TO_MT).toFixed(3)),
    vout: parseFloat(frame.output_voltage.toFixed(4)),
    code: frame.output_code,
  }));
}
