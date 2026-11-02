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

/** N42 NdFeB — Br 1.31 T (13,100 G) per magnet-grade appendix. */
const N42 = {
  poles: 2,
  material: "NdFeB",
  materialGrade: "N42",
  remanence: 1.31,
  temperature: 20,
  tempCoefficient: -0.12,
  coercivity: 955,
} as const;

/** N35 — Br 1.2 T (12,000 G); common in small consumer magnets. */
const N35 = {
  ...N42,
  materialGrade: "N35",
  remanence: 1.2,
  coercivity: 868,
} as const;

/**
 * Application-example presets (mm / deg). Tuned for Magpylib + Z-axis Hall
 * parts in the Phase-1 catalog: face gaps a few mm, sensors that trip on the
 * intended waveform (latch / unipolar / linear).
 *
 * Keep stable `id`s for landing SVG previews / store applyPreset.
 */
export const PRESETS: Record<string, PresetSetup> = {
  /**
   * Linear, Slide-By — small axial puck past a latch at ~2.8 mm face gap.
   * Bipolar Bz pulse: operate near approach, release on the opposite lobe.
   */
  "slide-by": {
    meta: {
      id: "slide-by",
      label: "Linear, Slide-By",
      category: "Linear",
      description:
        "N35 Ø5×2.5 mm axial cylinder sliding past an AH1712 latch (~2.8 mm face gap). Classic bipolar Bz pulse with digital operate / release.",
      fieldStrength: "side lobes tens of mT; peaks higher when overhead",
      waveform: "Bipolar pulse → latch switch",
      magnetType: "Axial Cylinder",
      tags: ["linear", "slide-by", "position", "latch"],
    },
    magnet: {
      ...N35,
      shape: "axial_cylinder",
      outerDiameter: 5,
      height: 2.5,
    },
    sensor: { x: 0, y: 0, z: 0 },
    animation: {
      type: "linear",
      // Face gap ≈ 2.75 mm → centre z = 2.75 + 2.5/2 = 4 mm
      startPosition: { x: -20, y: 0, z: 4 },
      endPosition: { x: 20, y: 0, z: 4 },
      startRotation: { x: 0, y: 0, z: 0 },
      endRotation: { x: 0, y: 0, z: 0 },
    },
    duration: 2.5,
    fps: 60,
    sensorPackageId: "ah1712",
  },

  /**
   * Linear, Head-On — proximity unipolar: far (OFF) → near (ON).
   */
  "head-on": {
    meta: {
      id: "head-on",
      label: "Linear, Head-On",
      category: "Linear",
      description:
        "N35 Ø5×2.5 mm axial cylinder approaching along Z into an AH1382 unipolar switch (Bop ~30 G). Starts OFF at ~18 mm face gap, operates near ~3.8 mm.",
      fieldStrength: "few mT far → tens–hundreds mT near",
      waveform: "Approach → unipolar operate",
      magnetType: "Axial Cylinder",
      tags: ["linear", "head-on", "proximity", "unipolar"],
    },
    magnet: {
      ...N35,
      shape: "axial_cylinder",
      outerDiameter: 5,
      height: 2.5,
    },
    sensor: { x: 0, y: 0, z: 0 },
    animation: {
      type: "linear",
      // Face gaps ≈ 18.75 mm → 3.75 mm (centre z = gap + h/2)
      startPosition: { x: 0, y: 0, z: 20 },
      endPosition: { x: 0, y: 0, z: 5 },
      startRotation: { x: 0, y: 0, z: 0 },
      endRotation: { x: 0, y: 0, z: 0 },
    },
    duration: 2.5,
    fps: 60,
    sensorPackageId: "ah1382",
  },

  /**
   * Arc (Hinge) — lid / lever: open OFF → closed ON on a latch.
   */
  "lid-closure": {
    meta: {
      id: "lid-closure",
      label: "Arc (Hinge)",
      category: "Arc",
      description:
        "Small N35 axial magnet on a 30 mm +Y hinge (55° open above the board → 0° closed along +X). AH1712 under the closed arm starts released and operates as the lid closes.",
      fieldStrength: "weak when open; strong when closed",
      waveform: "Angular sweep → latch operate",
      magnetType: "Axial Cylinder",
      tags: ["arc", "hinge", "lid", "latch"],
    },
    magnet: {
      ...N35,
      shape: "axial_cylinder",
      outerDiameter: 4,
      height: 2,
    },
    // Under closed arm at 0° (+X); package below magnet, looking +Z
    sensor: { x: 30, y: 0, z: -3 },
    animation: {
      type: "hinge",
      pivot: { x: 0, y: 0, z: 0 },
      // +Y pin: XZ lid plane. Positive UI angle = open toward +Z.
      axis: "y",
      armLength: 30,
      startAngle: 55,
      endAngle: 0,
      bounce: false,
    },
    duration: 1.8,
    fps: 60,
    sensorPackageId: "ah1712",
  },

  /**
   * Rotation or Spin — diametric disc off-axis so a Z-axis Hall sees Bz sinusoid.
   * (On-axis diametric spin only modulates Bx/By; catalog parts sense Z.)
   */
  "angle-encoding": {
    meta: {
      id: "angle-encoding",
      label: "Rotation or Spin",
      category: "Rotary",
      description:
        "N42 Ø8×2.5 mm diametric disc, centre 6 mm off the Z-axis sensor, ~2.8 mm face gap. Full turn yields a sinusoidal Bz for AH49F linear output.",
      fieldStrength: "± tens of mT on Bz (off-axis)",
      waveform: "Sinusoidal Bz",
      magnetType: "Radial Cylinder",
      tags: ["rotation", "spin", "angle", "linear"],
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
      // Off-axis: sensor at origin sees rotating Bz. Face gap ≈ 2.75 mm.
      position: { x: 6, y: 0, z: 4 },
      axis: "z",
      startAngle: 0,
      endAngle: 360,
    },
    duration: 3,
    fps: 60,
    sensorPackageId: "ah49f",
  },

  /**
   * Rotation (Ring) — multipole ring with sensor under the rim (not the hole).
   */
  "incremental-encoding": {
    meta: {
      id: "incremental-encoding",
      label: "Rotation or Spin (Ring)",
      category: "Rotary",
      description:
        "N42 12-pole ring (OD 12 / ID 7 × 2.5 mm). Sensor under the rim at r ≈ 4.75 mm so Z-axis Hall sees 12 Bz cycles per turn (AH49F).",
      fieldStrength: "tens of mT under the rim",
      waveform: "12-cycle periodic Bz",
      magnetType: "Ring",
      tags: ["rotation", "ring", "spin", "multipole", "encoder"],
    },
    magnet: {
      ...N42,
      shape: "ring",
      poles: 12,
      outerDiameter: 12,
      innerDiameter: 7,
      height: 2.5,
    },
    // Under mid-wall: (OD+ID)/4 = 4.75 mm — hole centre is ~0 for radial multipole
    sensor: { x: 4.75, y: 0, z: 0 },
    animation: {
      type: "rotate",
      // Face gap ≈ 2.25 mm → centre z = 2.25 + 2.5/2 = 3.5 mm
      position: { x: 0, y: 0, z: 3.5 },
      axis: "z",
      startAngle: 0,
      endAngle: 360,
    },
    duration: 2,
    fps: 60,
    sensorPackageId: "ah49f",
  },
};

/** Landing-page preset order. */
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
