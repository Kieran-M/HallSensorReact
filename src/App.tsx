import { useSimulatorStore } from "./store/simulatorStore";
import { DesignPage } from "./pages/DesignPage";
import SelectionView from "./components/simulator/scene/SelectionView";
import { ThemeProvider } from "./components/ui/Theme";

export default function App() {
  const view = useSimulatorStore((s) => s.view);

  return (
    <ThemeProvider>
      {view === "presets" ? (
        <SelectionView />
      ) : (
        <DesignPage />
      )}
    </ThemeProvider>
  );
}
