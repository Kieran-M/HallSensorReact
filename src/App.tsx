import { useSimulatorStore } from "./store/simulatorStore";
import { DesignPage } from "./pages/DesignPage";
import { ResultsPage } from "./pages/ResultsPage";
import SelectionView from "./components/simulator/scene/SelectionView";

export default function App() {
  const view = useSimulatorStore((s) => s.view);

  return (
    <>
      {view === "presets" ? (
        <SelectionView />
      ) : view === "design" ? (
        <DesignPage />
      ) : (
        <ResultsPage />
      )
      }
      {/* <SelectionView/> */}
    </>
  );
}
