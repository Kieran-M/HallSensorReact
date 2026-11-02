/**
 * Magnet materials / grades catalog.
 * NdFeB Br from “To Build Online Magnetic Simulation Tool” appendix (G → T).
 * Grade selection sets Br + temp coeff; simulate uses Br with linear temp demag.
 */

export type MagnetMaterialId = "NdFeB";

export interface MagnetGradeInfo {
  id: string;
  label: string;
  /** Remanence Br (Tesla). Source table lists G and mT; Magpylib uses T. */
  remanenceT: number;
}

export interface MagnetMaterialInfo {
  id: MagnetMaterialId;
  label: string;
  /** Temperature coefficient of Br (% / °C). */
  tempCoefficient: number;
  grades: MagnetGradeInfo[];
}

/** Br (mT) / 1000 → T. Matches appendix: N35 = 12,000 G = 1,200 mT. */
export const MAGNET_MATERIALS: MagnetMaterialInfo[] = [
  {
    id: "NdFeB",
    label: "NdFeB",
    tempCoefficient: -0.12,
    grades: [
      { id: "N35", label: "N35", remanenceT: 1.2 },
      { id: "N38", label: "N38", remanenceT: 1.24 },
      { id: "N40", label: "N40", remanenceT: 1.275 },
      { id: "N42", label: "N42", remanenceT: 1.31 },
      { id: "N45", label: "N45", remanenceT: 1.35 },
      { id: "N48", label: "N48", remanenceT: 1.39 },
      { id: "N50", label: "N50", remanenceT: 1.425 },
      { id: "N52", label: "N52", remanenceT: 1.455 },
      { id: "N55", label: "N55", remanenceT: 1.49 },
    ],
  },
];

const MATERIAL_BY_ID = Object.fromEntries(
  MAGNET_MATERIALS.map((m) => [m.id, m]),
) as Record<MagnetMaterialId, MagnetMaterialInfo>;

const GRADE_LOOKUP = new Map<string, { material: MagnetMaterialId; grade: MagnetGradeInfo }>();
for (const mat of MAGNET_MATERIALS) {
  for (const grade of mat.grades) {
    GRADE_LOOKUP.set(grade.id, { material: mat.id, grade });
  }
}

export function getMagnetMaterial(
  id: string | undefined,
): MagnetMaterialInfo | undefined {
  if (!id) return undefined;
  return MATERIAL_BY_ID[id as MagnetMaterialId];
}

export function gradesForMaterial(
  materialId: string | undefined,
): MagnetGradeInfo[] {
  return getMagnetMaterial(materialId)?.grades ?? [];
}

export function resolveGradeRemanence(gradeId: string | undefined): number | null {
  if (!gradeId) return null;
  return GRADE_LOOKUP.get(gradeId)?.grade.remanenceT ?? null;
}

export function defaultGradeForMaterial(
  materialId: string | undefined,
): MagnetGradeInfo | undefined {
  return gradesForMaterial(materialId)[0];
}

/** Flat remanence map kept for callers that keyed by grade id. */
export const GRADE_REMANENCE_T: Record<string, number> = Object.fromEntries(
  [...GRADE_LOOKUP.entries()].map(([id, { grade }]) => [id, grade.remanenceT]),
);
