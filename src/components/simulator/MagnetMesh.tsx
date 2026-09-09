import { useMemo } from "react";
import * as THREE from "three";
import {
  useSimulatorStore,
  simulationFramesRef,
  type MagnetParams,
} from "../../store/simulatorStore";
import { useShallow } from "zustand/shallow";

const POLE_COLORS = [["#e63946", "#457b9d"]];

function getPoleColor(poleIndex: number, isNorth: boolean): string {
  const pair = POLE_COLORS[Math.floor(poleIndex / 2) % POLE_COLORS.length];
  return isNorth ? pair[0] : pair[1];
}
interface PoleSegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  geometry: React.ReactNode;
  color: string;
}
function PoleSegment({
  position,
  rotation,
  geometry,
  color,
}: PoleSegmentProps) {
  return (
    <mesh position={position} rotation={rotation}>
      {geometry}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/* ──────────────────────────────────────────────────────────────
   Geometry builders – each returns a <group> of <PoleSegment>s
   ────────────────────────────────────────────────────────────── */
function BarMagnetMesh({
  poles,
  length,
  width,
  height,
}: {
  poles: number;
  length: number;
  width: number;
  height: number;
}) {
  // Store values are in mm → three.js works in metres
  const l = length / 1000;
  const w = width / 1000;
  const h = height / 1000;
  const segmentLength = l / poles;

  return (
    <group>
      {Array.from({ length: poles }).map((_, i) => {
        const isNorth = i % 2 === 0;
        const x = -l / 2 + segmentLength * i + segmentLength / 2;
        return (
          <PoleSegment
            key={i}
            position={[x, 0, 0]}
            geometry={<boxGeometry args={[segmentLength, h, w]} />}
            color={getPoleColor(i, isNorth)}
          />
        );
      })}
    </group>
  );
}

/* -------------------- Cylinder (axial / diametric) -------------------- */
function CylinderMagnetMesh({
  poles,
  outerDiameter,
  height,
  axial,
}: {
  poles: number;
  outerDiameter: number;
  height: number;
  axial: boolean;
}) {
  const radius = outerDiameter / 2000; // mm → m then halve
  const h = height / 1000;

  // Axial → stacked cylinders
  if (axial) {
    const segmentHeight = h / poles;
    return (
      <group>
        {Array.from({ length: poles }).map((_, i) => {
          const isNorth = i % 2 === 0;
          const y = -h / 2 + segmentHeight * i + segmentHeight / 2;
          return (
            <PoleSegment
              key={i}
              position={[0, y, 0]}
              geometry={<cylinderGeometry args={[radius, radius, segmentHeight, 32]} />}
              color={getPoleColor(i, isNorth)}
            />
          );
        })}
      </group>
    );
  }

  // Diametric → wedge‑shaped slices of a full cylinder
  return (
    <group>
      {Array.from({ length: poles }).map((_, i) => {
        const isNorth = i % 2 === 0;
        const angleStart = (i / poles) * Math.PI * 2;
        const angleEnd = ((i + 1) / poles) * Math.PI * 2;
        return (
          <PoleSegment
            key={i}
            position={[0, 0, 0]}
            geometry={
              <CylinderWedgeGeometry
                radius={radius}
                height={h}
                angleStart={angleStart}
                angleEnd={angleEnd}
              />
            }
            color={getPoleColor(i, isNorth)}
          />
        );
      })}
    </group>
  );
}

/* -------------------- Cylinder wedge geometry -------------------- */
function CylinderWedgeGeometry({
  radius,
  height,
  angleStart,
  angleEnd,
}: {
  radius: number;
  height: number;
  angleStart: number;
  angleEnd: number;
}) {
  const geometry = useMemo(
    () =>
      new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        32,
        1,
        false,
        angleStart,
        angleEnd - angleStart
      ),
    [radius, height, angleStart, angleEnd]
  );
  return <primitive object={geometry} />;
}

/* -------------------- Ring (axial / diametric) -------------------- */
function RingMagnetMesh({
  poles,
  outerDiameter,
  innerDiameter,
  height,
  axial,
}: {
  poles: number;
  outerDiameter: number;
  innerDiameter: number;
  height: number;
  axial: boolean;
}) {
  const outerRadius = outerDiameter / 2000;
  const innerRadius = innerDiameter / 2000;
  const h = height / 1000;

  // Axial → stacked ring‑sections
  if (axial) {
    const segmentHeight = h / poles;
    return (
      <group>
        {Array.from({ length: poles }).map((_, i) => {
          const isNorth = i % 2 === 0;
          const y = -h / 2 + segmentHeight * i + segmentHeight / 2;
          return (
            <PoleSegment
              key={i}
              position={[0, y, 0]}
              geometry={
                <RingWedgeGeometry
                  outerRadius={outerRadius}
                  innerRadius={innerRadius}
                  height={segmentHeight}
                  angleStart={0}
                  angleEnd={Math.PI * 2}
                />
              }
              color={getPoleColor(i, isNorth)}
            />
          );
        })}
      </group>
    );
  }

  // Diametric → wedge‑shaped slices of a torus‑like ring
  return (
    <group>
      {Array.from({ length: poles }).map((_, i) => {
        const isNorth = i % 2 === 0;
        const angleStart = (i / poles) * Math.PI * 2;
        const angleEnd = ((i + 1) / poles) * Math.PI * 2;
        return (
          <PoleSegment
            key={i}
            position={[0, 0, 0]}
            geometry={
              <RingWedgeGeometry
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                height={h}
                angleStart={angleStart}
                angleEnd={angleEnd}
              />
            }
            color={getPoleColor(i, isNorth)}
          />
        );
      })}
    </group>
  );
}

/* -------------------- Ring wedge geometry -------------------- */
function RingWedgeGeometry({
  outerRadius,
  innerRadius,
  height,
  angleStart,
  angleEnd,
}: {
  outerRadius: number;
  innerRadius: number;
  height: number;
  angleStart: number;
  angleEnd: number;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const arcLength = angleEnd - angleStart;
    const segments = Math.max(4, Math.round((arcLength / (Math.PI * 2)) * 32));

    // outer arc
    shape.absarc(0, 0, outerRadius, angleStart, angleEnd, false);
    // inner arc (reverse direction)
    shape.absarc(0, 0, innerRadius, angleEnd, angleStart, true);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
      curveSegments: segments,
    });
    // Center the geometry on the Z‑axis
    geo.translate(0, 0, -height / 2);
    // Rotate so the wedge points upward (Three’s default is +Y)
    geo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    return geo;
  }, [outerRadius, innerRadius, height, angleStart, angleEnd]);

  return <primitive object={geometry} />;
}

