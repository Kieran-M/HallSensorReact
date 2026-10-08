import type {
  AnimationParams,
  MagnetParams,
  SensorPosition,
} from "../store/simulatorStore";

export interface PresetMeta {
  id: string;
  label: string;
  category: string;
  description: string;
  fieldStrength: string;
  waveform: string;
  magnetType: string;
  tags: string[];
}

export interface PresetSetup {
  meta: PresetMeta;
  magnet: MagnetParams;
  sensor: SensorPosition;
  animation: AnimationParams;
  duration: number;
  fps: number;
  sensorPackageId: string;
}

/** N42 NdFeB — typical sintered grade used in Hall demos. */
const N42 = {
  poles: 2,
  material: "NdFeB",
  materialGrade: "N42",
  remanence: 1.3,
  temperature: 25,
  tempCoefficient: -0.12,
  coercivity: 955,
} as const;

/** Smaller consumer magnets are often N35. */
const N35 = {
  ...N42,
  materialGrade: "N35",
  remanence: 1.18,
  coercivity: 868,
} as const;

/**
 * Application-example presets aligned with Magnet_InputParameters.
 * Units: millimetres and degrees. Sensor face at package origin unless noted.
 *
 * Doc mapping:
 *   Linear, Slide-By     → axial cylinder, linear travel
 *   Linear, Head-On      → axial cylinder, axial approach
 *   Arc (Hinge)          → axial cylinder, hinge at origin, ~35° sweep
 *   Rotation or Spin     → radial (diametric) cylinder, 0–360°
 *   Rotation (Ring)      → ring, 0–360° (single-segment Magpylib today)
 *
 * Keep stable `id`s for landing SVG previews / store applyPreset.
 */
