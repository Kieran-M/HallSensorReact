import { describe, expect, it } from "vitest";
import { evaluateMotionPose, hingeUiToRhAngle } from "./motion";
import type { AnimationParams } from "../store/simulatorStore";

function hinge(
  axis: "x" | "y" | "z",
  angle: number,
): Extract<AnimationParams, { type: "hinge" }> {
  return {
    type: "hinge",
    pivot: { x: 0, y: 0, z: 0 },
    axis,
    armLength: 30,
    startAngle: angle,
    endAngle: angle,
    bounce: false,
  };
}

describe("hinge lid-style UI angles", () => {
  it("maps +UI on Y to opposite RH angle", () => {
    expect(hingeUiToRhAngle("y", 55)).toBe(-55);
    expect(hingeUiToRhAngle("x", 55)).toBe(55);
    expect(hingeUiToRhAngle("z", 20)).toBe(20);
  });

  it("positive angle opens above the board for Y and X pins", () => {
    expect(evaluateMotionPose(hinge("y", 55), 0).position[2]).toBeGreaterThan(0);
    expect(evaluateMotionPose(hinge("x", 55), 0).position[2]).toBeGreaterThan(0);
  });

  it("negative angle swings under the board for Y and X pins", () => {
    expect(evaluateMotionPose(hinge("y", -55), 0).position[2]).toBeLessThan(0);
    expect(evaluateMotionPose(hinge("x", -55), 0).position[2]).toBeLessThan(0);
  });

  it("same +UI open height on X and Y", () => {
    const yZ = evaluateMotionPose(hinge("y", 55), 0).position[2];
    const xZ = evaluateMotionPose(hinge("x", 55), 0).position[2];
    expect(xZ).toBeCloseTo(yZ, 6);
  });
});
