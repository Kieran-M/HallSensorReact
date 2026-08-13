import { useSimulatorStore } from "./store/simulatorStore";
import { DesignPage } from "./pages/DesignPage";
import { ResultsPage } from "./pages/ResultsPage";

export default function App() {
  const view = useSimulatorStore((s) => s.view);

  return (
    <>
      {view == "design" ? (
        <DesignPage />
      ) : (
        <ResultsPage />
      )
      }
    </>
  );
}