export const PRESETS: Record<string, PresetSetup> = {
  /**
   * Linear, Slide-By — axial cylinder translating laterally at fixed air gap.
   */
  "slide-by": {
    meta: {
      id: "slide-by",
      label: "Linear, Slide-By",
      category: "Linear",
      description:
        "Axially magnetized cylinder sliding past the sensor at a fixed air gap. Classic linear position / speed sensing topology.",
      fieldStrength: "±20–60 mT",
      waveform: "Bipolar pulse",
      magnetType: "Axial Cylinder",
      tags: ["linear", "slide-by", "position"],
    },
    magnet: {
      ...N42,
      shape: "axial_cylinder",
      outerDiameter: 6,
      height: 4,
    },
    sensor: { x: 0, y: 0, z: 0 },
    animation: {
      type: "linear",
      // Face gap ≈ 2 mm → centre z = 2 + 4/2 = 4 mm
      startPosition: { x: -18, y: 0, z: 4 },
      endPosition: { x: 18, y: 0, z: 4 },
      startRotation: { x: 0, y: 0, z: 0 },
      endRotation: { x: 0, y: 0, z: 0 },
    },
    duration: 2.5,
    fps: 60,
    sensorPackageId: "ah49f",
  },

  /**
   * Linear, Head-On — axial cylinder approaching along the sensing axis.
   */
  "head-on": {
    meta: {
      id: "head-on",
      label: "Linear, Head-On",
      category: "Linear",
      description:
        "Axially magnetized cylinder approaching the sensor along Z. Monotonic Bz ramp — proximity / head-on switch topology.",
      fieldStrength: "5–150 mT",
      waveform: "Linear ramp",
      magnetType: "Axial Cylinder",
      tags: ["linear", "head-on", "proximity"],
    },
    magnet: {
      ...N42,
      shape: "axial_cylinder",
      outerDiameter: 6,
      height: 4,
    },
    sensor: { x: 0, y: 0, z: 0 },
    animation: {
      type: "linear",
      // Far face gap ≈ 16 mm → z = 18; near face gap ≈ 2 mm → z = 4
      startPosition: { x: 0, y: 0, z: 18 },
      endPosition: { x: 0, y: 0, z: 4 },
      startRotation: { x: 0, y: 0, z: 0 },
      endRotation: { x: 0, y: 0, z: 0 },
    },
    duration: 2.5,
    fps: 60,
    sensorPackageId: "ah49f",
  },

  /**
   * Arc (Hinge) — axial cylinder on an arm about origin; default arc 35°.
   */
  "lid-closure": {
    meta: {
      id: "lid-closure",
      label: "Arc (Hinge)",
      category: "Arc",
      description:
        "Axial cylinder on a hinged arm about the origin (0, 0, 0). Default 35° arc for magnet-angle vs output charts.",
      fieldStrength: "10–80 mT",
      waveform: "Angular sweep",
      magnetType: "Axial Cylinder",
      tags: ["arc", "hinge", "angle"],
    },
    magnet: {
      ...N35,
      shape: "axial_cylinder",
      outerDiameter: 5,
      height: 3,
    },
    // Under the closed arm (angle 0° along +X): small Z face gap
    sensor: { x: 30, y: 0, z: -2 },
    animation: {
      type: "hinge",
      pivot: { x: 0, y: 0, z: 0 },
      axis: "y",
      armLength: 30,
      // Doc default arc length = 35° (open → closed)
      startAngle: 35,
      endAngle: 0,
      bounce: false,
    },
    duration: 1.8,
    fps: 60,
    // Latch switch on a closing arc — Chart 3 step + Bop/Brp on field chart
    sensorPackageId: "ah1711",
  },

  /**
   * Rotation or Spin — diametric (radial) cylinder, full turn.
   */
  "angle-encoding": {
    meta: {
      id: "angle-encoding",
      label: "Rotation or Spin",
      category: "Rotary",
      description:
        "Diametrically magnetized (radial) cylinder spinning above the sensor. Full 360° for magnet-angle vs field / output charts.",
      fieldStrength: "±40–80 mT",
      waveform: "Sinusoidal",
      magnetType: "Radial Cylinder",
      tags: ["rotation", "spin", "angle"],
    },
    magnet: {
      ...N42,
      shape: "diametric_cylinder",
      outerDiameter: 8,
      height: 2.5,
    },
    sensor: { x: 0, y: 0, z: 0 },
    animation: {
      type: "rotate",
      // Face gap ≈ 1.5 mm → centre z = 1.5 + 2.5/2 = 2.75 mm
      position: { x: 0, y: 0, z: 2.75 },
      axis: "z",
      startAngle: 0,
      endAngle: 360,
    },
    duration: 3,
    fps: 60,
    sensorPackageId: "ah49f",
  },

  /**
   * Rotation or Spin (Ring) — ring magnet, full turn.
   * Note: Magpylib uses a single CylinderSegment today; multi-segment
   * radial Collection (doc) is not modelled yet — poles are UI metadata.
   */
  "incremental-encoding": {
    meta: {
      id: "incremental-encoding",
      label: "Rotation or Spin (Ring)",
      category: "Rotary",
      description:
        "Ring magnet rotating above the sensor (0–360°). Field uses a single Magpylib ring segment for now; multi-pole radial Collection comes later.",
      fieldStrength: "15–50 mT",
      waveform: "Periodic",
      magnetType: "Ring",
      tags: ["rotation", "ring", "spin"],
    },
    magnet: {
      ...N42,
      shape: "ring",
      poles: 12,
      outerDiameter: 16,
      innerDiameter: 10,
      height: 2.5,
    },
    sensor: { x: 0, y: 0, z: 0 },
    animation: {
      type: "rotate",
      // Face gap ≈ 1.2 mm → centre z = 1.2 + 2.5/2 = 2.45 mm
      position: { x: 0, y: 0, z: 2.45 },
      axis: "z",
      startAngle: 0,
      endAngle: 360,
    },
    duration: 2,
    fps: 60,
    sensorPackageId: "ah49f",
  },
};

/** Landing order matches Magnet_InputParameters application examples. */
export const PRESET_LIST: PresetSetup[] = [
  PRESETS["slide-by"],
  PRESETS["head-on"],
  PRESETS["lid-closure"],
  PRESETS["angle-encoding"],
  PRESETS["incremental-encoding"],
];

export function getPreset(id: string): PresetSetup | undefined {
  return PRESETS[id];
}
