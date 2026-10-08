import type { SensorPackageInfo } from "../types/simulation";

/** Sens(mV/G) at operate VDD from catalog model or constant V/T. */
export function sensitivityMvPerG(
  pkg: SensorPackageInfo,
  supplyV: number,
): number | null {
  const model = pkg.sensitivityModel;
  if (model?.type === "ratiometric_mv_per_g") {
    return model.slope * supplyV + model.intercept;
  }
  if (pkg.sensitivityVPerT != null && Number.isFinite(pkg.sensitivityVPerT)) {
    // V/T → mV/G: divide by 10
    return pkg.sensitivityVPerT / 10;
  }
  return null;
}

export function resolveOperateSupply(
  pkg: SensorPackageInfo | null | undefined,
  override: number | null,
): number {
  if (override != null && override > 0) return override;
  return pkg?.supply ?? 5;
}
