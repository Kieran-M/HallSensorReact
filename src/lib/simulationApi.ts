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

export interface ApiHealth {
  status: string;
  version?: string;
  packages?: number;
}

declare global {
  interface Window {
    /** Optional runtime override (set before mount; useful without rebuild). */
    __HALLSIM_API_URL__?: string;
  }
}

export function apiBaseUrl(): string {
  const runtime =
    typeof window !== "undefined" ? window.__HALLSIM_API_URL__ : undefined;
  const fromEnv = import.meta.env.VITE_SIMULATION_API_URL as string | undefined;
  return (runtime || fromEnv || "http://localhost:8000").replace(/\/+$/, "");
}

function networkHint(_cause: unknown): string {
  const base = apiBaseUrl();
  return `Can't reach the simulation API at ${base}. Is the backend running?`;
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

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${apiBaseUrl()}${path}`, init);
  } catch (err) {
    throw new Error(networkHint(err));
  }
}

export async function checkApiHealth(): Promise<ApiHealth> {
  const response = await apiFetch("/health");
  if (!response.ok) {
    throw new Error(await readError(response, "API health check failed"));
  }
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("status" in data)) {
    throw new Error("API health response was malformed.");
  }
  return data as ApiHealth;
}

export async function listSensorPackages(): Promise<SensorPackageInfo[]> {
  const response = await apiFetch("/sensor-packages");
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
  const response = await apiFetch("/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Simulation failed"));
  }

  return parseSimulationResult(await response.json());
}
