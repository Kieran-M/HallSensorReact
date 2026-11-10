import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { Mesh, MeshStandardMaterial } from "three";
import { mmToWorld } from "../../lib/utils";
import type { HallType, PackageOutline } from "../../types/simulation";
import { hallTypeColor } from "../../lib/packageVisuals";
import { alignPackageScene } from "../../lib/alignPackageScene";
import {
  allPackageGlbUrls,
  normalizePackageLabel,
  resolvePackageModel,
  type PackageModelSpec,
} from "../../lib/packageModels";

interface SensorProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  outline?: PackageOutline;
  /** Datasheet package string (e.g. "X2-DFN1010-4 (Type B)"). */
  packageLabel?: string | null;
  hallType?: HallType;
  /** Datasheet Hall-plate offset from package centre (mm), package frame. */
  dieOffsetMm?: { x: number; y: number; z: number } | null;
}

/**
 * Package mesh: prefer official Diodes STEP→GLB; else procedural family mesh.
 * Magpylib frame: marking / sensing face → +Z, board side → −Z.
 */
export function Sensor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  outline = "sot23",
  packageLabel = null,
  hallType = "linear",
  dieOffsetMm = null,
}: SensorProps) {
  const sense = hallTypeColor(hallType).accent;
  const model = resolvePackageModel(outline, packageLabel);

  return (
    <group position={position} rotation={rotation}>
      {model ? (
        <>
          <Suspense
            fallback={
              <ProceduralPackage
                outline={outline}
                packageLabel={packageLabel}
                senseColor={sense}
              />
            }
          >
            <OfficialPackage model={model} />
          </Suspense>
          {dieOffsetMm && (
            <HallPlateMarker
              offsetMm={dieOffsetMm}
              color={sense}
              frame="zUp"
            />
          )}
        </>
      ) : (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <ProceduralPackage
            outline={outline}
            packageLabel={packageLabel}
            senseColor={sense}
          />
          {dieOffsetMm && (
            <HallPlateMarker
              offsetMm={dieOffsetMm}
              color={sense}
              frame="yUp"
            />
          )}
        </group>
      )}
    </group>
  );
}

function OfficialPackage({ model }: { model: PackageModelSpec }) {
  return (
    <group>
      <PackageGlb
        url={model.url}
        rotation={model.rotation}
        centerMeshNameIncludes={model.centerMeshNameIncludes}
        omitMeshNameIncludes={model.omitMeshNameIncludes}
      />
      {model.proceduralSipLeads && <Sip3LeadStubs />}
    </group>
  );
}

function PackageGlb({
  url,
  rotation,
  centerMeshNameIncludes,
  omitMeshNameIncludes,
}: {
  url: string;
  rotation: [number, number, number];
  centerMeshNameIncludes?: string[];
  omitMeshNameIncludes?: string[];
}) {
  const { scene } = useGLTF(url);
  // Manual AABB centre — drei <Center> was leaving some STEP meshes
  // (esp. DFN1010) beside the Hall-plate marker at the package origin.
  const rooted = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const mat of mats) {
        const std = mat as MeshStandardMaterial;
        if (std && "roughness" in std) {
          std.roughness = Math.min(std.roughness ?? 0.5, 0.65);
        }
      }
    });
    return alignPackageScene(root, rotation, {
      centerMeshNameIncludes,
      omitMeshNameIncludes,
    });
  }, [scene, rotation, centerMeshNameIncludes, omitMeshNameIncludes]);

  return <primitive object={rooted} />;
}

