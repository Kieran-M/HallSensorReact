import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

import { Magnet } from "../MagnetMesh";
import { Sensor } from "../Sensor";

import { useSimulatorStore } from "../../../store/simulatorStore";
import { mmToWorld } from "../../../lib/utils";

export function DesignView() {
  const magnet = useSimulatorStore((s) => s.magnet);
  const sensor = useSimulatorStore((s) => s.sensor);

  return (
    <>
      <div className="relative w-full h-full">
        <Canvas
          camera={{
            position: [0.3, 0.3, 0.3],
            fov: 50,
            near: 0.001,
            far: 1000,
          }}
          style={{
            width: "100%",
            height: "100%",
            background: "#e2e2e2",
          }}
        >
          <ambientLight intensity={1.2} />

          <directionalLight
            position={[1, 2, 1]}
            intensity={2.5}
          />

          <directionalLight
            position={[-1, 1, -1]}
            intensity={1}
          />
          <Magnet config={magnet} />

          <Sensor
            position={[
              mmToWorld(sensor.x),
              mmToWorld(sensor.y),
              mmToWorld(sensor.z),
            ]}
          />

          <Grid
            infiniteGrid
            args={[1, 1]}
            cellSize={0.01}
            sectionSize={0.1}
            fadeDistance={12}
            cellColor="#1a2030"
            sectionColor="#00d4ff"
          />

          <OrbitControls
            makeDefault
            minDistance={0.001}
          />
        </Canvas>
        <div className="absolute top-4 left-4 pointer-events-none space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-(--muted-foreground) bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
            Drag to orbit · Scroll to zoom
          </div>
        </div>

        <div className="absolute bottom-4 left-4 pointer-events-none flex gap-3">
          <div className="flex items-center gap-1.5 bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
            <div className="w-2 h-2 rounded-sm bg-[#c0392b]" />
            <span className="font-mono text-[9px] text-(--muted-foreground)">N pole</span>
          </div>
          <div className="flex items-center gap-1.5 bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
            <div className="w-2 h-2 rounded-sm bg-[#2980b9]" />
            <span className="font-mono text-[9px] text-(--muted-foreground)">S pole</span>
          </div>
          <div className="flex items-center gap-1.5 bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full border border-(--accent)" />
            <span className="font-mono text-[9px] text-(--muted-foreground)">Sensor</span>
          </div>
          <div className="flex items-center gap-1.5 bg-(--background)/70 px-2 py-1 rounded-sm backdrop-blur-sm">
            <div className="w-2 h-2 rounded-sm border border-(--accent)/40" />
            <span className="font-mono text-[9px] text-(--muted-foreground)">End position (ghost)</span>
          </div>
        </div>
      </div>
    </>
  );
}