import { create } from "zustand";
import { getPreset } from "../lib/presets";
import { cancelSmoothSeek, syncPlaybackFrame } from "../lib/playbackClock";
import type {
  SensorPackageInfo,
  SimulationFrame,
  SimulationResult,
} from "../types/simulation";
import {
  SHAPE_DEFAULTS,
  type AxialCylinderMagnet,
  type AxialRingMagnet,
  type BarMagnet,
  type BaseMagnetParams,
  type DiametricCylinderMagnet,
  type MagnetParams,
  type MagnetShape,
  type RingMagnet,
  type SphereMagnet,
} from "../types/magnet";
import {
  DEFAULT_HINGE,
  DEFAULT_LINEAR,
  DEFAULT_ROTATE,
  defaultAnimationForType,
  type AnimationParams,
  type HingeMovement,
  type LinearMovement,
  type MotionAxis,
  type MotionType,
  type RotateMovement,
  type SensorPosition,
  type XYZ,
} from "../types/motion";
import { DEFAULT_CAMERA_VIEW, type CameraViewState } from "../types/camera";

export type { SensorPackageInfo, SimulationFrame, SimulationResult };

// Re-exports keep existing `from "../store/simulatorStore"` imports working.
export {
  SHAPE_DEFAULTS,
  DEFAULT_HINGE,
  DEFAULT_LINEAR,
  DEFAULT_ROTATE,
  DEFAULT_CAMERA_VIEW,
  defaultAnimationForType,
};
export type {
  AxialCylinderMagnet,
  AxialRingMagnet,
  BarMagnet,
  BaseMagnetParams,
  DiametricCylinderMagnet,
  MagnetParams,
  MagnetShape,
  RingMagnet,
  SphereMagnet,
  AnimationParams,
  HingeMovement,
  LinearMovement,
  MotionAxis,
  MotionType,
  RotateMovement,
  SensorPosition,
  XYZ,
  CameraViewState,
};

export type SimulatorMode = "edit" | "playback";

export type SimulatorView = "presets" | "design" | "results";

export interface ActivePreset {
  id: string;
  label: string;
}

interface SimulatorStore {
  magnet: MagnetParams;
  animation: AnimationParams;
  cameraView: CameraViewState;
  setCameraView: (view: CameraViewState) => void;
  setMagnetShape: (shape: MagnetShape) => void;
  setMagnetParam: <K extends keyof MagnetParams>(
    key: K,
    value: MagnetParams[K],
  ) => void;

  sensor: SensorPosition;
  sensorPackageId: string;
  setSensorPosition: (sensor: SensorPosition) => void;
  setSensorPackageId: (id: string) => void;

  setAnimation: (animation: AnimationParams) => void;
  setMotionType: (type: MotionType) => void;
  /** Shallow-merge fields onto the active motion; callers must match the current type. */
  patchAnimation: (patch: Partial<AnimationParams>) => void;

  resetMagnet: () => void;

  activePreset: ActivePreset | null;
  applyPreset: (presetId: string) => boolean;

  playing: boolean;
  /** Fractional frame index into simulation.frames (UI/charts; 3D uses playbackFrameRef). */
  currentFrame: number;
  /** Derived display time in seconds: currentFrame / fps. */
  currentTime: number;
  /** Wall-clock multiplier for playback (0.25–2). Does not change sim fps/duration. */
  playbackSpeed: number;
  duration: number;
  fps: number;
  simulation: SimulationResult | null;
  simulating: boolean;
  simulationError: string | null;

  setCurrentFrame: (frame: number) => void;
  /** @deprecated prefer setCurrentFrame — kept for scrubbers that speak in seconds */
  setCurrentTime: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;

  setDuration: (duration: number) => void;
  setSimulating: (simulating: boolean) => void;
  setSimulationError: (error: string | null) => void;
  setSimulationResult: (result: SimulationResult) => void;
  clearFrames: () => void;

  play: () => void;
  pause: () => void;

  mode: SimulatorMode;

  setMode: (mode: SimulatorMode) => void;

  view: SimulatorView;

