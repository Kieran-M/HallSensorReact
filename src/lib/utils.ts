export function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const MM_TO_WORLD = 0.001;

export const DISPLAY_SCALE = MM_TO_WORLD;

export const mmToWorld = (mm: number) => mm * MM_TO_WORLD;

export const worldToMm = (world: number) => world / MM_TO_WORLD;

export const positionMmToWorld = (pos: {
  x: number;
  y: number;
  z: number;
}) => ({
  x: mmToWorld(pos.x),
  y: mmToWorld(pos.y),
  z: mmToWorld(pos.z),
});

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};