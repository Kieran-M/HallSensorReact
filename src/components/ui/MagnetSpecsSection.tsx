import { useSimulatorStore } from "../../store/simulatorStore";

import { SelectInput } from "./inputs/SelectInput";
import { NumberInput } from "./inputs/NumberInput";

const MATERIAL_OPTIONS = [
  { label: "NdFeB", value: "NdFeB" },
  { label: "SmCo", value: "SmCo" },
  { label: "Ferrite", value: "Ferrite" },
  { label: "AlNiCo", value: "AlNiCo" },
];

const GRADE_OPTIONS = [
  { label: "N35", value: "N35" },
  { label: "N42", value: "N42" },
  { label: "N52", value: "N52" },
];

export function MagnetSpecsSection() {
  const magnet = useSimulatorStore(
    (s) => s.magnet
  );

  const setMagnetParam =
    useSimulatorStore(
      (s) => s.setMagnetParam
    );

  const update =
    <K extends keyof typeof magnet>(
      key: K
    ) =>
    (value: typeof magnet[K]) =>
      setMagnetParam(key, value);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Magnetic Properties */}

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase">
          Magnetic Properties
        </h3>

        <div className="flex flex-col gap-3">
          <NumberInput
            label="Poles"
            value={magnet.poles}
            onChange={update("poles")}
          />

          <SelectInput
            label="Material"
            value={magnet.material}
            options={MATERIAL_OPTIONS}
            onChange={update("material")}
          />

          <SelectInput
            label="Grade"
            value={magnet.materialGrade}
            options={GRADE_OPTIONS}
            onChange={update(
              "materialGrade"
            )}
          />
        </div>
      </div>

      {/* Material Characteristics */}

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase">
          Material Characteristics
        </h3>

        <div className="flex flex-col gap-3">
          <NumberInput
            label="Remanence (T)"
            value={magnet.remanence}
            onChange={update(
              "remanence"
            )}
          />

          <NumberInput
            label="Coercivity (kA/m)"
            value={magnet.coercivity}
            onChange={update(
              "coercivity"
            )}
          />
        </div>
      </div>

      {/* Environmental */}

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase">
          Environmental
        </h3>

        <div className="flex flex-col gap-3">
          <NumberInput
            label="Temperature (°C)"
            value={magnet.temperature}
            onChange={update(
              "temperature"
            )}
          />
        </div>
      </div>
    </div>
  );
}