import { describe, expect, it } from "vitest";
import {
  normalizePoles,
  polesEditable,
  polesStep,
  stepPoles,
} from "./magnetPoles";

describe("normalizePoles", () => {
  it("forces dipole shapes to 2", () => {
    expect(normalizePoles("axial_cylinder", 12)).toBe(2);
    expect(normalizePoles("diametric_cylinder", 8)).toBe(2);
    expect(normalizePoles("sphere", 4)).toBe(2);
  });

  it("keeps even counts for bar / ring", () => {
    expect(normalizePoles("bar", 5)).toBe(6);
    expect(normalizePoles("ring", 12)).toBe(12);
  });

  it("axial ring: 2 or nearest multiple of 4", () => {
    expect(normalizePoles("axial_ring", 2)).toBe(2);
    expect(normalizePoles("axial_ring", 5)).toBe(4);
    expect(normalizePoles("axial_ring", 6)).toBe(8);
    expect(normalizePoles("axial_ring", 8)).toBe(8);
  });

  it("clamps garbage to 2", () => {
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

  it("uses step 4 for axial ring", () => {
    expect(polesStep("axial_ring")).toBe(4);
    expect(polesStep("bar")).toBe(2);
  });
});

describe("stepPoles", () => {
  it("walks axial ring 2 → 4 → 8 with spinner values", () => {
    expect(stepPoles("axial_ring", 2, 6)).toBe(4);
    expect(stepPoles("axial_ring", 4, 8)).toBe(8);
    expect(stepPoles("axial_ring", 4, 5)).toBe(8);
  });

  it("walks axial ring back 8 → 4 → 2", () => {
    expect(stepPoles("axial_ring", 8, 4)).toBe(4);
    expect(stepPoles("axial_ring", 4, 2)).toBe(2);
    expect(stepPoles("axial_ring", 4, 3)).toBe(2);
  });
});
