import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { cameraBridge, requestCameraSnap } from "../../lib/cameraBridge";

function makeLabelTexture(label: string, color: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "#0b1a28";
  ctx.font = "bold 64px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, size / 2, size / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Arm built along +X, then rotated into place. */
function AxisArm({
  color,
  rotation,
  snap,
  label,
}: {
  color: string;
  rotation: [number, number, number];
  snap: "x" | "y" | "z";
  label: string;
}) {
  const labelMap = useMemo(() => makeLabelTexture(label, color), [label, color]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    requestCameraSnap(snap);
  };

  return (
    <group rotation={rotation}>
      {/* Shaft along +X */}
      <mesh
        position={[0.5, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onClick={onClick}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.85, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Arrow head */}
      <mesh
        position={[1.05, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onClick={onClick}
      >
        <coneGeometry args={[0.13, 0.3, 14]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[1.28, 0, 0]} onClick={onClick}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <sprite position={[1.28, 0, 0]} scale={[0.45, 0.45, 0.45]}>
        <spriteMaterial
          map={labelMap}
          toneMapped={false}
          depthTest={false}
          transparent
        />
      </sprite>
    </group>
  );
}

function GizmoScene() {
  const root = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!root.current) return;
    root.current.quaternion.copy(cameraBridge.quaternion).invert();
  });

  return (
    <>
      <ambientLight intensity={1} />
      <group ref={root} scale={0.85}>
        <mesh>
          <sphereGeometry args={[0.12, 14, 14]} />
          <meshBasicMaterial color="#e2e8f0" toneMapped={false} />
        </mesh>
        <AxisArm color="#f87171" rotation={[0, 0, 0]} snap="x" label="X" />
        <AxisArm
          color="#34d399"
          rotation={[0, 0, Math.PI / 2]}
          snap="y"
          label="Y"
        />
        <AxisArm
          color="#60a5fa"
          rotation={[0, -Math.PI / 2, 0]}
          snap="z"
          label="Z"
        />
      </group>
    </>
  );
}

/**
 * Independent mini-viewport axis gizmo (DCC-style). Overlay HTML so it
 * cannot be clipped by main-canvas masks or Hud quirks.
 */
export function AxisGizmoOverlay() {
  return (
    <div
      className="absolute top-3 right-3 z-50 h-36 w-36 rounded-md overflow-hidden shadow-lg pointer-events-auto"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "color-mix(in srgb, var(--card) 92%, transparent)",
        backdropFilter: "blur(8px)",
      }}
      title="Click an axis to snap the camera"
    >
      <div
        className="absolute top-1 left-1.5 z-10 font-mono text-[11px] uppercase tracking-widest pointer-events-none"
        style={{ color: "var(--muted-foreground)" }}
      >
        View
      </div>
      <Canvas
        orthographic
        camera={{ zoom: 38, position: [0, 0, 10], near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        dpr={[1, 2]}
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
