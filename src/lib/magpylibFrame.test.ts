import { describe, expect, it } from "vitest";
import {
  barBoxArgsMetres,
  magpylibAxisRotation,
  needsMagpylibZAlign,
  THREE_Y_AXIS_TO_MAGPYLIB_Z,
} from "./magpylibFrame";

describe("magpylibFrame", () => {
  it("aligns Y-up Three primitives onto Magpylib +Z", () => {
    expect(needsMagpylibZAlign("axial_cylinder")).toBe(true);
    expect(needsMagpylibZAlign("sphere")).toBe(true);
    expect(needsMagpylibZAlign("bar")).toBe(false);
    expect(magpylibAxisRotation("ring")).toEqual(THREE_Y_AXIS_TO_MAGPYLIB_Z);
    expect(magpylibAxisRotation("bar")).toEqual([0, 0, 0]);
  });

  it("maps bar box args to Magpylib (length, width, height)", () => {
    expect(barBoxArgsMetres(0.02, 0.01, 0.005)).toEqual([0.02, 0.01, 0.005]);
  });
});
