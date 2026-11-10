import {
  resolvePackageVariant,
  type PackageVariantInfo,
  type SensorPackageInfo,
} from "../types/simulation";

/** Effective outline + die offset for the selected part / package variant. */
export function activeMechanicalPackage(
  pkg: SensorPackageInfo | null | undefined,
  variantId?: string | null,
): {
  outline: PackageVariantInfo["outline"];
  dieOffsetMm: { x: number; y: number; z: number };
  variant: PackageVariantInfo | null;
  label: string;
} {
  const variant = resolvePackageVariant(pkg, variantId);
  return {
    outline: variant?.outline ?? pkg?.packageOutline ?? "sot23",
    dieOffsetMm: variant?.dieOffsetMm ?? pkg?.dieOffsetMm ?? { x: 0, y: 0, z: 0 },
    variant,
    label: variant?.label ?? pkg?.packages[0] ?? "Package",
  };
}
