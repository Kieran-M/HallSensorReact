import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useSimulatorStore } from "../../store/simulatorStore";
import { useShallow } from "zustand/shallow";
import { mmToWorld } from "../../lib/utils";
import {
  evaluateMotionPose,
  pathHasTranslation,
  sampleMotionPath,
  type Pose,
} from "../../lib/motion";
import type { AnimationParams, MagnetParams } from "../../store/simulatorStore";
import type { SimulationFrame } from "../../types/simulation";

/** Stable empty array — `?? []` in a Zustand selector causes infinite re-renders. */
const EMPTY_FRAMES: SimulationFrame[] = [];

const PATH_COLOR = "#c0d0e0";
const START_COLOR = "#34d399";
const END_COLOR = "#fbbf24";
const PIVOT_COLOR = "#94a3b8";
const GHOST_COLOR = "#c0d0e0";

function markerRadius(magnet: MagnetParams): number {
  let mm = 8;
  switch (magnet.shape) {
    case "bar":
      mm = Math.max(magnet.length, magnet.width, magnet.height);
      break;
    case "sphere":
      mm = magnet.diameter;
      break;
    case "ring":
    case "axial_ring":
      mm = magnet.outerDiameter;
      break;
    default:
      mm = Math.max(magnet.outerDiameter, magnet.height);
  }
  return THREE.MathUtils.clamp(mmToWorld(mm) * 0.12, 0.0006, 0.0025);
}

/** Translucent stand-in for the magnet body at a pose (path ghost). */
function GhostBody({
  magnet,
  pose,
}: {
  magnet: MagnetParams;
  pose: Pose;
}) {
  const geo = useMemo(() => {
    switch (magnet.shape) {
      case "bar":
        return (
          <boxGeometry
            args={[
              mmToWorld(magnet.length),
              mmToWorld(magnet.height),
              mmToWorld(magnet.width),
            ]}
          />
        );
      case "sphere":
        return <sphereGeometry args={[mmToWorld(magnet.diameter) / 2, 24, 16]} />;
      case "ring":
      case "axial_ring":
        return (
          <cylinderGeometry
            args={[
              mmToWorld(magnet.outerDiameter) / 2,
              mmToWorld(magnet.outerDiameter) / 2,
              mmToWorld(magnet.height),
              28,
            ]}
          />
        );
      default:
        return (
          <cylinderGeometry
            args={[
              mmToWorld(magnet.outerDiameter) / 2,
              mmToWorld(magnet.outerDiameter) / 2,
              mmToWorld(magnet.height),
              28,
            ]}
          />
        );
    }
  }, [magnet]);

  return (
    <mesh position={pose.position} rotation={pose.rotation} raycast={() => null}>
      {geo}
      <meshStandardMaterial
        color={GHOST_COLOR}
        transparent
        opacity={0.16}
        depthWrite={false}
        emissive={GHOST_COLOR}
        emissiveIntensity={0.2}
        wireframe={false}
      />
    </mesh>
  );
}

function RotationArc({
  animation,
  radius,
}: {
  animation: Extract<AnimationParams, { type: "rotate" }>;
  radius: number;
}) {
  const points = useMemo(() => {
    const center = new THREE.Vector3(
      mmToWorld(animation.position.x),
      mmToWorld(animation.position.y),
      mmToWorld(animation.position.z),
    );
    const start = animation.startAngle;
    const end = animation.endAngle;
    const steps = Math.max(24, Math.ceil(Math.abs(end - start) / 6));
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const deg = start + (end - start) * t;
      const rad = THREE.MathUtils.degToRad(deg);
      const offset = new THREE.Vector3();
      if (animation.axis === "x") {
        offset.set(0, Math.cos(rad) * radius, Math.sin(rad) * radius);
      } else if (animation.axis === "y") {
        offset.set(Math.sin(rad) * radius, 0, Math.cos(rad) * radius);
      } else {
        offset.set(Math.cos(rad) * radius, Math.sin(rad) * radius, 0);
      }
      pts.push(center.clone().add(offset));
    }
    return pts;
  }, [animation, radius]);

  return (
    <Line
      points={points}
      color={PATH_COLOR}
      lineWidth={1.5}
      transparent
      opacity={0.55}
      dashed
      dashSize={0.0012}
      gapSize={0.0008}
    />
  );
}

