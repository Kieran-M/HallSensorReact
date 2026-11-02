import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Camera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSimulatorStore } from "../../store/simulatorStore";
import { WORLD_UP } from "../../types/camera";
import {
  cameraBridge,
  cameraSnapRequest,
  snapSphericalAngles,
  type CameraSnapAxis,
} from "../../lib/cameraBridge";

/**
 * Snap via OrbitControls spherical angles with fixed Magpylib +Z camera.up.
 * See {@link snapSphericalAngles} for the Z-up θ/φ table.
 */
export function applyAxisSnap(
  controls: OrbitControlsImpl,
  camera: Camera,
  snap: CameraSnapAxis,
): void {
  camera.up.set(...WORLD_UP);
  const { theta, phi } = snapSphericalAngles(snap);
  controls.setAzimuthalAngle(theta);
  controls.setPolarAngle(phi);
  controls.update();
}

/**
 * OrbitControls that restore the shared camera view on mount and write it
 * back on interaction end / unmount. Also publishes pose to cameraBridge and
 * applies axis snaps from the corner gizmo overlay.
 */
export function PersistentOrbitControls() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();
  const cameraView = useSimulatorStore((s) => s.cameraView);
  const setCameraView = useSimulatorStore((s) => s.setCameraView);

  useEffect(() => {
    camera.up.set(...WORLD_UP);
    const [px, py, pz] = cameraView.position;
    const [tx, ty, tz] = cameraView.target;
    camera.position.set(px, py, pz);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(tx, ty, tz);
      controls.update();
    }
    // Publish initial pose so the gizmo matches before the first drag.
    cameraBridge.quaternion.copy(camera.quaternion);
    if (controls) {
      cameraBridge.target.copy(controls.target);
      cameraBridge.distance = Math.max(
        camera.position.distanceTo(controls.target),
        0.02,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      const controls = controlsRef.current;
      if (!controls) return;
      setCameraView({
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [controls.target.x, controls.target.y, controls.target.z],
      });
    };
  }, [camera, setCameraView]);

  const persist = () => {
    const controls = controlsRef.current;
    if (!controls) return;
    setCameraView({
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [controls.target.x, controls.target.y, controls.target.z],
    });
  };

  useFrame(() => {
    // Keep up locked — persisted sessions / remounts must not fall back to Y.
    if (
      camera.up.x !== WORLD_UP[0] ||
      camera.up.y !== WORLD_UP[1] ||
      camera.up.z !== WORLD_UP[2]
    ) {
      camera.up.set(...WORLD_UP);
    }

    const controls = controlsRef.current;
    if (controls) {
      cameraBridge.quaternion.copy(camera.quaternion);
      cameraBridge.target.copy(controls.target);
      cameraBridge.distance = Math.max(
        camera.position.distanceTo(controls.target),
        0.02,
      );
    }

    const snap = cameraSnapRequest.current;
    if (!snap || !controls) return;
    cameraSnapRequest.current = null;

    applyAxisSnap(controls, camera, snap);
    persist();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={0.002}
      maxDistance={2}
      onEnd={persist}
    />
  );
}
