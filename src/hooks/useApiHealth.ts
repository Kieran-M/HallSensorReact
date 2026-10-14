import { useEffect, useState } from "react";
import { apiBaseUrl, checkApiHealth } from "../lib/simulationApi";

export type ApiStatus = "checking" | "ok" | "down";

export function useApiHealth(pollMs = 30_000): {
  status: ApiStatus;
  packages: number | null;
  apiUrl: string;
  refresh: () => void;
} {
  const [status, setStatus] = useState<ApiStatus>("checking");
  const [packages, setPackages] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const health = await checkApiHealth();
        if (cancelled) return;
        setStatus(health.status === "ok" ? "ok" : "down");
        setPackages(
          typeof health.packages === "number" ? health.packages : null,
        );
      } catch {
        if (cancelled) return;
        setStatus("down");
        setPackages(null);
      }
    };

    void run();
    const id = window.setInterval(() => void run(), pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs, tick]);

  return {
    status,
    packages,
    apiUrl: apiBaseUrl(),
    refresh: () => setTick((t) => t + 1),
  };
}
