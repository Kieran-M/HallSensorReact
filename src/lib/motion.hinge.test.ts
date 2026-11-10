import { describe, expect, it } from "vitest";
import { evaluateMotionPose, hingeUiToRhAngle } from "./motion";
import type { AnimationParams } from "../types/motion";

function hingeAt(
  origin: { x: number; y: number; z: number },
  angle: number,
  axis: "x" | "y" | "z" = "y",
): Extract<AnimationParams, { type: "hinge" }> {
  return {
    type: "hinge",
    originPosition: origin,
    pivot: { x: 0, y: 0, z: 0 },
    axis,
    armLength: Math.hypot(origin.x, origin.y, origin.z),
    startAngle: angle,
    endAngle: angle,
    bounce: false,
    baseRotation: { x: 0, y: 0, z: 0 },
  };
}

describe("hinge origin offset", () => {
  it("maps +UI on Y to opposite RH angle", () => {
    expect(hingeUiToRhAngle("y", 55)).toBe(-55);
    expect(hingeUiToRhAngle("x", 55)).toBe(55);
  });

  it("keeps origin at 0° and lifts +Z for positive Y-hinge angles", () => {
    const closed = evaluateMotionPose(hingeAt({ x: 30, y: 0, z: 0 }, 0), 0);
    expect(closed.position[0]).toBeCloseTo(0.03, 6);
    expect(closed.position[2]).toBeCloseTo(0, 6);

    const open = evaluateMotionPose(hingeAt({ x: 30, y: 0, z: 0 }, 55), 0);
    expect(open.position[2]).toBeGreaterThan(0);
  });

  it("supports Z offset at origin (TIMSS-style)", () => {
    const pose = evaluateMotionPose(hingeAt({ x: 30, y: 0, z: 5 }, 0), 0);
    expect(pose.position[0]).toBeCloseTo(0.03, 6);
    expect(pose.position[2]).toBeCloseTo(0.005, 6);
  });
});
