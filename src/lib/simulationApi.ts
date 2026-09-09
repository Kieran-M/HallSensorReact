import type { AnimationParams, MagnetParams, SensorPosition } from "../store/simulatorStore";

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
) {
  const response = await fetch(
    "http://localhost:8000/simulate",
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
    console.log(errorText)
    throw new Error(
      `Simulation failed: ${errorText}`
    );
  }

  return await response.json();
}
