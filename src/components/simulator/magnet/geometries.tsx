import { useMemo } from "react";
import * as THREE from "three";
import { mmToWorld } from "../../../lib/utils";
import type { MagnetParams } from "../../../types/magnet";

const POLE_COLORS = [["#e63946", "#457b9d"]];

export function getPoleColor(poleIndex: number, isNorth: boolean): string {
  const pair = POLE_COLORS[Math.floor(poleIndex / 2) % POLE_COLORS.length];
  return isNorth ? pair[0] : pair[1];
}
interface PoleSegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  geometry: React.ReactNode;
  color: string;
}
export function PoleSegment({
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
export function BarMagnetMesh({
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
  const l = mmToWorld(length);
  const w = mmToWorld(width);
  const h = mmToWorld(height);
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
export function CylinderMagnetMesh({
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
  const radius = mmToWorld(outerDiameter) / 2;
  const h = mmToWorld(height);

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
export function CylinderWedgeGeometry({
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
export function RingMagnetMesh({
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
  const outerRadius = mmToWorld(outerDiameter) / 2;
  const innerRadius = mmToWorld(innerDiameter) / 2;
  const h = mmToWorld(height);

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
export function RingWedgeGeometry({
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
export function SpherePoleSegment({
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
export function SphereMagnetMesh({
  poles,
  diameter,
}: {
  poles: number;
  diameter: number;
}) {
  const radius = mmToWorld(diameter) / 2;
  return (
    <group>
      {Array.from({ length: poles }).map((_, i) => (
        <SpherePoleSegment key={i} radius={radius} poleIndex={i} poles={poles} />
      ))}
    </group>
  );
}

/* -------------------- Shape switch -------------------- */
export function MagnetGeometry({
  config,
  poles,
}: {
  config: MagnetParams;
  poles: number;
}) {
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
}
