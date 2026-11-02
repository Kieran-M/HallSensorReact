/**
 * Client-side motion preview for the design viewport.
 * Keep kinematics aligned with backend `_pose_at` in app/services/simulator.py
 * (mm/deg in UI space, metres/rad out).
 */
import * as THREE from "three";
import type { AnimationParams } from "../store/simulatorStore";
import { mmToWorld } from "./utils";

export type Pose = {
  position: [number, number, number]; // world metres
  rotation: [number, number, number]; // radians xyz euler
};

function axisUnit(axis: "x" | "y" | "z"): THREE.Vector3 {
  if (axis === "x") return new THREE.Vector3(1, 0, 0);
  if (axis === "y") return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
}

/**
 * Rest offset for hinge arm at 0° (perpendicular to the hinge axis).
 * Axis Y/Z → along +X; axis X → along +Y.
 *
 * UI hinge angles are lid-style: 0° = closed (rest), positive = open toward
 * Magpylib +Z when the pin allows (X or Y). Convert with {@link hingeUiToRhAngle}
 * before applying a right-hand rotvec.
 */
function restOffset(axis: "x" | "y" | "z", armLengthMm: number): THREE.Vector3 {
  const L = mmToWorld(armLengthMm);
  if (axis === "x") return new THREE.Vector3(0, L, 0);
  if (axis === "y") return new THREE.Vector3(L, 0, 0);
  return new THREE.Vector3(L, 0, 0);
}

/**
 * Map lid-style UI hinge angle → right-hand rotation about the pin.
 * Axis Y needs a sign flip so +UI still opens toward +Z; X/Z are 1:1.
 */
export function hingeUiToRhAngle(
  axis: "x" | "y" | "z",
  uiAngleDeg: number,
): number {
  return axis === "y" ? -uiAngleDeg : uiAngleDeg;
}

function bounceU(t: number): number {
  const u = Math.min(Math.max(t, 0), 1);
  if (u <= 0.5) return u * 2;
  return 2 - u * 2;
}

/**
 * Evaluate magnet pose at normalised time t ∈ [0, 1] for design preview.
 * Units match backend: positions world metres, rotations radians.
 */
export function evaluateMotionPose(animation: AnimationParams, t: number): Pose {
  const u = Math.min(Math.max(t, 0), 1);

  if (animation.type === "linear") {
    const lerp = (a: number, b: number) => a + (b - a) * u;
    return {
      position: [
        mmToWorld(lerp(animation.startPosition.x, animation.endPosition.x)),
        mmToWorld(lerp(animation.startPosition.y, animation.endPosition.y)),
        mmToWorld(lerp(animation.startPosition.z, animation.endPosition.z)),
      ],
      rotation: [
        THREE.MathUtils.degToRad(
          lerp(animation.startRotation.x, animation.endRotation.x),
        ),
        THREE.MathUtils.degToRad(
          lerp(animation.startRotation.y, animation.endRotation.y),
        ),
        THREE.MathUtils.degToRad(
          lerp(animation.startRotation.z, animation.endRotation.z),
        ),
      ],
    };
  }

  if (animation.type === "rotate") {
    const angleDeg =
      animation.startAngle + (animation.endAngle - animation.startAngle) * u;
    const angleRad = THREE.MathUtils.degToRad(angleDeg);
    // Continuous axis euler (no quaternion→euler wrap at 360°)
    const rotation: [number, number, number] =
      animation.axis === "x"
        ? [angleRad, 0, 0]
        : animation.axis === "y"
          ? [0, angleRad, 0]
          : [0, 0, angleRad];
    return {
      position: [
        mmToWorld(animation.position.x),
        mmToWorld(animation.position.y),
        mmToWorld(animation.position.z),
      ],
      rotation,
    };
  }

  // hinge: magnet rides an arc about pivot (UI angle → RH for pose)
  const pathU = animation.bounce ? bounceU(u) : u;
  const uiAngleDeg =
    animation.startAngle + (animation.endAngle - animation.startAngle) * pathU;
  const rhAngleRad = THREE.MathUtils.degToRad(
    hingeUiToRhAngle(animation.axis, uiAngleDeg),
  );
  const pivot = new THREE.Vector3(
    mmToWorld(animation.pivot.x),
    mmToWorld(animation.pivot.y),
    mmToWorld(animation.pivot.z),
  );
  const offset = restOffset(animation.axis, animation.armLength);
  offset.applyAxisAngle(axisUnit(animation.axis), rhAngleRad);
  const pos = pivot.clone().add(offset);

  const rotation: [number, number, number] =
    animation.axis === "x"
      ? [rhAngleRad, 0, 0]
      : animation.axis === "y"
        ? [0, rhAngleRad, 0]
        : [0, 0, rhAngleRad];

  return {
    position: [pos.x, pos.y, pos.z],
    rotation,
  };
}

export function motionTypeLabel(type: AnimationParams["type"]): string {
  switch (type) {
    case "linear":
      return "Linear";
    case "rotate":
      return "Rotate";
    case "hinge":
      return "Hinge";
  }
}

/** Sample magnet poses along the motion for path ghosts / previews. */
export function sampleMotionPath(
  animation: AnimationParams,
  samples = 48,
): Pose[] {
  const n = Math.max(samples, 2);
  const poses: Pose[] = [];
  for (let i = 0; i < n; i++) {
    poses.push(evaluateMotionPose(animation, i / (n - 1)));
  }
  return poses;
}

/** True when the magnet centre actually travels (not in-place spin). */
export function pathHasTranslation(poses: Pose[], epsilon = 1e-5): boolean {
  if (poses.length < 2) return false;
  const [x0, y0, z0] = poses[0].position;
  for (let i = 1; i < poses.length; i++) {
    const [x, y, z] = poses[i].position;
    const dx = x - x0;
    const dy = y - y0;
    const dz = z - z0;
    if (dx * dx + dy * dy + dz * dz > epsilon * epsilon) return true;
  }
  return false;
}
