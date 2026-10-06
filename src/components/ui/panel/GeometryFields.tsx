import type { MagnetParams } from '../../../types/magnet'
import { NumberInput } from '../inputs/NumberInput'

// ── Geometry fields by shape ──────────────────────────────────────────────────

export function GeometryFields({
  magnet,
  setMagnetParam,
}: {
  magnet: MagnetParams
  setMagnetParam: <K extends keyof MagnetParams>(
    key: K,
    value: MagnetParams[K],
  ) => void
}) {
  // Helper: cast key/value — safe because we only call within the correct case
  const p =
    <K extends keyof MagnetParams>(key: K) =>
    (v: number) =>
      setMagnetParam(key, v as MagnetParams[K])

  switch (magnet.shape) {
    case 'diametric_cylinder':
    case 'axial_cylinder':
      return (
        <>
          <NumberInput
            label="Outer Diameter"
            value={magnet.outerDiameter}
            onChange={p('outerDiameter' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Height"
            value={magnet.height}
            onChange={p('height' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
        </>
      )
    case 'ring':
    case 'axial_ring':
      return (
        <>
          <NumberInput
            label="Outer Diameter"
            value={magnet.outerDiameter}
            onChange={p('outerDiameter' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Inner Diameter"
            value={magnet.innerDiameter}
            onChange={p('innerDiameter' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Height"
            value={magnet.height}
            onChange={p('height' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
        </>
      )
    case 'bar':
      return (
        <>
          <NumberInput
            label="Length"
            value={magnet.length}
            onChange={p('length' as keyof MagnetParams)}
            min={0.01}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Width"
            value={magnet.width}
            onChange={p('width' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Height"
            value={magnet.height}
            onChange={p('height' as keyof MagnetParams)}
            min={0.01}
            max={500}
            step={0.1}
            unit="mm"
          />
        </>
      )
    case 'sphere':
      return (
        <NumberInput
          label="Diameter"
          value={magnet.diameter}
          onChange={p('diameter' as keyof MagnetParams)}
          min={0.01}
          max={500}
          step={0.1}
          unit="mm"
        />
      )
  }
}
