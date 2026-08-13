import type { Vector3D, Magnet, FieldSample } from "../types";

const MU0 = 4 * Math.PI * 1e-7;

export function fieldAtPoint(point: Vector3D, magnet: Magnet): Vector3D {
  const dx = point.x - magnet.position.x;
  const dy = point.y - magnet.position.y;
  const dz = point.z - magnet.position.z;

  const r2 = dx ** 2 + dy ** 2 + dz ** 2;
  if (r2 < 1e-10) return { x: 0, y: 0, z: 0 };

  const r = Math.sqrt(r2);
  const r3 = r2 * r;
  const r5 = r3 * r2;

  const mx = magnet.moment.x * magnet.strength;
  const my = magnet.moment.y * magnet.strength;
  const mz = magnet.moment.z * magnet.strength;

  const mDotR = mx * dx + my * dy + mz * dz;
  const scale = MU0 / (4 * Math.PI);

  return {
    x: scale * ((3 * mDotR * dx) / r5 - mx / r3),
    y: scale * ((3 * mDotR * dy) / r5 - my / r3),
    z: scale * ((3 * mDotR * dz) / r5 - mz / r3),
  };
}

export function totalFieldAtPoint(
  point: Vector3D,
  magnets: Magnet[]
): Vector3D {
  return magnets.reduce(
    (acc, magnet) => {
      const b = fieldAtPoint(point, magnet);
      return { x: acc.x + b.x, y: acc.y + b.y, z: acc.z + b.z };
    },
    { x: 0, y: 0, z: 0 }
  );
}

export function magnitude(v: Vector3D): number {
  return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
}

export function normalise(v: Vector3D): Vector3D {
  const m = magnitude(v);
  if (m === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}

export function calculateFieldGrid(
  magnets: Magnet[],
  gridSize: number,
  extent: number
): FieldSample[] {
  const samples: FieldSample[] = [];
  const step = (extent * 2) / gridSize;

  for (let ix = 0; ix < gridSize; ix++) {
    for (let iy = 0; iy < gridSize; iy++) {
      for (let iz = 0; iz < gridSize; iz++) {
        const position: Vector3D = {
          x: -extent + ix * step,
          y: -extent + iy * step,
          z: -extent + iz * step,
        };

        const field = totalFieldAtPoint(position, magnets);

        samples.push({
          position,
          field,
          magnitude: magnitude(field),
        });
      }
    }
  }

  return samples;
}