import type { FC } from "react";
import { Graph } from "./Graph";

interface GraphPanelProps {
  count?: number;
  titles?: string[];
}

export const GraphPanel: FC<GraphPanelProps> = ({
  count = 1,
  titles = [],
}) => {
  const graphIndices = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className="h-full w-full border border-slate-200 bg-white p-4 shadow-sm"
      style={{ overflow: "auto" }}
    >
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "1fr",
        }}
      >
        {graphIndices.map((idx) => (
          <div key={idx} className="h-[300px]">
            <Graph title={titles[idx] ?? `Graph ${idx + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};