import { mmToWorld } from "../../lib/utils";
import type { HallType, PackageOutline } from "../../types/simulation";
import { hallTypeColor } from "../../lib/packageVisuals";

interface SensorProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  outline?: PackageOutline;
  hallType?: HallType;
}

/**
 * Approximate Hall IC package meshes by mechanical family.
 * Sensing face is oriented toward +Z (toward magnets in typical presets).
 */
export function Sensor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  outline = "sot23",
  hallType = "linear",
}: SensorProps) {
  const sense = hallTypeColor(hallType).accent;

  return (
    <group position={position} rotation={rotation}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {outline === "sip3" ? (
          <Sip3Mesh senseColor={sense} />
        ) : outline === "dfn" ? (
          <DfnMesh senseColor={sense} />
        ) : outline === "sot553" ? (
          <FlatLeadMesh
            senseColor={sense}
            bodyMm={[1.7, 0.6, 1.3]}
            leadPairs="dual"
          />
        ) : outline === "sc59" ? (
          <FlatLeadMesh
            senseColor={sense}
            bodyMm={[3.0, 1.1, 1.6]}
            leadPairs="sot23"
          />
        ) : (
          <FlatLeadMesh
            senseColor={sense}
            bodyMm={[2.9, 1.0, 1.3]}
            leadPairs="sot23"
          />
        )}
      </group>
    </group>
  );
}

function FlatLeadMesh({
  senseColor,
  bodyMm,
  leadPairs,
}: {
  senseColor: string;
  bodyMm: [number, number, number];
  leadPairs: "sot23" | "dual";
}) {
  const [L, H, W] = bodyMm.map(mmToWorld) as [number, number, number];
  const lead = {
    l: mmToWorld(0.45),
    w: mmToWorld(0.35),
    h: mmToWorld(0.12),
  };

  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[L, H, W]} />
        <meshStandardMaterial color="#1a1f24" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[0, H / 2 + mmToWorld(0.02), 0]}>
        <boxGeometry args={[L * 0.55, mmToWorld(0.04), W * 0.55]} />
        <meshStandardMaterial
          color={senseColor}
          emissive={senseColor}
          emissiveIntensity={0.28}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[-L * 0.35, H / 2 + mmToWorld(0.03), W * 0.28]}>
        <sphereGeometry args={[mmToWorld(0.12), 8, 8]} />
        <meshStandardMaterial color="#c0d0e0" roughness={0.4} />
      </mesh>

      {leadPairs === "sot23" ? (
        <>
          <Lead
            position={[-L / 2 - lead.l / 2, -H / 2 + lead.h / 2, W * 0.28]}
            size={lead}
          />
          <Lead
            position={[-L / 2 - lead.l / 2, -H / 2 + lead.h / 2, -W * 0.28]}
            size={lead}
          />
          <Lead
            position={[L / 2 + lead.l / 2, -H / 2 + lead.h / 2, 0]}
            size={lead}
          />
        </>
      ) : (
        <>
          <Lead
            position={[-L / 2 - lead.l / 2, -H / 2 + lead.h / 2, W * 0.32]}
            size={lead}
          />
          <Lead
            position={[-L / 2 - lead.l / 2, -H / 2 + lead.h / 2, 0]}
            size={lead}
          />
          <Lead
            position={[-L / 2 - lead.l / 2, -H / 2 + lead.h / 2, -W * 0.32]}
            size={lead}
          />
          <Lead
            position={[L / 2 + lead.l / 2, -H / 2 + lead.h / 2, W * 0.22]}
            size={lead}
          />
          <Lead
            position={[L / 2 + lead.l / 2, -H / 2 + lead.h / 2, -W * 0.22]}
            size={lead}
          />
        </>
      )}
    </group>
  );
}

function DfnMesh({ senseColor }: { senseColor: string }) {
  const L = mmToWorld(2.0);
  const W = mmToWorld(2.0);
  const H = mmToWorld(0.6);
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[L, H, W]} />
        <meshStandardMaterial color="#111827" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, H / 2 + mmToWorld(0.015), 0]}>
        <boxGeometry args={[L * 0.45, mmToWorld(0.03), W * 0.45]} />
        <meshStandardMaterial
          color={senseColor}
          emissive={senseColor}
          emissiveIntensity={0.3}
          roughness={0.35}
        />
      </mesh>
      {/* Bottom pads */}
      {[
        [-0.28, -0.28],
        [0.28, -0.28],
        [-0.28, 0.28],
        [0.28, 0.28],
      ].map(([x, z], i) => (
        <mesh
          key={i}
          position={[L * x, -H / 2 - mmToWorld(0.02), W * z]}
          castShadow
        >
          <boxGeometry args={[mmToWorld(0.35), mmToWorld(0.04), mmToWorld(0.35)]} />
          <meshStandardMaterial color="#c4b896" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Sip3Mesh({ senseColor }: { senseColor: string }) {
  const r = mmToWorld(2.2);
  const h = mmToWorld(4.0);
  const leadH = mmToWorld(4.5);
  const leadR = mmToWorld(0.2);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r * 0.92, h, 20]} />
        <meshStandardMaterial color="#1a1f24" roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[0, h + mmToWorld(0.05), 0]}>
        <cylinderGeometry args={[r * 0.55, r * 0.55, mmToWorld(0.1), 16]} />
        <meshStandardMaterial
          color={senseColor}
          emissive={senseColor}
          emissiveIntensity={0.25}
          roughness={0.4}
        />
      </mesh>
      {[-0.55, 0, 0.55].map((x, i) => (
        <mesh
          key={i}
          position={[mmToWorld(x), -leadH / 2, 0]}
          castShadow
        >
          <cylinderGeometry args={[leadR, leadR, leadH, 8]} />
          <meshStandardMaterial color="#c4b896" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
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
