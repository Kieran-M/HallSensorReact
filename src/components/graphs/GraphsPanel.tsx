import { Graph } from "./Graph";

export function GraphPanel() {
  return (
    <div
      className="
        w-full
        h-full
        flex
        flex-col
        gap-4
      "
    >
      <Graph />
      <Graph />
    </div>
  );
}