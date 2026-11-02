import { describe, expect, it } from "vitest";
import {
  HALLSIM_DISCLAIMER_FULL,
  HALLSIM_DISCLAIMER_LINES,
  HALLSIM_DISCLAIMER_SHORT,
} from "./disclaimer";

describe("disclaimer copy", () => {
  it("mentions Magpylib and evaluation-only use", () => {
    expect(HALLSIM_DISCLAIMER_SHORT.toLowerCase()).toContain("magpylib");
    expect(HALLSIM_DISCLAIMER_SHORT.toLowerCase()).toContain("evaluation");
    expect(HALLSIM_DISCLAIMER_FULL.toLowerCase()).toContain("magpylib");
    expect(HALLSIM_DISCLAIMER_LINES.length).toBeGreaterThan(3);
  });
});
