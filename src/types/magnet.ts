/** Shared magnet fields. Br, shape, poles, and temp demag affect B. */
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
  remanence: 1.31,
  temperature: 20,
  tempCoefficient: -0.12,
  coercivity: 995,
};

/**
 * Default sizes when switching shape in the UI — kept on the small Hall-demo
 * scale (few mm), not bulk stock magnets.
 */
export const SHAPE_DEFAULTS: Record<MagnetShape, MagnetParams> = {
  // ~same scale as the Ø5×2.5 mm axial puck presets
  bar: { ...BASE_DEFAULTS, shape: "bar", length: 5, width: 3, height: 2 },
  axial_cylinder: {
    ...BASE_DEFAULTS,
    shape: "axial_cylinder",
    outerDiameter: 5,
    height: 2.5,
  },
  diametric_cylinder: {
    ...BASE_DEFAULTS,
    shape: "diametric_cylinder",
    outerDiameter: 6,
    height: 2.5,
  },
  ring: {
    ...BASE_DEFAULTS,
    shape: "ring",
    outerDiameter: 12,
    innerDiameter: 7,
    height: 2.5,
  },
  axial_ring: {
    ...BASE_DEFAULTS,
    shape: "axial_ring",
    outerDiameter: 12,
    innerDiameter: 7,
    height: 2.5,
  },
  sphere: { ...BASE_DEFAULTS, shape: "sphere", diameter: 5 },
};
