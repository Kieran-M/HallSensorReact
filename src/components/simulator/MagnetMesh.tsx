import { useMemo } from "react";
import * as THREE from "three";
import { useSimulatorStore, type MagnetParams } from "../../store/simulatorStore";

// ─── Pole colours ─────────────────────────────────────────────────────────────

const POLE_COLORS = [["#e63946", "#457b9d"]];

function getPoleColor(poleIndex: number, isNorth: boolean): string {
  const pair = POLE_COLORS[Math.floor(poleIndex / 2) % POLE_COLORS.length];
  return isNorth ? pair[0] : pair[1];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PoleSegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  geometry: React.ReactNode;
  color: string;
}

function PoleSegment({ position, rotation, geometry, color }: PoleSegmentProps) {
  return (
    <mesh position={position} rotation={rotation}>
      {geometry}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// ─── Shape builders ───────────────────────────────────────────────────────────

function BarMagnetMesh({ poles, length, width, height }: {
  poles: number;
  length: number;
  width: number;
  height: number;
}) {
  // store values are in mm, three.js uses metres
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

function CylinderMagnetMesh({ poles, outerDiameter, height, axial }: {
  poles: number;
  outerDiameter: number;
  height: number;
  axial: boolean;
}) {
  const radius = outerDiameter / 2000; // mm -> m, then halve
  const h = height / 1000;

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

function CylinderWedgeGeometry({ radius, height, angleStart, angleEnd }: {
  radius: number;
  height: number;
  angleStart: number;
  angleEnd: number;
}) {
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(radius, radius, height, 32, 1, false, angleStart, angleEnd - angleStart),
    [radius, height, angleStart, angleEnd]
  );
  return <primitive object={geometry} />;
}

function RingMagnetMesh({ poles, outerDiameter, innerDiameter, height, axial }: {
  poles: number;
  outerDiameter: number;
  innerDiameter: number;
  height: number;
  axial: boolean;
}) {
  const outerRadius = outerDiameter / 2000;
  const innerRadius = innerDiameter / 2000;
  const h = height / 1000;

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

function RingWedgeGeometry({ outerRadius, innerRadius, height, angleStart, angleEnd }: {
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

    shape.absarc(0, 0, outerRadius, angleStart, angleEnd, false);
    shape.absarc(0, 0, innerRadius, angleEnd, angleStart, true);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
      curveSegments: segments,
    });
    geo.translate(0, 0, -height / 2);
    geo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    return geo;
  }, [outerRadius, innerRadius, height, angleStart, angleEnd]);

  return <primitive object={geometry} />;
}

// ─── Extracted sphere segment so hooks are called at component level ──────────

function SpherePoleSegment({ radius, poleIndex, poles }: {
  radius: number;
  poleIndex: number;
  poles: number;
}) {
  const isNorth = poleIndex % 2 === 0;
  const phiStart = (poleIndex / poles) * Math.PI;
  const phiLength = Math.PI / poles;

  const geometry = useMemo(
    () => new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, phiStart, phiLength),
    [radius, phiStart, phiLength]
  );

  return (
    <mesh>
      <primitive object={geometry} />
      <meshStandardMaterial color={getPoleColor(poleIndex, isNorth)} />
    </mesh>
  );
}

function SphereMagnetMesh({ poles, diameter }: { poles: number; diameter: number }) {
  const radius = diameter / 2000;
  return (
    <group>
      {Array.from({ length: poles }).map((_, i) => (
        <SpherePoleSegment key={i} radius={radius} poleIndex={i} poles={poles} />
      ))}
    </group>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Magnet({ config }: { config: MagnetParams }) {
  const poles = config.poles % 2 !== 0 || config.poles < 2 ? 2 : config.poles;
  // const animation = useSimulatorStore((s) => s.animation);
  // const mode = useSimulatorStore((s) => s.mode);
  // const groupRef = useRef<THREE.Group>(null);
  const frames = useSimulatorStore((s) => s.simulationFrames);
  const currentTime = useSimulatorStore((s) => s.currentTime);
  const FPS = 60;
  const frameFloat =
    Math.floor(currentTime * FPS);

  const frameIndex = Math.floor(frameFloat);

  const frameA =
    frames[frameIndex];

  const frameB =
    frames[
    Math.min(
      frameIndex + 1,
      frames.length - 1
    )
    ];

  const alpha =
    frameFloat - frameIndex;

  const position: [number, number, number] =
    frameA && frameB
      ? [
        frameA.position[0] +
        (frameB.position[0] -
          frameA.position[0]) *
        alpha,

        frameA.position[1] +
        (frameB.position[1] -
          frameA.position[1]) *
        alpha,

        frameA.position[2] +
        (frameB.position[2] -
          frameA.position[2]) *
        alpha,
      ]
      : [0, 0, 0];

  const rotation: [number, number, number] =
    frameA && frameB
      ? [
        frameA.rotation[0] +
        (frameB.rotation[0] -
          frameA.rotation[0]) *
        alpha,

        frameA.rotation[1] +
        (frameB.rotation[1] -
          frameA.rotation[1]) *
        alpha,

        frameA.rotation[2] +
        (frameB.rotation[2] -
          frameA.rotation[2]) *
        alpha,
      ]
      : [0, 0, 0];

  const renderMagnet = () => {
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
    }
  }

  return (
    <group position={position} rotation={rotation}>
      {renderMagnet()}
    </group>
  );
}