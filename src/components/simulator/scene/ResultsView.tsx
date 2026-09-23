import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { Magnet } from "../MagnetMesh";
import { Sensor } from "../Sensor";
import { PlaybackControls } from "../../ui/PlaybackControls";
import { PlaybackDriver } from "../PlaybackDriver";
import { useSimulatorStore } from "../../../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import { memo } from "react";
import { mmToWorld } from "../../../lib/utils";

export const ResultsView = memo(() => {
  const { magnet, sensor, view } = useSimulatorStore(
    useShallow((s) => ({
      magnet: s.magnet,
      sensor: s.sensor,
      view: s.view,
    }))
  );

  const handleBack = () => {
    useSimulatorStore.setState({ view: "design" });
  };

  if (view !== "results") return null;

  return (
    <div className="h-full w-full p-4 bg-white">
      <div className="flex h-full flex-col overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <button
            className="text-slate-600 hover:text-slate-900 font-medium text-sm cursor-pointer"
            onClick={handleBack}
          >
            ← Back
          </button>

          <div className="flex gap-2">
            <button className="bg-green-500 p-2 rounded-md text-white hover:bg-green-600 cursor-pointer">
              Save
            </button>
            <button className="bg-blue-500 p-2 rounded-md text-white hover:bg-blue-600 cursor-pointer">
              Export
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="relative flex-1 bg-slate-100">
          <Canvas
            frameloop="always"
            camera={{
              position: [0.3, 0.3, 0.3],
              fov: 50,
              near: 0.001,
              far: 1000,
            }}
          >
            {/* Lights */}
            <ambientLight intensity={1.2} />
            <directionalLight position={[1, 2, 1]} intensity={2.5} />
            <directionalLight position={[-1, 1, -1]} intensity={1} />

            {/* Animation driver – runs the per‑frame updates */}
            <PlaybackDriver />

            {/* Geometry */}
            <Magnet config={magnet} />
            <Sensor
              position={[
                mmToWorld(sensor.x),
                mmToWorld(sensor.y),
                mmToWorld(sensor.z),
              ]}
              scale={2}
            />

            {/* Helpers */}
            <Grid args={[1, 1]} cellSize={0.01} sectionSize={0.1} fadeDistance={5} />
            <OrbitControls makeDefault minDistance={0.001} />
          </Canvas>

          {/* Playback UI overlay */}
          <div className="absolute w-full bottom-4 mx-auto rounded p-2">
            <PlaybackControls />
          </div>
        </div>
      </div>
    </div>
  );
});