export function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const DISPLAY_SCALE = 0.01;

export const mmToWorld = (mm: number) => mm * DISPLAY_SCALE;

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};