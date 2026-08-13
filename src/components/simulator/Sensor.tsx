import { useGLTF } from "@react-three/drei";

const MODEL_PATH = "/models/AH1711Q-SA-7.glb";

interface SensorProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export function Sensor({ position, rotation, scale = 1 }: SensorProps) {
  const { scene } = useGLTF(MODEL_PATH);

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

useGLTF.preload(MODEL_PATH);