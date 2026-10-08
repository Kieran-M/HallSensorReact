import { runSimulation } from "../lib/simulationApi";
import { resolveOperateSupply } from "../lib/sensitivityDisplay";
import { useSimulatorStore } from "../store/simulatorStore";

export function useSimulation(): {
  simulate: () => Promise<void>;
  simulating: boolean;
  simulationError: string | null;
} {
  const simulating = useSimulatorStore((s) => s.simulating);
  const simulationError = useSimulatorStore((s) => s.simulationError);

  const simulate = async (): Promise<void> => {
    const store = useSimulatorStore.getState();
    const {
      magnet,
      sensor,
      sensorPackageId,
      sensorCatalog,
      supplyVdd,
      animation,
      duration,
      fps,
    } = store;

    const pkg = sensorCatalog.find((p) => p.id === sensorPackageId);
    const supply = resolveOperateSupply(pkg, supplyVdd);

    store.setSimulating(true);
    store.setSimulationError(null);

    try {
      const result = await runSimulation({
        magnet,
        sensor,
        movement: animation,
        fps,
        duration,
        sensorPackageId,
        supply,
      });

      useSimulatorStore.getState().setSimulationResult(result);
      useSimulatorStore.getState().play();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Simulation failed. Check that the backend is running.";
      useSimulatorStore.getState().setSimulating(false);
      useSimulatorStore.getState().setSimulationError(message);
    }
  };

  return { simulate, simulating, simulationError };
}