/**
 * Motion path ghost: centre polyline, start/end markers, hinge pivot,
 * rotate sweep arc, and a faint end-pose body.
 */
export function MotionPathGhost() {
  const { animation, magnet, frames, mode } = useSimulatorStore(
    useShallow((s) => ({
      animation: s.animation,
      magnet: s.magnet,
      frames: s.simulation?.frames ?? EMPTY_FRAMES,
      mode: s.mode,
    })),
  );

  const r = markerRadius(magnet);

  const { poses, translating, endPose, startPose } = useMemo(() => {
    let sampled: Pose[];
    if (mode === "playback" && frames.length > 1) {
      const step = Math.max(1, Math.floor(frames.length / 48));
      sampled = [];
      for (let i = 0; i < frames.length; i += step) {
        const f = frames[i];
        sampled.push({
          position: [f.position[0], f.position[1], f.position[2]],
          rotation: [f.rotation[0], f.rotation[1], f.rotation[2]],
        });
      }
      const last = frames[frames.length - 1];
      sampled.push({
        position: [last.position[0], last.position[1], last.position[2]],
        rotation: [last.rotation[0], last.rotation[1], last.rotation[2]],
      });
    } else {
      sampled = sampleMotionPath(animation, 56);
    }

    return {
      poses: sampled,
      translating: pathHasTranslation(sampled),
      startPose: sampled[0] ?? evaluateMotionPose(animation, 0),
      endPose: sampled[sampled.length - 1] ?? evaluateMotionPose(animation, 1),
    };
  }, [animation, frames, mode]);

  const pathPoints = useMemo(
    () => poses.map((p) => new THREE.Vector3(...p.position)),
    [poses],
  );

  const pivot =
    animation.type === "hinge"
      ? ([
          mmToWorld(animation.pivot.x),
          mmToWorld(animation.pivot.y),
          mmToWorld(animation.pivot.z),
        ] as const)
      : null;

  return (
    <group raycast={() => null}>
      {translating && pathPoints.length > 1 && (
        <Line
          points={pathPoints}
          color={PATH_COLOR}
          lineWidth={1.75}
          transparent
          opacity={0.65}
          dashed
          dashSize={0.0015}
          gapSize={0.001}
        />
      )}

      {animation.type === "rotate" && (
        <RotationArc animation={animation} radius={r * 4.5} />
      )}

      {/* Start / end markers — coalesce when the centre does not travel (rotate). */}
      {translating ? (
        <>
          <mesh position={startPose.position}>
            <sphereGeometry args={[r, 16, 16]} />
            <meshBasicMaterial color={START_COLOR} transparent opacity={0.9} />
          </mesh>
          <mesh position={endPose.position}>
            <sphereGeometry args={[r * 0.85, 16, 16]} />
            <meshBasicMaterial color={END_COLOR} transparent opacity={0.85} />
          </mesh>
        </>
      ) : (
        <mesh position={startPose.position}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshBasicMaterial color={START_COLOR} transparent opacity={0.85} />
        </mesh>
      )}

      {pivot && (
        <>
          <mesh position={pivot}>
            <sphereGeometry args={[r * 0.7, 12, 12]} />
            <meshBasicMaterial color={PIVOT_COLOR} transparent opacity={0.9} />
          </mesh>
          <Line
            points={[
              new THREE.Vector3(...pivot),
              new THREE.Vector3(...startPose.position),
            ]}
            color={PIVOT_COLOR}
            lineWidth={1}
            transparent
            opacity={0.4}
            dashed
            dashSize={0.001}
            gapSize={0.0008}
          />
        </>
      )}

      <GhostBody magnet={magnet} pose={endPose} />
    </group>
  );
}
