import Plot from "react-plotly.js";
import { useSimulatorStore, simulationFramesRef } from "../../store/simulatorStore";
import { memo, useMemo } from "react";
import type { FC } from "react";

interface GraphProps {
  title?: string;
}

export const Graph: FC<GraphProps> = memo(({ title }) => {
  const currentTime = useSimulatorStore((s) => s.currentTime);

  const frames = simulationFramesRef.current;

  const dataFrames = useMemo(() => {
    if (frames.length > 0) return frames;

    return Array.from({ length: 360 }, (_, i) => ({
      bx: Math.sin((i * Math.PI) / 180),
      by: Math.cos((i * Math.PI) / 180),
      bz: Math.sin((i * Math.PI) / 360),
    }));
  }, [frames]);

  const x = useMemo(() => dataFrames.map((_, i) => i), [dataFrames]);

  const safeCurrentTime = useMemo(() => {
    if (typeof currentTime !== "number" || !Number.isFinite(currentTime))
      return 0;
    return Math.min(Math.max(Math.floor(currentTime), 0), dataFrames.length - 1);
  }, [currentTime, dataFrames.length]);

  const currentFrame = useMemo(
    () => dataFrames[safeCurrentTime] ?? { bx: 0, by: 0, bz: 0 },
    [dataFrames, safeCurrentTime]
  );

  const series = useMemo(() => {
    const yX = dataFrames.map((f) => f.bx ?? 0);
    const yY = dataFrames.map((f) => f.by ?? 0);
    const yZ = dataFrames.map((f) => f.bz ?? 0);
    return { yX, yY, yZ };
  }, [dataFrames]);

  const plotData = useMemo(() => {
    return [
      {
        x,
        y: series.yX,
        type: "scatter",
        mode: "lines+markers",
        name: "X Output",
        line: { color: "#c35a5a", width: 2 },
        marker: { size: 4 },
      },
      {
        x,
        y: series.yY,
        type: "scatter",
        mode: "lines+markers",
        name: "Y Output",
        line: { color: "#62b26f", width: 2 },
        marker: { size: 4 },
      },
      {
        x,
        y: series.yZ,
        type: "scatter",
        mode: "lines+markers",
        name: "Z Output",
        line: { color: "#5a9bc8", width: 2 },
        marker: { size: 4 },
      },
      // Current‑time marker
      {
        x: [safeCurrentTime],
        y: [currentFrame.bx ?? 0],
        type: "scatter",
        mode: "markers",
        showlegend: false,
        marker: {
          size: 8,
          color: "#2563eb",
          line: { color: "#ffffff", width: 1 },
        },
      },
    ];
  }, [x, series, safeCurrentTime, currentFrame]);

  const plotLayout = useMemo(() => {
    return {
      autosize: true,
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#ffffff",
      hovermode: "closest",
      margin: { l: 60, r: 20, t: 30, b: 50 },
      font: { family: "Arial, sans-serif", size: 12, color: "#374151" },
      legend: {
        orientation: "h",
        x: 0,
        y: 1.12,
        bgcolor: "rgba(0,0,0,0)",
        font: { size: 11 },
      },
      xaxis: {
        title: { text: "Rotation Angle (deg)" },
        showgrid: true,
        gridcolor: "#ececec",
        gridwidth: 1,
        showline: true,
        linecolor: "#888888",
        zeroline: false,
        mirror: false,
      },
      yaxis: {
        title: { text: "Output Signal (Code)" },
        showgrid: true,
        gridcolor: "#ececec",
        gridwidth: 1,
        showline: true,
        linecolor: "#888888",
        zeroline: true,
        zerolinecolor: "#666666",
        zerolinewidth: 1,
      },
      shapes: [
        {
          type: "line",
          x0: safeCurrentTime,
          x1: safeCurrentTime,
          y0: 0,
          y1: 1,
          yref: "paper",
          line: { color: "#f59e0b", width: 2, dash: "dash" },
        },
      ],
      annotations: [
        {
          x: safeCurrentTime,
          y: 1,
          yref: "paper",
          text: "Now",
          showarrow: false,
          yshift: 8,
          font: { size: 11, color: "#f59e0b" },
        },
      ],
    };
  }, [safeCurrentTime]);

  return (
    <Plot
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
      data={plotData}
      layout={plotLayout}
      config={{ responsive: true, displayModeBar: false }}
    />
  );
});