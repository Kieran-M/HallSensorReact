import type {
  AnimationParams,
  MagnetParams,
  SensorPosition,
} from "../store/simulatorStore";
import {
  isSensorPackageInfo,
  parseSimulationResult,
  type SensorPackageInfo,
  type SimulationResult,
} from "../types/simulation";

export interface SimulationRequest {
  magnet: MagnetParams;
  sensor: SensorPosition;
  movement: AnimationParams;
  fps: number;
  duration: number;
  sensorPackageId: string;
  /** Optional operate supply (VDD); omits → package catalog default. */
  supply?: number;
}

function apiBaseUrl(): string {
  return (import.meta.env.VITE_SIMULATION_API_URL ?? "http://localhost:8000").replace(
    /\/+$/,
    "",
  );
}

async function readError(response: Response, fallback: string): Promise<string> {
  let detail = await response.text();
  try {
    const parsed = JSON.parse(detail) as { detail?: unknown };
    if (typeof parsed.detail === "string") detail = parsed.detail;
  } catch {
    // keep raw text
  }
  return detail.trim()
    ? `${fallback} (${response.status}): ${detail}`
    : `${fallback} (${response.status}).`;
}

export async function listSensorPackages(): Promise<SensorPackageInfo[]> {
  const response = await fetch(`${apiBaseUrl()}/sensor-packages`);
  if (!response.ok) {
    throw new Error(await readError(response, "Failed to load sensor packages"));
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isSensorPackageInfo)) {
    throw new Error("Sensor package catalog response was malformed.");
  }
  return data;
}

export async function runSimulation(
  request: SimulationRequest,
): Promise<SimulationResult> {
  const response = await fetch(`${apiBaseUrl()}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Simulation failed"));
  }

  return parseSimulationResult(await response.json());
}
