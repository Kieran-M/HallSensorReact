import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Camera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSimulatorStore } from "../../store/simulatorStore";
import {
  cameraBridge,
  cameraSnapRequest,
  type CameraSnapAxis,
} from "../../lib/cameraBridge";

/**
 * Snap via OrbitControls spherical angles so `camera.up` stays world +Y.
 * Mutating up for top/bottom views (old lookAt path) left controls in a
 * flipped basis and broke later orbits / snaps.
 *
 * Three.js spherical: polar 0 = +Y, azimuth 0 = +Z, +azimuth toward +X.
 * EPS avoids exact poles where azimuth becomes unstable.
 */
const POLE_EPS = 1e-3;

function applyAxisSnap(
  controls: OrbitControlsImpl,
  camera: Camera,
  snap: CameraSnapAxis,
): void {
  camera.up.set(0, 1, 0);

  switch (snap) {
    case "x":
      controls.setAzimuthalAngle(Math.PI / 2);
      controls.setPolarAngle(Math.PI / 2);
      break;
    case "-x":
      controls.setAzimuthalAngle(-Math.PI / 2);
      controls.setPolarAngle(Math.PI / 2);
      break;
    case "y":
      controls.setAzimuthalAngle(0);
      controls.setPolarAngle(POLE_EPS);
      break;
    case "-y":
      controls.setAzimuthalAngle(0);
      controls.setPolarAngle(Math.PI - POLE_EPS);
      break;
    case "z":
      controls.setAzimuthalAngle(0);
      controls.setPolarAngle(Math.PI / 2);
      break;
    case "-z":
      controls.setAzimuthalAngle(Math.PI);
      controls.setPolarAngle(Math.PI / 2);
      break;
    case "iso":
    default:
      controls.setAzimuthalAngle(Math.PI / 4);
      controls.setPolarAngle(Math.PI / 3);
      break;
  }

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
