import { describe, expect, it } from "vitest";
import { normalizePoles, polesEditable, polesStep } from "./magnetPoles";

describe("normalizePoles", () => {
  it("forces dipole shapes to 2", () => {
    expect(normalizePoles("axial_cylinder", 12)).toBe(2);
    expect(normalizePoles("diametric_cylinder", 8)).toBe(2);
    expect(normalizePoles("sphere", 4)).toBe(2);
  });

  it("keeps even counts for bar and ring", () => {
    expect(normalizePoles("bar", 5)).toBe(6);
    expect(normalizePoles("ring", 12)).toBe(12);
  });

  it("allows 2 or multiples of 4 for axial_ring", () => {
    expect(normalizePoles("axial_ring", 2)).toBe(2);
    expect(normalizePoles("axial_ring", 6)).toBe(4);
    expect(normalizePoles("axial_ring", 8)).toBe(8);
  });

  it("clamps invalid lows", () => {
    expect(normalizePoles("bar", 0)).toBe(2);
    expect(normalizePoles("bar", Number.NaN)).toBe(2);
  });
});

describe("polesEditable / polesStep", () => {
  it("marks multipole-capable shapes editable", () => {
    expect(polesEditable("bar")).toBe(true);
    expect(polesEditable("ring")).toBe(true);
    expect(polesEditable("axial_ring")).toBe(true);
    expect(polesEditable("sphere")).toBe(false);
  });

  it("uses step 4 for axial ring else 2", () => {
    expect(polesStep("axial_ring")).toBe(4);
    expect(polesStep("bar")).toBe(2);
  });
});
