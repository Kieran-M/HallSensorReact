import Plot from "react-plotly.js";
import { useSimulatorStore } from "../../store/simulatorStore";

export function Graph() {
  const frames = useSimulatorStore(
    (s) => s.simulationFrames
  );

  const currentTime
    = useSimulatorStore(
      (s) => s.currentTime
    );

  return (
    <Plot
      className="w-full h-full"
      data={[
        {
          x: frames.map((_, i) => i),
          y: frames.map((f) => f.bx),
          type: "scatter",
          mode: "lines",
          name: "Bx",
          line: {
            color: "#ef4444",
          },
        },
      ]}
      layout={{
        shapes: [
          {
            type: "line",

            x0: currentTime,
            x1: currentTime,

            y0: -100,
            y1: 100,

            line: {
              width: 2,
              color: "red"
            }
          }
        ]
      }}
      config={{
        responsive: true,
      }}
    />
  );
}