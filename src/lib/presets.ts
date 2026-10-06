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
  remanence: 1.30,
  temperature: 25,
  tempCoefficient: -0.12,
  coercivity: 955,
} as const;

/** Smaller consumer block magnets are often N35. */
const N35 = {
  ...N42,
  materialGrade: "N35",
  remanence: 1.18,
  coercivity: 868,
} as const;

/**
 * Known-good demos with app-note-like geometries.
 * Units: millimetres and degrees. Sensor face is at the package origin unless noted.
 *
 * Air-gap convention: for a magnet of height H centred at z, face gap ≈ z − H/2
 * when the sensor is at z = 0 and the magnet approaches along +Z.
 *
 * Note: use `import type` from the store only — a value import creates a circular init cycle.
 */
export const PRESETS: Record<string, PresetSetup> = {
  /**
   * Absolute angle — diametric disc over on-axis Hall (or 2D sensor).
   * Typical: Ø6–10 mm × 2–3 mm disc, 1.0–2.5 mm air gap, 0–360° spin.
   */
  "angle-encoding": {
    meta: {
      id: "angle-encoding",
      label: "Angle Encoding",
      category: "Rotary",
      description:
        "Diametrically magnetized disc magnet rotating above sensor face. Full 360° sinusoidal Bx/By field for absolute angle reconstruction.",
      fieldStrength: "±40–80 mT",
      waveform: "Sinusoidal",
      magnetType: "Disc — Diametric",
      tags: ["absolute", "rotary", "encoder"],
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
    sensorPackageId: "test",
  },

  /**
   * Bipolar slide-by — axial bar past a Z-axis Hall at fixed air gap.
   * Typical: 10–15 mm long bar, 1.5–3 mm gap, travel spanning ~±1.5× magnet length.
   */
  "slide-by": {
    meta: {
      id: "slide-by",
      label: "Slide-by",
      category: "Linear",
      description:
        "Bar magnet translating laterally past the sensor at a fixed air gap. Generates bipolar field transition used for position detection and speed sensing.",
      fieldStrength: "±30–60 mT",
      waveform: "Sinusoidal",
      magnetType: "Bar — Axial",
      tags: ["linear", "position", "bipolar"],
    },
    magnet: {
      ...N42,
      shape: "bar",
      length: 12,
      width: 5,
      height: 3,
    },
    sensor: { x: 0, y: 0, z: 0 },
    animation: {
      type: "linear",
      // Face gap ≈ 2.0 mm → centre z = 2.0 + 3/2 = 3.5 mm
      startPosition: { x: -18, y: 0, z: 3.5 },
      endPosition: { x: 18, y: 0, z: 3.5 },
      startRotation: { x: 0, y: 0, z: 0 },
      endRotation: { x: 0, y: 0, z: 0 },
    },
    duration: 2.5,
    fps: 60,
    sensorPackageId: "test",
  },

  /**
   * Incremental ring — multi-pole ring above face for pulse / quadrature demos.
   * Typical motor/encoder ring: OD 12–20 mm, 8–16 poles, ~1–2 mm axial gap.
   */
  "incremental-encoding": {
    meta: {
      id: "incremental-encoding",
      label: "Incremental Encoding",
      category: "Rotary",
      description:
        "Multi-pole ring magnet with alternating N/S segments passing the sensor. Produces quadrature pulse output for direction and incremental position.",
      fieldStrength: "15–50 mT",
      waveform: "Square",
      magnetType: "Ring — Multi-pole",
      tags: ["quadrature", "ring-magnet", "incremental"],
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
    sensorPackageId: "test",
  },

  /**
   * Head-on / proximity switch — axial cylinder on sensing axis.
   * Typical: Ø5–8 mm × 3–5 mm, release ~10–20 mm, operate ~1.5–3 mm face gap.
   */
  "head-on": {
    meta: {
      id: "head-on",
      label: "Head On",
      category: "Switch",
      description:
        "Axially magnetized cylinder magnet approaching the sensor along the sensing axis. Monotonically increasing Bz field — classic switch and proximity topology.",
      fieldStrength: "5–150 mT",
      waveform: "Linear Ramp",
      magnetType: "Cylinder — Axial",
      tags: ["proximity", "switch", "axial"],
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
      // Far face gap ≈ 16 mm → z = 16 + 2 = 18; operate face gap ≈ 2 mm → z = 4
      startPosition: { x: 0, y: 0, z: 18 },
      endPosition: { x: 0, y: 0, z: 4 },
      startRotation: { x: 0, y: 0, z: 0 },
      endRotation: { x: 0, y: 0, z: 0 },
    },
    duration: 2.5,
    fps: 60,
    sensorPackageId: "test",
  },

  /**
   * Lid / flip-cover — small block on a hinged arm over a PCB Hall.
   * Typical: 4–6 mm NdFeB cube/block, arm 30–50 mm, closed gap 1–3 mm, open ~80–90°.
   * Closed: magnet at (arm, 0, 0); sensor slightly below for a Z-axis face gap.
   */
  "lid-closure": {
    meta: {
      id: "lid-closure",
      label: "Lid Closure",
      category: "Switch",
      description:
        "Small NdFeB block magnet mounted on a hinged lid, swinging into range. Models smartphone flip cover, appliance door, and safety interlock detection.",
      fieldStrength: "10–80 mT",
      waveform: "Step",
      magnetType: "Block — Lateral",
      tags: ["lid", "switch", "consumer"],
    },
    magnet: {
      ...N35,
      shape: "bar",
      length: 5,
      width: 4,
      height: 2,
    },
    // Under the closed lid: ~2 mm face gap in Z (sensor on PCB)
    sensor: { x: 40, y: 0, z: -2 },
    animation: {
      type: "hinge",
      pivot: { x: 0, y: 0, z: 0 },
      axis: "y",
      armLength: 40,
      // −90° = open (raised along +Z); 0° = closed along +X over the sensor
      startAngle: -90,
      endAngle: 0,
      bounce: false,
    },
    duration: 1.8,
    fps: 60,
    sensorPackageId: "test",
  },
};

export const PRESET_LIST: PresetSetup[] = Object.values(PRESETS);

export function getPreset(id: string): PresetSetup | undefined {
  return PRESETS[id];
}
