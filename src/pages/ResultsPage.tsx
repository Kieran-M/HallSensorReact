import { ResultsView } from "../components/simulator/scene/ResultsView";
import { GraphPanel } from "../components/graphs/GraphsPanel";

export function ResultsPage() {
  return (
    <div className="flex flex-row h-screen">
      <div className="w-6/12">
        <ResultsView />
      </div>

      <div className="w-6/12">
        <GraphPanel />
      </div>
    </div>
  );
}