import { describe, expect, it } from "vitest";
import { packageThumbKey, resolvePackageModel } from "./packageModels";

describe("resolvePackageModel", () => {
  it("maps X2-DFN1010-4 Type B to the 1010 GLB, not 1410", () => {
    const model = resolvePackageModel("dfn", "X2-DFN1010-4 (Type B)");
    expect(model?.id).toBe("dfn1010");
    expect(model?.url).toContain("dfn1010h4b-4");
    expect(model?.rotation[1]).toBeCloseTo(Math.PI / 2);
  });

  it("maps X2-DFN1410-4 to the 1410 GLB", () => {
    const model = resolvePackageModel("dfn", "X2-DFN1410-4");
    expect(model?.id).toBe("dfn1410");
    expect(model?.url).toContain("dfn.glb");
  });

  it("falls back by outline when label is empty", () => {
    expect(resolvePackageModel("sot23", null)?.id).toBe("sot23");
    expect(resolvePackageModel("sip3")?.id).toBe("sip3");
    expect(resolvePackageModel("sc59")).toBeNull();
    expect(resolvePackageModel("sot553")).toBeNull();
  });

  it("uses distinct thumb keys for DFN sizes", () => {
    expect(packageThumbKey("dfn", "X2-DFN1010-4 (Type B)")).toBe("dfn1010");
    expect(packageThumbKey("dfn", "X2-DFN1410-4")).toBe("dfn1410");
  });
});
