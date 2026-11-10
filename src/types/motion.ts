export interface XYZ {
  x: number;
  y: number;
  z: number;
}

export type SensorPosition = XYZ;

export type MotionAxis = "x" | "y" | "z";

/** Straight-line translation + optional euler lerp (degrees). */
export interface LinearMovement {
  type: "linear";
  startPosition: XYZ;
  endPosition: XYZ;
  startRotation: XYZ;
  endRotation: XYZ;
}

/** Spin in place about a world axis (supports full 360°). */
export interface RotateMovement {
  type: "rotate";
  position: XYZ;
  axis: MotionAxis;
  startAngle: number;
  endAngle: number;
  /** Magnet Euler (deg) at angle 0°, composed with the spin. */
  baseRotation: XYZ;
}

/**
 * TIMSS-style hinge: pivot fixed at origin; originPosition = magnet centre at 0°.
 * Angles are lid-style: positive opens toward Magpylib +Z for pins X/Y.
 */
export interface HingeMovement {
  type: "hinge";
  /** Magnet centre at 0° (mm). Free XYZ offset from the fixed pivot. */
  originPosition: XYZ;
  /** Always (0,0,0) in the UI; kept for API / ghosts. */
  pivot: XYZ;
  axis: MotionAxis;
  /** Derived ‖origin − pivot‖ for display; not the kinematics source of truth. */
  armLength: number;
  startAngle: number;
  endAngle: number;
  /** Ping-pong start→end→start over the simulation duration. */
  bounce: boolean;
  /** Magnet Euler (deg) at 0°, composed with the hinge rotation. */
  baseRotation: XYZ;
}

export type AnimationParams = LinearMovement | RotateMovement | HingeMovement;

export type MotionType = AnimationParams["type"];

export const ZERO_XYZ: XYZ = { x: 0, y: 0, z: 0 };

export const DEFAULT_LINEAR: LinearMovement = {
  type: "linear",
  startPosition: { x: 0, y: 0, z: 15 },
  endPosition: { x: 0, y: 0, z: 3 },
  startRotation: { x: 0, y: 0, z: 0 },
  endRotation: { x: 0, y: 0, z: 0 },
};

export const DEFAULT_ROTATE: RotateMovement = {
  type: "rotate",
  position: { x: 0, y: 0, z: 5 },
  axis: "z",
  startAngle: 0,
  endAngle: 360,
  baseRotation: { ...ZERO_XYZ },
};

/** Default lid-style arc about +Y: origin on +X, +35° open → 0° closed. */
export const DEFAULT_HINGE: HingeMovement = {
  type: "hinge",
  originPosition: { x: 30, y: 0, z: 0 },
  pivot: { ...ZERO_XYZ },
  axis: "y",
  armLength: 30,
  startAngle: 35,
  endAngle: 0,
  bounce: false,
  baseRotation: { ...ZERO_XYZ },
};

export function hingeArmLengthMm(origin: XYZ, pivot: XYZ = ZERO_XYZ): number {
  const dx = origin.x - pivot.x;
  const dy = origin.y - pivot.y;
  const dz = origin.z - pivot.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function defaultAnimationForType(type: MotionType): AnimationParams {
  switch (type) {
    case "linear":
      return { ...DEFAULT_LINEAR, type: "linear" };
    case "rotate":
      return {
        ...DEFAULT_ROTATE,
        type: "rotate",
        baseRotation: { ...ZERO_XYZ },
      };
    case "hinge":
      return {
        ...DEFAULT_HINGE,
        type: "hinge",
        originPosition: { ...DEFAULT_HINGE.originPosition },
        pivot: { ...ZERO_XYZ },
        baseRotation: { ...ZERO_XYZ },
      };
  }
}