/* -------------------- Sphere pole segment -------------------- */
function SpherePoleSegment({
  radius,
  poleIndex,
  poles,
}: {
  radius: number;
  poleIndex: number;
  poles: number;
}) {
  const isNorth = poleIndex % 2 === 0;
  const phiStart = (poleIndex / poles) * Math.PI;
  const phiLength = Math.PI / poles;

  const geometry = useMemo(
    () =>
      new THREE.SphereGeometry(
        radius,
        32,
        16,
        0,
        Math.PI * 2,
        phiStart,
        phiLength
      ),
    [radius, phiStart, phiLength]
  );

  return (
    <mesh>
      <primitive object={geometry} />
      <meshStandardMaterial color={getPoleColor(poleIndex, isNorth)} />
    </mesh>
  );
}

/* -------------------- Full sphere magnet -------------------- */
function SphereMagnetMesh({
  poles,
  diameter,
}: {
  poles: number;
  diameter: number;
}) {
  const radius = diameter / 2000; // mm → m (halve)
  return (
    <group>
      {Array.from({ length: poles }).map((_, i) => (
        <SpherePoleSegment key={i} radius={radius} poleIndex={i} poles={poles} />
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN COMPONENT – Magnet
   ────────────────────────────────────────────────────────────── */
export function Magnet({ config }: { config: MagnetParams }) {
  const poles = config.poles % 2 !== 0 || config.poles < 2 ? 2 : config.poles;

  const { animation, mode, currentTime } = useSimulatorStore(
    useShallow((s) => ({
      animation: s.animation,
      mode: s.mode,
      currentTime: s.currentTime,
    })),
  );

  const frames = simulationFramesRef.current;

  const { position, rotation } = useMemo(() => {
    if (frames.length === 0 || mode === "edit") {
      const pos: [number, number, number] = [
        animation.startPosition.x,
        animation.startPosition.y,
        animation.startPosition.z,
      ];
      const rot: [number, number, number] = [
        animation.startRotation.x,
        animation.startRotation.y,
        animation.startRotation.z,
      ];
      return { position: pos, rotation: rot };
    }

    const FPS = 60;
    const frameFloat = currentTime * FPS; // e.g. 3.2 s → 192.0 frames
    const frameIdx = Math.floor(frameFloat);
    const alpha = frameFloat - frameIdx; // fractional part for lerp

    const frameA = frames[frameIdx];
    const frameB = frames[Math.min(frameIdx + 1, frames.length - 1)];

    const lerp = (a: number, b: number) => a + (b - a) * alpha;

    const pos: [number, number, number] = [
      lerp(frameA.position[0], frameB.position[0]),
      lerp(frameA.position[1], frameB.position[1]),
      lerp(frameA.position[2], frameB.position[2]),
    ];

    const rot: [number, number, number] = [
      lerp(frameA.rotation[0], frameB.rotation[0]),
      lerp(frameA.rotation[1], frameB.rotation[1]),
      lerp(frameA.rotation[2], frameB.rotation[2]),
    ];

    return { position: pos, rotation: rot };
  }, [
    frames,
    mode,
    animation.startPosition.x,
    animation.startPosition.y,
    animation.startPosition.z,
    animation.startRotation.x,
    animation.startRotation.y,
    animation.startRotation.z,
    animation.endPosition.x,
    animation.endPosition.y,
    animation.endPosition.z,
    animation.endRotation.x,
    animation.endRotation.y,
    animation.endRotation.z,
    currentTime,
  ]);

  const renderMagnet = useMemo(() => {
    switch (config.shape) {
      case "bar":
        return (
          <BarMagnetMesh
            poles={poles}
            length={config.length}
            width={config.width}
            height={config.height}
          />
        );
      case "axial_cylinder":
        return (
          <CylinderMagnetMesh
            poles={poles}
            outerDiameter={config.outerDiameter}
            height={config.height}
            axial={true}
          />
        );
      case "diametric_cylinder":
        return (
          <CylinderMagnetMesh
            poles={poles}
            outerDiameter={config.outerDiameter}
            height={config.height}
            axial={false}
          />
        );
      case "ring":
        return (
          <RingMagnetMesh
            poles={poles}
            outerDiameter={config.outerDiameter}
            innerDiameter={config.innerDiameter}
            height={config.height}
            axial={false}
          />
        );
      case "axial_ring":
        return (
          <RingMagnetMesh
            poles={poles}
            outerDiameter={config.outerDiameter}
            innerDiameter={config.innerDiameter}
            height={config.height}
            axial={true}
          />
        );
      case "sphere":
        return <SphereMagnetMesh poles={poles} diameter={config.diameter} />;
      default:
        return null;
    }
  }, [config, poles]);

  return (
    <group position={position} rotation={rotation}>
      {renderMagnet}
    </group>
  );
}