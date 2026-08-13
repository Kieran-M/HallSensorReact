import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

import { Magnet } from "../MagnetMesh";
import { Sensor } from "../Sensor";

import { useSimulatorStore } from "../../../store/simulatorStore";

export function DesignView() {
  const magnet = useSimulatorStore((s) => s.magnet);

  return (
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
          position={[0.01, 0.011, 0]}
          scale={2}
        />

        <Grid
          args={[1, 1]}
          cellSize={0.01}
          sectionSize={0.1}
        />

        <OrbitControls
          makeDefault
          minDistance={0.001}
        />
      </Canvas>
    </div>
  );
}