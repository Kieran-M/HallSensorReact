import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  useSimulatorStore,
  simulationFramesRef,
  type MagnetParams,
} from "../../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import { evaluateMotionPose } from "../../lib/motion";
import { applyFramePose, playbackFrameRef } from "../../lib/playbackClock";
import { MagnetGeometry } from "./magnet/geometries";

// Pose path: edit mode uses evaluateMotionPose (preview); playback uses
// applyFramePose(playbackFrameRef) against simulation frames (metres / rad).

const _editEuler = new THREE.Euler();

function axisLength(config: MagnetParams): number {
  let mm = 10;
  switch (config.shape) {
    case "bar":
      mm = Math.max(config.length, config.width, config.height);
      break;
    case "sphere":
      mm = config.diameter;
      break;
    case "ring":
    case "axial_ring":
      mm = config.outerDiameter;
      break;
    default:
      mm = Math.max(config.outerDiameter, config.height);
  }
  // Compact triad — readable but not dominant
  return THREE.MathUtils.clamp((mm / 1000) * 0.45, 0.0025, 0.008);
}

function AxisArrow({
  color,
  length,
  rotation,
}: {
  color: string;
  length: number;
  rotation: [number, number, number];
}) {
  const shaftLen = length * 0.72;
  const tipLen = length * 0.28;
  const shaftR = Math.max(length * 0.035, 0.00008);
  const tipR = shaftR * 2.4;

  return (
    <group rotation={rotation}>
      {/* Shaft along +Y after rotation */}
      <mesh position={[0, shaftLen / 2, 0]}>
        <cylinderGeometry args={[shaftR, shaftR, shaftLen, 8]} />
        <meshBasicMaterial
          color={color}
          depthTest={false}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, shaftLen + tipLen / 2, 0]}>
        <coneGeometry args={[tipR, tipLen, 10]} />
        <meshBasicMaterial
          color={color}
          depthTest={false}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function LocalAxes({ length }: { length: number }) {
  const hub = Math.max(length * 0.06, 0.00012);
  return (
    <group>
      {/* +X */}
      <AxisArrow
        color="#f87171"
        length={length}
        rotation={[0, 0, -Math.PI / 2]}
      />
      {/* +Y */}
      <AxisArrow color="#34d399" length={length} rotation={[0, 0, 0]} />
      {/* +Z */}
      <AxisArrow
        color="#60a5fa"
        length={length}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh>
        <sphereGeometry args={[hub, 8, 8]} />
        <meshBasicMaterial
          color="#cbd5e1"
          depthTest={false}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

export function Magnet({ config }: { config: MagnetParams }) {
  const poles = config.poles % 2 !== 0 || config.poles < 2 ? 2 : config.poles;
  const groupRef = useRef<THREE.Group>(null);
  const axesLen = useMemo(() => axisLength(config), [config]);

  const { animation, mode, frames } = useSimulatorStore(
    useShallow((s) => ({
      animation: s.animation,
      mode: s.mode,
      frames: s.simulation?.frames ?? simulationFramesRef.current,
    })),
  );

  const editPose = useMemo(() => {
    if (mode !== "edit" && frames.length > 0) return null;
    return evaluateMotionPose(animation, 0);
  }, [animation, mode, frames.length]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    if (mode === "edit" || frames.length === 0) {
      if (!editPose) return;
      group.position.set(
        editPose.position[0],
        editPose.position[1],
        editPose.position[2],
      );
      _editEuler.set(
        editPose.rotation[0],
        editPose.rotation[1],
        editPose.rotation[2],
        "XYZ",
      );
      group.quaternion.setFromEuler(_editEuler);
      return;
    }

    applyFramePose(frames, playbackFrameRef.current, group);
  });

  const renderMagnet = useMemo(
    () => <MagnetGeometry config={config} poles={poles} />,
    [config, poles],
  );

  return (
    <group ref={groupRef}>
      {renderMagnet}
      <LocalAxes length={axesLen} />
    </group>
  );
}
