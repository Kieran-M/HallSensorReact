import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSimulatorStore } from "../../store/simulatorStore";
import {
  cameraBridge,
  cameraSnapRequest,
  type CameraSnapAxis,
} from "../../lib/cameraBridge";

const _offset = new THREE.Vector3();

function directionForSnap(axis: CameraSnapAxis): THREE.Vector3 {
  switch (axis) {
    case "x":
      return new THREE.Vector3(1, 0, 0);
    case "-x":
      return new THREE.Vector3(-1, 0, 0);
    case "y":
      return new THREE.Vector3(0, 1, 0);
    case "-y":
      return new THREE.Vector3(0, -1, 0);
    case "z":
      return new THREE.Vector3(0, 0, 1);
    case "-z":
      return new THREE.Vector3(0, 0, -1);
    case "iso":
    default:
      return new THREE.Vector3(1, 0.75, 1).normalize();
  }
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

    const target = controls.target;
    const distance = cameraBridge.distance;
    const dir = directionForSnap(snap);
    _offset.copy(dir).multiplyScalar(distance);
    camera.position.copy(target).add(_offset);
    camera.up.set(0, 1, 0);
    if (snap === "y" || snap === "-y") {
      camera.up.set(0, 0, snap === "y" ? -1 : 1);
    }
    camera.lookAt(target);
    controls.update();
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
