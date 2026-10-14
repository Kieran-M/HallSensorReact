import type { MagnetShape } from '../../../types/magnet'
import type { MotionAxis, MotionType } from '../../../types/motion'
import {
  GRADE_REMANENCE_T,
  MAGNET_MATERIALS,
  gradesForMaterial,
  type MagnetMaterialId,
} from '../../../lib/magnetCatalog'

export { GRADE_REMANENCE_T, gradesForMaterial }
export type { MagnetMaterialId }

export const MOTION_TYPES: { label: string; value: MotionType }[] = [
  { label: 'Linear', value: 'linear' },
  { label: 'Rotate', value: 'rotate' },
  { label: 'Hinge', value: 'hinge' },
]

export const AXES: { label: string; value: MotionAxis }[] = [
  { label: 'X', value: 'x' },
  { label: 'Y', value: 'y' },
  { label: 'Z', value: 'z' },
]

/** TIMSS / Magnet Input Parameters shapes. */
export const SHAPES: { label: string; value: MagnetShape }[] = [
  { label: 'Bar', value: 'bar' },
  { label: 'Diametric Cylinder', value: 'diametric_cylinder' },
  { label: 'Axial Cylinder', value: 'axial_cylinder' },
  { label: 'Diametric Ring', value: 'ring' },
  { label: 'Axial Ring', value: 'axial_ring' },
  { label: 'Sphere', value: 'sphere' },
]

export const MATERIALS: { label: string; value: MagnetMaterialId }[] =
  MAGNET_MATERIALS.map((m) => ({ label: m.label, value: m.id }))

/** All grades across materials (legacy flat list). Prefer gradesForMaterial(). */
export const GRADES: { label: string; value: string }[] =
  MAGNET_MATERIALS.flatMap((m) =>
    m.grades.map((g) => ({ label: `${g.label}`, value: g.id })),
  )
