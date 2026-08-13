export interface SimulationFrame {
  position: [number, number, number];
  rotation: [number, number, number];

  bx: number;
  by: number;
  bz: number;
}

export interface SimulationResult {
  fps: number;
  duration: number;
  frames: SimulationFrame[];
}