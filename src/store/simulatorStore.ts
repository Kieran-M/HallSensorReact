import { create } from "zustand";

interface BaseMagnetParams {
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

export interface AnimationParams {
  startPosition: { x: number; y: number; z: number };
  endPosition: { x: number; y: number; z: number };

  startRotation: { x: number; y: number; z: number };
  endRotation: { x: number; y: number; z: number };
}

export interface SimulationFrame {
  position: [number, number, number];
  rotation: [number, number, number];

  bx: number;
  by: number;
  bz: number;
}

export type SimulatorMode = "edit" | "playback";

export type SimulatorView = "design" | "results";

interface SimulatorStore {
  magnet: MagnetParams;
  animation: AnimationParams;
  setMagnetShape: (shape: MagnetShape) => void;
  setMagnetParam: (key: string, value: number | string) => void;

  setAnimationParam: <K extends keyof AnimationParams>(
    key: K,
    value: AnimationParams[K],
  ) => void;

  resetMagnet: () => void;

  playing: boolean;
  currentTime: number;
  duration: number;

  setCurrentTime: (time: number) => void;

  setDuration: (duration: number) => void;

  play: () => void;
  pause: () => void;

  //setFrame: (frame: number) => void;

  mode: SimulatorMode;

  simulationFrames: SimulationFrame[];

  setSimulationFrames: (frames: SimulationFrame[]) => void;

  setMode: (mode: SimulatorMode) => void;

  view: SimulatorView;

  setView: (view: SimulatorView) => void;
}

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  magnet: SHAPE_DEFAULTS.axial_cylinder,
  animation: {
    startPosition: { x: 0, y: 0, z: -50 },
    endPosition: { x: 0, y: 0, z: 50 },
    startRotation: { x: 0, y: 0, z: 0 },
    endRotation: { x: 0, y: 0, z: 0 },
  },
  setMagnetShape: (shape) =>
    set((state) => ({
      magnet: {
        ...SHAPE_DEFAULTS[shape],
        poles: state.magnet.poles,
        material: state.magnet.material,
        materialGrade: state.magnet.materialGrade,
        remanence: state.magnet.remanence,
        temperature: state.magnet.temperature,
        tempCoefficient: state.magnet.tempCoefficient,
        coercivity: state.magnet.coercivity,
      },
    })),

  setMagnetParam: (key, value) =>
    set((state) => ({
      magnet: {
        ...state.magnet,
        [key]: value,
      } as MagnetParams,
    })),

  setAnimationParam: (key, value) =>
    set((state) => ({ animation: { ...state.animation, [key]: value } })),

  resetMagnet: () => set({ magnet: SHAPE_DEFAULTS.axial_cylinder }),

  playing: false,

  currentTime: 0,
  duration: 5,

  play: () => set({ playing: true }),

  pause: () => set({ playing: false }),

  setCurrentTime: (currentTime) => set({ currentTime }),

  setDuration: (duration) => set({ duration }),

  mode: "edit",

  simulationFrames: [],

  setSimulationFrames: (frames) => set({ simulationFrames: frames }),

  setMode: (mode) => set({ mode }),

  view: "design",

  setView(view) {
    set({ view });
  },
}));
