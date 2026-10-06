/** Shared magnet fields. Only remanence + shape dimensions affect B today. */
export interface BaseMagnetParams {
  poles: number;
  material: string;
  materialGrade: string;
  remanence: number;
  temperature: number;
  tempCoefficient: number;
  coercivity: number;
}

export interface BarMagnet extends BaseMagnetParams {
  shape: "bar";
  length: number;
  width: number;
  height: number;
}

export interface AxialCylinderMagnet extends BaseMagnetParams {
  shape: "axial_cylinder";
  outerDiameter: number;
  height: number;
}

export interface DiametricCylinderMagnet extends BaseMagnetParams {
  shape: "diametric_cylinder";
  outerDiameter: number;
  height: number;
}

export interface RingMagnet extends BaseMagnetParams {
  shape: "ring";
  outerDiameter: number;
  innerDiameter: number;
  height: number;
}

export interface AxialRingMagnet extends BaseMagnetParams {
  shape: "axial_ring";
  outerDiameter: number;
  innerDiameter: number;
  height: number;
}

export interface SphereMagnet extends BaseMagnetParams {
  shape: "sphere";
  diameter: number;
}

export type MagnetParams =
  | BarMagnet
  | AxialCylinderMagnet
  | DiametricCylinderMagnet
  | RingMagnet
  | AxialRingMagnet
  | SphereMagnet;

export type MagnetShape = MagnetParams["shape"];

const BASE_DEFAULTS: BaseMagnetParams = {
  poles: 2,
  material: "NdFeB",
  materialGrade: "N42",
  remanence: 1.32,
  temperature: 20,
  tempCoefficient: -0.12,
  coercivity: 995,
};

export const SHAPE_DEFAULTS: Record<MagnetShape, MagnetParams> = {
  bar: { ...BASE_DEFAULTS, shape: "bar", length: 20, width: 10, height: 5 },
  axial_cylinder: {
    ...BASE_DEFAULTS,
    shape: "axial_cylinder",
    outerDiameter: 10,
    height: 5,
  },
  diametric_cylinder: {
    ...BASE_DEFAULTS,
    shape: "diametric_cylinder",
    outerDiameter: 10,
    height: 5,
  },
  ring: {
    ...BASE_DEFAULTS,
    shape: "ring",
    outerDiameter: 10,
    innerDiameter: 5,
    height: 5,
  },
  axial_ring: {
    ...BASE_DEFAULTS,
    shape: "axial_ring",
    outerDiameter: 10,
    innerDiameter: 5,
    height: 5,
  },
  sphere: { ...BASE_DEFAULTS, shape: "sphere", diameter: 10 },
};