  setView: (view: SimulatorView) => void;
}

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  magnet: SHAPE_DEFAULTS.axial_cylinder,
  animation: DEFAULT_LINEAR,
  cameraView: DEFAULT_CAMERA_VIEW,
  setCameraView: (cameraView) => set({ cameraView }),
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
    set((state) => ({ magnet: { ...state.magnet, [key]: value } })),

  setAnimation: (animation) => set({ animation }),

  setMotionType: (type) =>
    set((state) => {
      if (state.animation.type === type) return state;
      return { animation: defaultAnimationForType(type), activePreset: null };
    }),

  patchAnimation: (patch) =>
    set((state) => ({
      animation: { ...state.animation, ...patch } as AnimationParams,
      activePreset: null,
    })),

  resetMagnet: () => set({ magnet: SHAPE_DEFAULTS.axial_cylinder }),

  sensor: {
    x: 0,
    y: 0,
    z: 0,
  },
  sensorPackageId: "test",

  setSensorPosition: (sensor) => set({ sensor, activePreset: null }),
  setSensorPackageId: (sensorPackageId) => set({ sensorPackageId }),

  activePreset: null,

  applyPreset: (presetId) => {
    const preset = getPreset(presetId);
    if (!preset) return false;
    set({
      magnet: preset.magnet,
      sensor: preset.sensor,
      animation: preset.animation,
      duration: preset.duration,
      fps: preset.fps,
      sensorPackageId: preset.sensorPackageId,
      activePreset: { id: preset.meta.id, label: preset.meta.label },
      mode: "edit",
      playing: false,
      currentFrame: 0,
      currentTime: 0,
      simulation: null,
      simulationError: null,
      view: "design",
    });
    simulationFramesRef.current = [];
    syncPlaybackFrame(0);
    return true;
  },

  playing: false,

  currentFrame: 0,
  currentTime: 0,
  playbackSpeed: 1,
  duration: 5,
  fps: 60,
  simulation: null,
  simulating: false,
  simulationError: null,

  play: () => {
    cancelSmoothSeek();
    set({ playing: true });
  },

  pause: () => set({ playing: false }),

  setCurrentFrame: (frame) =>
    set((state) => {
      cancelSmoothSeek();
      const fps = state.fps > 0 ? state.fps : 60;
      const last =
        (state.simulation?.frames.length ?? 1) > 0
          ? Math.max((state.simulation?.frames.length ?? 1) - 1, 0)
          : Math.max(Math.round(state.duration * fps) - 1, 0);
      const clamped = Math.min(Math.max(frame, 0), last);
      syncPlaybackFrame(clamped);
      return {
        currentFrame: clamped,
        currentTime: clamped / fps,
      };
    }),

  setCurrentTime: (currentTime) =>
    set((state) => {
      const fps = state.fps > 0 ? state.fps : 60;
      const frame = currentTime * fps;
      const last =
        (state.simulation?.frames.length ?? 1) > 0
          ? Math.max((state.simulation?.frames.length ?? 1) - 1, 0)
          : Math.max(Math.round(state.duration * fps) - 1, 0);
      const clamped = Math.min(Math.max(frame, 0), last);
      syncPlaybackFrame(clamped);
      return {
        currentFrame: clamped,
        currentTime: clamped / fps,
      };
    }),

  setPlaybackSpeed: (playbackSpeed) =>
    set({
      playbackSpeed: Math.min(Math.max(playbackSpeed, 0.1), 4),
    }),

  setDuration: (duration) => set({ duration }),

  mode: "edit",

  setSimulating: (simulating) => set({ simulating }),
  setSimulationError: (simulationError) => set({ simulationError }),
  setSimulationResult: (result) => {
    simulationFramesRef.current = result.frames;
    syncPlaybackFrame(0);
    set({
      simulation: result,
      fps: result.fps,
      duration: result.duration,
      currentFrame: 0,
      currentTime: 0,
      mode: "playback",
      view: "results",
      simulating: false,
      simulationError: null,
    });
  },
  clearFrames: () => {
    simulationFramesRef.current = [];
    syncPlaybackFrame(0);
    set({ simulation: null, currentFrame: 0, currentTime: 0 });
  },

  setMode: (mode) => set({ mode }),

  view: "presets",

  setView(view) {
    set({ view });
  },
}));

/**
 * Mirror of `simulation.frames` for useFrame without subscribing every mesh
 * to the store. Always update this together with `setSimulationResult` /
 * `clearFrames` / `applyPreset`.
 */
export const simulationFramesRef = { current: [] as SimulationFrame[] };
