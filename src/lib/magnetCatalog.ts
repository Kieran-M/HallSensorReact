/**
 * Magnet materials / grades from TIMSS-style Magnet Input Parameters (Appendix A.2).
 * Typical remanence (T) and temp coefficient (%/°C) used when selecting a grade.
 * Field math still uses remanence; grade/material are catalog metadata for the UI.
 */

export type MagnetMaterialId =
  | "NdFeB"
  | "SmCo"
  | "BondedNdFeB"
  | "AlNiCo"
  | "Ferrite"
  | "RubberFerrite";

export interface MagnetGradeInfo {
  id: string;
  label: string;
  /** Typical remanence at ~20 °C (Tesla). */
  remanenceT: number;
}

export interface MagnetMaterialInfo {
  id: MagnetMaterialId;
  label: string;
  /** Temperature coefficient of Br (% / °C). */
  tempCoefficient: number;
  grades: MagnetGradeInfo[];
}

export const MAGNET_MATERIALS: MagnetMaterialInfo[] = [
  {
    id: "NdFeB",
    label: "Sintered NdFeB",
    tempCoefficient: -0.12,
    grades: [
      { id: "N35", label: "N35", remanenceT: 1.18 },
      { id: "N38", label: "N38", remanenceT: 1.22 },
      { id: "N40", label: "N40", remanenceT: 1.26 },
      { id: "N42", label: "N42", remanenceT: 1.3 },
      { id: "N45", label: "N45", remanenceT: 1.35 },
      { id: "N48", label: "N48", remanenceT: 1.39 },
      { id: "N50", label: "N50", remanenceT: 1.42 },
      { id: "N52", label: "N52", remanenceT: 1.45 },
      { id: "N55", label: "N55", remanenceT: 1.48 },
    ],
  },
  {
    id: "SmCo",
    label: "Samarium Cobalt (SmCo)",
    tempCoefficient: -0.03,
    grades: [
      { id: "YX18", label: "YX18", remanenceT: 0.85 },
      { id: "YX20", label: "YX20", remanenceT: 0.9 },
      { id: "YX24", label: "YX24", remanenceT: 0.98 },
      { id: "YXH24", label: "YXH24", remanenceT: 0.98 },
      { id: "YXG26", label: "YXG26", remanenceT: 1.02 },
      { id: "YXG28", label: "YXG28", remanenceT: 1.06 },
      { id: "YXG28B", label: "YXG28B", remanenceT: 1.06 },
      { id: "YXG30", label: "YXG30", remanenceT: 1.1 },
      { id: "YXG30B", label: "YXG30B", remanenceT: 1.1 },
    ],
  },
  {
    id: "BondedNdFeB",
    label: "Bonded NdFeB",
    tempCoefficient: -0.12,
    grades: [
      { id: "BDM-4", label: "BDM-4", remanenceT: 0.4 },
      { id: "BDM-6", label: "BDM-6", remanenceT: 0.55 },
      { id: "BDM-8", label: "BDM-8", remanenceT: 0.65 },
      { id: "BDM-10", label: "BDM-10", remanenceT: 0.72 },
      { id: "BDM-12", label: "BDM-12", remanenceT: 0.8 },
      { id: "BDM-L", label: "BDM-L", remanenceT: 0.7 },
    ],
  },
  {
    id: "AlNiCo",
    label: "AlNiCo",
    tempCoefficient: -0.02,
    grades: [
      { id: "LN9", label: "LN9", remanenceT: 0.68 },
      { id: "LN10", label: "LN10", remanenceT: 0.7 },
      { id: "LN12", label: "LN12", remanenceT: 0.72 },
      { id: "LN13", label: "LN13", remanenceT: 0.75 },
      { id: "LNG34", label: "LNG34", remanenceT: 1.12 },
      { id: "LNG37", label: "LNG37", remanenceT: 1.18 },
      { id: "LNG40", label: "LNG40", remanenceT: 1.25 },
      { id: "LNG44", label: "LNG44", remanenceT: 1.3 },
      { id: "LNG52", label: "LNG52", remanenceT: 1.35 },
      { id: "LNGT28", label: "LNGT28", remanenceT: 1.05 },
      { id: "LNGT32", label: "LNGT32", remanenceT: 1.1 },
      { id: "LNGT36J", label: "LNGT36J", remanenceT: 1.15 },
      { id: "LNGT40", label: "LNGT40", remanenceT: 1.2 },
      { id: "LNGT60", label: "LNGT60", remanenceT: 1.3 },
      { id: "LNGT72", label: "LNGT72", remanenceT: 1.35 },
    ],
  },
  {
    id: "Ferrite",
    label: "Ceramic Ferrite",
    tempCoefficient: -0.2,
    grades: [
      { id: "C1", label: "C1", remanenceT: 0.22 },
      { id: "C5", label: "C5", remanenceT: 0.38 },
      { id: "C7", label: "C7", remanenceT: 0.35 },
      { id: "C8", label: "C8", remanenceT: 0.39 },
      { id: "C8B", label: "C8B", remanenceT: 0.4 },
      { id: "C9", label: "C9", remanenceT: 0.38 },
      { id: "C10", label: "C10", remanenceT: 0.4 },
      { id: "C11", label: "C11", remanenceT: 0.41 },
    ],
  },
  {
    id: "RubberFerrite",
    label: "Rubberized Ferrite",
    tempCoefficient: -0.2,
    grades: [
      { id: "FRM-5", label: "FRM-5", remanenceT: 0.15 },
      { id: "FRM-6", label: "FRM-6", remanenceT: 0.18 },
      { id: "FRM-8", label: "FRM-8", remanenceT: 0.2 },
      { id: "FRM-11", label: "FRM-11", remanenceT: 0.22 },
      { id: "FRM-12", label: "FRM-12", remanenceT: 0.24 },
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
