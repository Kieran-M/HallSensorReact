import type { AnimationParams, MagnetParams, SensorPosition } from "../store/simulatorStore";
import type { SimulationResult } from "../types/simulation";

export interface XYZ {
  x: number;
  y: number;
  z: number;
}

export interface SimulationRequest {
  magnet: MagnetParams;
  sensor: SensorPosition;
  movement: AnimationParams;
  fps: number;
  duration: number;
}

export async function runSimulation(
  request: SimulationRequest
): Promise<SimulationResult> {
  const apiUrl = (
    import.meta.env.VITE_SIMULATION_API_URL ?? "http://localhost:8000"
  ).replace(/\/+$/, "");
  const response = await fetch(
    `${apiUrl}/simulate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Simulation failed: ${errorText}`
    );
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !Array.isArray((result as { frames?: unknown }).frames)
  ) {
    throw new Error("Simulation returned an invalid response.");
  }

  return result as SimulationResult;
}
