import { describe, expect, it } from "vitest";
import {
  CAMERA_SNAP_POLE_EPS,
  snapSphericalAngles,
  type CameraSnapAxis,
} from "./cameraBridge";

describe("snapSphericalAngles (Z-up)", () => {
  it("puts +Z at the polar pole (board top view)", () => {
    expect(snapSphericalAngles("z")).toEqual({
      theta: 0,
      phi: CAMERA_SNAP_POLE_EPS,
    });
    expect(snapSphericalAngles("-z").phi).toBeCloseTo(
      Math.PI - CAMERA_SNAP_POLE_EPS,
    );
  });

  it("keeps equator snaps for X/Y board-edge views", () => {
    const cases: Array<[CameraSnapAxis, number]> = [
      ["x", Math.PI / 2],
      ["-x", -Math.PI / 2],
      ["y", Math.PI],
      ["-y", 0],
    ];
    for (const [snap, theta] of cases) {
      const a = snapSphericalAngles(snap);
      expect(a.phi).toBeCloseTo(Math.PI / 2);
      expect(a.theta).toBeCloseTo(theta);
    }
  });

  it("iso sits between equator and +Z pole", () => {
    const iso = snapSphericalAngles("iso");
    expect(iso.phi).toBeGreaterThan(CAMERA_SNAP_POLE_EPS);
    expect(iso.phi).toBeLessThan(Math.PI / 2);
  });
});
