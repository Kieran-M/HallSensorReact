import { describe, expect, it } from "vitest";
import { safeHttpsHref } from "../components/ui/panel/SensorPackageFields";

describe("safeHttpsHref", () => {
  it("allows https datasheets", () => {
    expect(
      safeHttpsHref("https://www.diodes.com/datasheet/download/AH138x.pdf"),
    ).toMatch(/^https:\/\//);
  });

  it("rejects non-https schemes", () => {
    expect(safeHttpsHref("javascript:alert(1)")).toBeNull();
    expect(safeHttpsHref("http://example.com/x.pdf")).toBeNull();
    expect(safeHttpsHref("data:text/html,hi")).toBeNull();
  });
});
