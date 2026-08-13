export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Magnet {
  id: string;
  label: string;
  position: Vector3D;
  rotation: Vector3D;
  moment: Vector3D;
  strength: number; // in Tesla
  dimensions: Vector3D; // physical size for the mesh
}

export interface HallSensor {
  id: string;
  label: string;
  position: Vector3D;
  rotation: Vector3D;
}

export interface FieldSample {
  position: Vector3D;
  field: Vector3D; // Bx, By, Bz
  magnitude: number;
}

export interface SimulatorSetup {
  id?: string;
  label: string;
  magnets: Magnet[];
  sensors: HallSensor[];
  gridSize: number;
  gridExtent: number;
  createdAt?: string;
  updatedAt?: string;
}