import * as THREE from "three";

export interface FieldSample {
  t: number;
  bx: number;
  by: number;
  bz: number;
  btotal: number;
  vout: number;
}

export function computeFieldAt(
  mx: number,
  my: number,
  mz: number,
  peakField: number
): { bx: number; by: number; bz: number; btotal: number; vout: number } {
  const dist = Math.sqrt(mx * mx + my * my + mz * mz);
  const safeDist = Math.max(dist, 0.05);
  const scale = peakField / Math.pow(safeDist + 0.3, 2);

  const nx = mx / safeDist;
  const ny = my / safeDist;
  const nz = mz / safeDist;

  const bx = scale * nx;
  const by = -scale * ny;
  const bz = scale * nz * 0.6;

  const btotal = Math.sqrt(bx * bx + by * by + bz * bz);
  const vout = Math.max(0, Math.min(3.3, 1.65 + by * 0.015));

  return { bx, by, bz, btotal, vout };
}

export function buildDataset(
  startPos: { x: number; y: number; z: number },
  endPos: { x: number; y: number; z: number },
  peakField: number,
  duration: number,
  steps = 120
): FieldSample[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const mx = THREE.MathUtils.lerp(startPos.x, endPos.x, t);
    const my = THREE.MathUtils.lerp(startPos.y, endPos.y, t);
    const mz = THREE.MathUtils.lerp(startPos.z, endPos.z, t);
    const { bx, by, bz, btotal, vout } = computeFieldAt(mx, my, mz, peakField);

    return {
      t: parseFloat((t * duration).toFixed(2)),
      bx: parseFloat(bx.toFixed(1)),
      by: parseFloat(by.toFixed(1)),
      bz: parseFloat(bz.toFixed(1)),
      btotal: parseFloat(btotal.toFixed(1)),
      vout: parseFloat(vout.toFixed(3)),
    };
  });
}