import { useMemo } from "react";
import { mmToWorld } from "../../lib/utils";

interface SensorProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Approximate SOT-23 / SC-59 Hall package (e.g. AH1711 family).
 * Dimensions in millimetres — converted to world metres via mmToWorld.
 *
 * Body ≈ 2.9 × 1.3 × 1.0 mm; three gull-wing leads.
 */
const BODY_L = 2.9; // mm along X (leads span)
const BODY_W = 1.3; // mm along Z
const BODY_H = 1.0; // mm along Y (thickness)
const LEAD_L = 0.45;
const LEAD_W = 0.4;
const LEAD_H = 0.12;

export function Sensor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: SensorProps) {
  const body = useMemo(
    () => ({
      l: mmToWorld(BODY_L),
      w: mmToWorld(BODY_W),
      h: mmToWorld(BODY_H),
    }),
    [],
  );
  const lead = useMemo(
    () => ({
      l: mmToWorld(LEAD_L),
      w: mmToWorld(LEAD_W),
      h: mmToWorld(LEAD_H),
    }),
    [],
  );

  // Orient package so the flat sensing face looks along +Z (toward magnets
  // approaching from +Z in head-on / slide-by presets).
  return (
    <group position={position} rotation={rotation}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Molded body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[body.l, body.h, body.w]} />
          <meshStandardMaterial color="#1a1f24" roughness={0.55} metalness={0.15} />
        </mesh>

        {/* Sensing face marker (top of package) */}
        <mesh position={[0, body.h / 2 + mmToWorld(0.02), 0]}>
          <boxGeometry args={[body.l * 0.55, mmToWorld(0.04), body.w * 0.55]} />
          <meshStandardMaterial
            color="#3d9e6f"
            emissive="#1a5c3a"
            emissiveIntensity={0.35}
            roughness={0.4}
          />
        </mesh>

        {/* Pin-1 chamfer mark */}
        <mesh position={[-body.l * 0.35, body.h / 2 + mmToWorld(0.03), body.w * 0.28]}>
          <sphereGeometry args={[mmToWorld(0.12), 8, 8]} />
          <meshStandardMaterial color="#c0d0e0" roughness={0.4} />
        </mesh>

        {/* Gull-wing leads: two on one side, one on the other (SOT-23) */}
        <Lead
          position={[
            -body.l / 2 - lead.l / 2,
            -body.h / 2 + lead.h / 2,
            body.w * 0.28,
          ]}
          size={lead}
        />
        <Lead
          position={[
            -body.l / 2 - lead.l / 2,
            -body.h / 2 + lead.h / 2,
            -body.w * 0.28,
          ]}
          size={lead}
        />
        <Lead
          position={[body.l / 2 + lead.l / 2, -body.h / 2 + lead.h / 2, 0]}
          size={lead}
        />
      </group>
    </group>
  );
}

function Lead({
  position,
  size,
}: {
  position: [number, number, number];
  size: { l: number; w: number; h: number };
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[size.l, size.h, size.w]} />
      <meshStandardMaterial color="#c4b896" metalness={0.85} roughness={0.35} />
    </mesh>
  );
}
