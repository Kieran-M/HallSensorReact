/**
 * Shared simulation domain types.
 *
 * Frame pose units from the backend:
 * - position: metres
 * - rotation: radians, Euler XYZ (unwrapped for continuous playback)
 *
 * UI motion inputs are millimetres / degrees; conversion happens server-side.
 */

export type HallType = "linear" | "unipolar" | "latch" | "omnipolar";
export type SensingAxis = "x" | "y" | "z";
export type ActiveLevel = "low" | "high";
export type PackageOutline = "sot23" | "sc59" | "sot553" | "sip3" | "dfn";

/** Catalog coefficients: Sens(mV/G) = slope × VDD + intercept */
export interface RatiometricSensitivityModel {
  type: "ratiometric_mv_per_g";
  slope: number;
  intercept: number;
}

export interface SensorPackageInfo {
  id: string;
  partNumber: string;
  description: string;
  hallType: HallType;
  supply: number;
  sensingAxis: SensingAxis;
  outputType: string;
  sensitivityVPerT?: number | null;
  vref?: number | null;
  adcBits?: number | null;
  sensitivityModel?: RatiometricSensitivityModel | null;
  bopTypGauss?: number | null;
  brpTypGauss?: number | null;
  activeLevel?: ActiveLevel | null;
  packages: string[];
  packageOutline: PackageOutline;
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

function isHallType(value: unknown): value is HallType {
  return (
    value === "linear" ||
    value === "unipolar" ||
    value === "latch" ||
    value === "omnipolar"
  );
}

function isSensingAxis(value: unknown): value is SensingAxis {
  return value === "x" || value === "y" || value === "z";
}

function isPackageOutline(value: unknown): value is PackageOutline {
  return (
    value === "sot23" ||
    value === "sc59" ||
    value === "sot553" ||
    value === "sip3" ||
    value === "dfn"
  );
}

export function isSensorPackageInfo(
  value: unknown,
): value is SensorPackageInfo {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.partNumber === "string" &&
    typeof o.description === "string" &&
    isHallType(o.hallType) &&
    typeof o.supply === "number" &&
    isSensingAxis(o.sensingAxis) &&
    typeof o.outputType === "string" &&
    Array.isArray(o.packages) &&
    o.packages.every((p) => typeof p === "string") &&
    isPackageOutline(o.packageOutline)
  );
}

export function isDigitalHall(packageInfo?: SensorPackageInfo | null): boolean {
  return !!packageInfo && packageInfo.hallType !== "linear";
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
