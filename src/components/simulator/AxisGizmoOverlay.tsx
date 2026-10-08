import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  cameraBridge,
  requestCameraSnap,
  type CameraSnapAxis,
} from "../../lib/cameraBridge";

function makeLabelTexture(label: string, color: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  // Soft disc so the letter reads against any background
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(11, 26, 40, 0.55)";
  ctx.stroke();

  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 72px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, size / 2, size / 2 + 3);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Positive axis: shaft + cone + labeled tip. Built along +X, then rotated. */
function PositiveArm({
  color,
  rotation,
  snap,
  label,
}: {
  color: string;
  rotation: [number, number, number];
  snap: CameraSnapAxis;
  label: string;
}) {
  const labelMap = useMemo(() => makeLabelTexture(label, color), [label, color]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    requestCameraSnap(snap);
  };

  return (
    <group rotation={rotation}>
      <mesh
        position={[0.48, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onClick={onClick}
      >
        <cylinderGeometry args={[0.055, 0.055, 0.78, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh
        position={[0.98, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onClick={onClick}
      >
        <coneGeometry args={[0.14, 0.32, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <sprite position={[1.32, 0, 0]} scale={[0.52, 0.52, 0.52]} onClick={onClick}>
        <spriteMaterial
          map={labelMap}
          toneMapped={false}
          depthTest
          depthWrite={false}
          transparent
        />
      </sprite>
    </group>
  );
}

/** Negative axis: short shaft + small tip sphere (no letter clutter). */
function NegativeArm({
  color,
  rotation,
  snap,
}: {
  color: string;
  rotation: [number, number, number];
  snap: CameraSnapAxis;
}) {
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    requestCameraSnap(snap);
  };

  return (
    <group rotation={rotation}>
      <mesh
        position={[0.38, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onClick={onClick}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.55, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.78, 0, 0]} onClick={onClick}>
        <sphereGeometry args={[0.12, 14, 14]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * World-axis triad that mirrors the main viewport camera orientation.
 * Fixed orthographic eye; the group takes inverse(camera.quaternion) so
 * axes match what you see in the scene.
 */
function GizmoScene() {
  const root = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = root.current;
    if (!group) return;
    // Match main-canvas world axes as viewed by the current camera.
    group.quaternion.copy(cameraBridge.quaternion).invert();
  });

  const snapIso = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    requestCameraSnap("iso");
  };

  return (
    <>
      <ambientLight intensity={1.2} />
      <group ref={root} scale={0.82}>
        <mesh onClick={snapIso}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial
            color="#cbd5e1"
            toneMapped={false}
            transparent
            opacity={0.92}
          />
        </mesh>

        <PositiveArm color="#ef4444" rotation={[0, 0, 0]} snap="x" label="X" />
        <NegativeArm color="#991b1b" rotation={[0, 0, Math.PI]} snap="-x" />

        <PositiveArm
          color="#22c55e"
          rotation={[0, 0, Math.PI / 2]}
          snap="y"
          label="Y"
        />
        <NegativeArm
          color="#166534"
          rotation={[0, 0, -Math.PI / 2]}
          snap="-y"
        />

        <PositiveArm
          color="#3b82f6"
          rotation={[0, -Math.PI / 2, 0]}
          snap="z"
          label="Z"
        />
        <NegativeArm
          color="#1e40af"
          rotation={[0, Math.PI / 2, 0]}
          snap="-z"
        />
      </group>
    </>
  );
}

/**
 * Independent mini-viewport axis gizmo (DCC-style). Overlay HTML so it
 * cannot be clipped by main-canvas masks or Hud quirks.
 *
 * Runs its own rAF so it stays locked to the main camera every frame;
 * kept cheap with dpr=1 and a tiny orthographic view.
 */
export function AxisGizmoOverlay() {
  return (
    <div
      className="absolute top-3 right-3 z-50 h-40 w-40 rounded-md overflow-hidden shadow-lg pointer-events-auto"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "color-mix(in srgb, var(--card) 96%, transparent)",
      }}
      title="Click X/Y/Z (or opposite tip) to snap; center for isometric"
    >
      <div
        className="absolute top-1 left-1.5 z-10 font-mono text-[11px] uppercase tracking-widest pointer-events-none"
        style={{ color: "var(--muted-foreground)" }}
      >
        View
      </div>
      <Canvas
        orthographic
        frameloop="always"
        dpr={1}
        camera={{ zoom: 42, position: [0, 0, 10], near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <GizmoScene />
      </Canvas>
    </div>
  );
}
