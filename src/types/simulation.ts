/**
 * Shared simulation domain types.
 *
 * Frame pose units from the backend:
 * - position: metres
 * - rotation: radians, Euler XYZ (unwrapped for continuous playback)
 *
 * UI motion inputs are millimetres / degrees; conversion happens server-side.
 */

export interface SensorPackageInfo {
  id: string;
  partNumber: string;
  description: string;
  sensitivityVPerT: number;
  vref: number;
  supply: number;
  adcBits: number;
  sensingAxis: "x" | "y" | "z";
}

export interface SimulationFrame {
  position: [number, number, number];
  rotation: [number, number, number];
  bx: number;
  by: number;
  bz: number;
  magnitude: number;
  displacement: number;
  angle: number;
  output_voltage: number;
  output_code: number;
}

export interface SimulationResult {
  fps: number;
  duration: number;
  sensorPackage: SensorPackageInfo;
  frames: SimulationFrame[];
}

export function isSensorPackageInfo(value: unknown): value is SensorPackageInfo {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.partNumber === "string" &&
    typeof o.sensitivityVPerT === "number" &&
    typeof o.vref === "number" &&
    typeof o.supply === "number" &&
    typeof o.adcBits === "number" &&
    (o.sensingAxis === "x" || o.sensingAxis === "y" || o.sensingAxis === "z")
  );
}

export function isSimulationFrame(value: unknown): value is SimulationFrame {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    Array.isArray(o.position) &&
    o.position.length === 3 &&
    Array.isArray(o.rotation) &&
    o.rotation.length === 3 &&
    typeof o.bx === "number" &&
    typeof o.by === "number" &&
    typeof o.bz === "number" &&
    typeof o.magnitude === "number" &&
    typeof o.output_voltage === "number" &&
    typeof o.output_code === "number"
  );
}

export function parseSimulationResult(value: unknown): SimulationResult {
  if (typeof value !== "object" || value === null) {
    throw new Error("Simulation returned an invalid response.");
  }
  const o = value as Record<string, unknown>;
  if (typeof o.fps !== "number" || typeof o.duration !== "number") {
    throw new Error("Simulation response missing fps/duration.");
  }
  if (!isSensorPackageInfo(o.sensorPackage)) {
    throw new Error("Simulation response missing sensor package.");
  }
  if (!Array.isArray(o.frames) || o.frames.length === 0) {
    throw new Error("Simulation returned no frames.");
  }
  if (!o.frames.every(isSimulationFrame)) {
    throw new Error("Simulation returned malformed frames.");
  }
  return {
    fps: o.fps,
    duration: o.duration,
    sensorPackage: o.sensorPackage,
    frames: o.frames,
  };
}