/** Short display leads for TO-92S after omitting the STEP’s ~18 mm stock leads. */
function Sip3LeadStubs() {
  const leadH = mmToWorld(3.2);
  const leadR = mmToWorld(0.2);
  const bodyHalfY = mmToWorld(1.55);
  return (
    <group>
      {[-0.7, 0, 0.7].map((x, i) => (
        <mesh
          key={i}
          position={[mmToWorld(x), -bodyHalfY - leadH / 2, mmToWorld(-0.2)]}
          castShadow
        >
          <cylinderGeometry args={[leadR, leadR, leadH, 8]} />
          <meshStandardMaterial color="#c4b896" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function HallPlateMarker({
  offsetMm,
  color,
  frame,
}: {
  offsetMm: { x: number; y: number; z: number };
  color: string;
  frame: "zUp" | "yUp";
}) {
  const pos: [number, number, number] =
    frame === "zUp"
      ? [
          mmToWorld(offsetMm.x),
          mmToWorld(offsetMm.y),
          mmToWorld(offsetMm.z),
        ]
      : [
          mmToWorld(offsetMm.x),
          mmToWorld(offsetMm.z),
          mmToWorld(-offsetMm.y),
        ];
  return (
    <mesh position={pos} raycast={() => null}>
      {/* Small so a [0,0,0] plate still reads as inside the moulding */}
      <sphereGeometry args={[mmToWorld(0.1), 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.95} depthTest={false} />
    </mesh>
  );
}

function ProceduralPackage({
  outline,
  packageLabel,
  senseColor,
}: {
  outline: PackageOutline;
  packageLabel?: string | null;
  senseColor: string;
}) {
  if (outline === "sip3") return <Sip3Mesh senseColor={senseColor} />;
  if (outline === "dfn") {
    return <DfnMesh senseColor={senseColor} packageLabel={packageLabel} />;
  }
  if (outline === "sot553") {
    return (
      <FlatLeadMesh
        senseColor={senseColor}
        bodyMm={[1.6, 0.55, 1.2]}
        leadPairs="dual"
        pin1Dot
      />
    );
  }
  if (outline === "sc59") {
    return (
      <FlatLeadMesh
        senseColor={senseColor}
        bodyMm={[3.0, 1.1, 1.6]}
        leadPairs="sot23"
        pin1Dot
      />
    );
  }
  return (
    <FlatLeadMesh
      senseColor={senseColor}
      bodyMm={[2.9, 1.0, 1.3]}
      leadPairs="sot23"
      pin1Dot
    />
  );
}

function dfnBodyMm(packageLabel?: string | null): [number, number, number] {
  const blob = normalizePackageLabel(packageLabel);
  if (blob.includes("1010")) return [1.0, 0.39, 1.0];
  if (blob.includes("2020")) return [2.0, 0.55, 2.0];
  // X2-DFN1410-4 default
  return [1.0, 0.37, 1.4];
}

function FlatLeadMesh({
  senseColor,
  bodyMm,
  leadPairs,
  pin1Dot = false,
}: {
  senseColor: string;
  bodyMm: [number, number, number];
  leadPairs: "sot23" | "dual";
  pin1Dot?: boolean;
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
        <boxGeometry args={[L * 0.7, mmToWorld(0.05), W * 0.7]} />
        <meshStandardMaterial
          color={senseColor}
          emissive={senseColor}
          emissiveIntensity={0.35}
          roughness={0.35}
        />
      </mesh>
      {pin1Dot && (
        <mesh position={[-L * 0.35, H / 2 + mmToWorld(0.04), W * 0.28]}>
          <sphereGeometry args={[mmToWorld(0.12), 8, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
        </mesh>
      )}
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

function DfnMesh({
  senseColor,
  packageLabel,
}: {
  senseColor: string;
  packageLabel?: string | null;
}) {
  const [L, H, W] = dfnBodyMm(packageLabel).map(mmToWorld) as [
    number,
    number,
    number,
  ];
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[L, H, W]} />
        <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0, H / 2 + mmToWorld(0.02), 0]}>
        <boxGeometry args={[L * 0.55, mmToWorld(0.04), W * 0.55]} />
        <meshStandardMaterial
          color={senseColor}
          emissive={senseColor}
          emissiveIntensity={0.35}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function Sip3Mesh({ senseColor }: { senseColor: string }) {
  const r = mmToWorld(2.05);
  const h = mmToWorld(4.2);
  const leadH = mmToWorld(5.0);
  const leadR = mmToWorld(0.22);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r * 0.9, h, 24]} />
        <meshStandardMaterial color="#1a1f24" roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[0, h + mmToWorld(0.04), 0]}>
        <cylinderGeometry args={[r * 0.62, r * 0.62, mmToWorld(0.12), 20]} />
        <meshStandardMaterial
          color={senseColor}
          emissive={senseColor}
          emissiveIntensity={0.3}
          roughness={0.4}
        />
      </mesh>
      {[-0.7, 0, 0.7].map((x, i) => (
        <mesh key={i} position={[mmToWorld(x), -leadH / 2, 0]} castShadow>
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

// Warm package meshes after first paint so a CSP/WASM failure cannot tear down
// module evaluation (drei may instantiate WASM decoders while preloading).
if (typeof window !== "undefined") {
  window.setTimeout(() => {
    for (const url of allPackageGlbUrls()) {
      try {
        useGLTF.preload(url);
      } catch {
        /* Suspense path loads on demand */
      }
    }
  }, 0);
}
