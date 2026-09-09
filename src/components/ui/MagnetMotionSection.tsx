import { useShallow } from "zustand/shallow";
import { useSimulatorStore } from "../../store/simulatorStore";
import { NumberInput } from "./inputs/NumberInput";

const useAnimationControls = () => {
  const { animation, setAnimationParam } = useSimulatorStore(
    useShallow((s) => ({
      animation: s.animation,
      setAnimationParam: s.setAnimationParam,
    }))
  );
  return { animation, setAnimationParam };
};

export function MagnetMotionSection() {
  const { animation, setAnimationParam } = useAnimationControls();

  const handleChange = <K extends keyof typeof animation>(
    key: K,
    subKey: keyof typeof animation[K],
    value: string | number
  ) => {
    const num = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(num)) return;

    setAnimationParam(
      key,
      // @ts-ignore
      {
        ...animation[key],
        [subKey]: num,
      }
    );
  };

  return (
    <>
      {/* ── Position ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-2">
        <NumberInput
          value={animation.startPosition.x}
          label="Start X (mm)"
          onChange={(v) => handleChange("startPosition", "x", v)}
        />
        <NumberInput
          value={animation.startPosition.y}
          label="Start Y (mm)"
          onChange={(v) => handleChange("startPosition", "y", v)}
        />
        <NumberInput
          value={animation.startPosition.z}
          label="Start Z (mm)"
          onChange={(v) => handleChange("startPosition", "z", v)}
        />
        <NumberInput
          value={animation.endPosition.x}
          label="End X (mm)"
          onChange={(v) => handleChange("endPosition", "x", v)}
        />
        <NumberInput
          value={animation.endPosition.y}
          label="End Y (mm)"
          onChange={(v) => handleChange("endPosition", "y", v)}
        />
        <NumberInput
          value={animation.endPosition.z}
          label="End Z (mm)"
          onChange={(v) => handleChange("endPosition", "z", v)}
        />
      </div>

      {/* ── Rotation ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-2">
        <NumberInput
          value={animation.startRotation.x}
          label="Start Rotation X (deg)"
          onChange={(v) => handleChange("startRotation", "x", v)}
        />
        <NumberInput
          value={animation.startRotation.y}
          label="Start Rotation Y (deg)"
          onChange={(v) => handleChange("startRotation", "y", v)}
        />
        <NumberInput
          value={animation.startRotation.z}
          label="Start Rotation Z (deg)"
          onChange={(v) => handleChange("startRotation", "z", v)}
        />
        <NumberInput
          value={animation.endRotation.x}
          label="End Rotation X (deg)"
          onChange={(v) => handleChange("endRotation", "x", v)}
        />
        <NumberInput
          value={animation.endRotation.y}
          label="End Rotation Y (deg)"
          onChange={(v) => handleChange("endRotation", "y", v)}
        />
        <NumberInput
          value={animation.endRotation.z}
          label="End Rotation Z (deg)"
          onChange={(v) => handleChange("endRotation", "z", v)}
        />
      </div>
    </>
  );
}