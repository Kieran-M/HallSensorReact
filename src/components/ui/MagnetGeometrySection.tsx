import { useSimulatorStore } from "../../store/simulatorStore";
import { SelectInput } from "./inputs/SelectInput";
import { NumberInput } from "./inputs/NumberInput";
import type { MagnetShape } from "../../store/simulatorStore";

const SHAPE_OPTIONS = [
  { label: "Bar", value: "bar" },
  { label: "Diametric Cylinder", value: "diametric_cylinder" },
  { label: "Axial Cylinder", value: "axial_cylinder" },
  { label: "Diametric Ring", value: "ring" },
  { label: "Axial Ring", value: "axial_ring" },
  { label: "Sphere", value: "sphere" },
];

export function MagnetGeometrySection() {
  const { magnet, setMagnetShape } = useSimulatorStore();

  return (
    <div className="flex flex-col gap-4 p-2">
      <SelectInput
        label="Shape"
        value={magnet.shape}
        onChange={(v: MagnetShape) => setMagnetShape(v)}
        options={SHAPE_OPTIONS}
      />
      <ShapeInputs />
    </div>
  );
}

function ShapeInputs() {
  const { magnet, setMagnetParam } = useSimulatorStore();

  switch (magnet.shape) {
    case "bar":
      return (
        <>
          <NumberInput
            label="Length (mm)"
            value={magnet.length}
            onChange={(v: number) => setMagnetParam("length", v)}
          />
          <NumberInput
            label="Width (mm)"
            value={magnet.width}
            onChange={(v: number) => setMagnetParam("width", v)}
          />
          <NumberInput
            label="Height (mm)"
            value={magnet.height}
            onChange={(v: number) => setMagnetParam("height", v)}
          />
        </>
      );
    case "diametric_cylinder":
    case "axial_cylinder":
      return (
        <>
          <NumberInput
            label="Outer Diameter (mm)"
            value={magnet.outerDiameter}
            onChange={(v: number) => setMagnetParam("outerDiameter", v)}
          />
          <NumberInput
            label="Height (mm)"
            value={magnet.height}
            onChange={(v: number) => setMagnetParam("height", v)}
          />
        </>
      );
    case "ring":
    case "axial_ring":
      return (
        <>
          <NumberInput
            label="Outer Diameter (mm)"
            value={magnet.outerDiameter}
            onChange={(v) => setMagnetParam("outerDiameter", v)}
          />
          <NumberInput
            label="Inner Diameter (mm)"
            value={magnet.innerDiameter}
            onChange={(v) => setMagnetParam("innerDiameter", v)}
          />
          <NumberInput
            label="Height (mm)"
            value={magnet.height}
            onChange={(v) => setMagnetParam("height", v)}
          />
        </>
      );
    case "sphere":
      return (
        <NumberInput
          label="Diameter (mm)"
          value={magnet.diameter}
          onChange={(v) => setMagnetParam("diameter", v)}
        />
      );
  }
}