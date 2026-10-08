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
}

/**
 * Arc about a hinge pivot. Rest (angle 0°) places the magnet
 * `armLength` mm from the pivot along +X (or +Y when axis is X).
 */
export interface HingeMovement {
  type: "hinge";
  pivot: XYZ;
  axis: MotionAxis;
  armLength: number;
  startAngle: number;
  endAngle: number;
  /** Ping-pong start→end→start over the simulation duration. */
  bounce: boolean;
}

export type AnimationParams = LinearMovement | RotateMovement | HingeMovement;

export type MotionType = AnimationParams["type"];

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
};

/** Doc default arc length = 35° about origin hinge. */
export const DEFAULT_HINGE: HingeMovement = {
  type: "hinge",
  pivot: { x: 0, y: 0, z: 0 },
  axis: "y",
  armLength: 30,
  startAngle: 35,
  endAngle: 0,
  bounce: false,
};

export function defaultAnimationForType(type: MotionType): AnimationParams {
  switch (type) {
    case "linear":
      return { ...DEFAULT_LINEAR, type: "linear" };
    case "rotate":
      return { ...DEFAULT_ROTATE, type: "rotate" };
    case "hinge":
      return { ...DEFAULT_HINGE, type: "hinge" };
  }
}
