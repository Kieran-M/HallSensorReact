import type {
  AnimationParams,
  MagnetParams,
  SensorPosition,
} from "../store/simulatorStore";
import {
  parseSimulationResult,
  type SimulationResult,
} from "../types/simulation";

export interface SimulationRequest {
  magnet: MagnetParams;
  sensor: SensorPosition;
  movement: AnimationParams;
  fps: number;
  duration: number;
  sensorPackageId: string;
}

function apiBaseUrl(): string {
  return (import.meta.env.VITE_SIMULATION_API_URL ?? "http://localhost:8000").replace(
    /\/+$/,
    "",
  );
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
    let detail = await response.text();
    try {
      const parsed = JSON.parse(detail) as { detail?: unknown };
      if (typeof parsed.detail === "string") detail = parsed.detail;
    } catch {
      // keep raw text
    }
    throw new Error(
      detail.trim()
        ? `Simulation failed (${response.status}): ${detail}`
        : `Simulation failed (${response.status}).`,
    );
  }

  return parseSimulationResult(await response.json());
}
