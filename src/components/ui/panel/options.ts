import type { MagnetShape } from '../../../types/magnet'
import type { MotionAxis, MotionType } from '../../../types/motion'

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

export const SHAPES: { label: string; value: MagnetShape }[] = [
  { label: 'Bar', value: 'bar' },
  { label: 'Diametric Cylinder', value: 'diametric_cylinder' },
  { label: 'Axial Cylinder', value: 'axial_cylinder' },
  { label: 'Diametric Ring', value: 'ring' },
  { label: 'Axial Ring', value: 'axial_ring' },
  { label: 'Sphere', value: 'sphere' },
]

export const MATERIALS = [
  { label: 'NdFeB', value: 'NdFeB' },
  { label: 'SmCo', value: 'SmCo' },
  { label: 'Ferrite', value: 'Ferrite' },
  { label: 'AlNiCo', value: 'AlNiCo' },
]

export const GRADES = [
  { label: 'N35', value: 'N35' },
  { label: 'N42', value: 'N42' },
  { label: 'N52', value: 'N52' },
]
