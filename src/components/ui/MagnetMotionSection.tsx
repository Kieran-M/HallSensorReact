import { useSimulatorStore } from "../../store/simulatorStore";
import { NumberInput } from "./inputs/NumberInput";

export function MagnetMotionSection() {
  const { animation, setAnimationParam } = useSimulatorStore();

  return (
    <>
      <div className="flex flex-col gap-4 p-2">
        <NumberInput value={animation.startPosition.x} label="Start X (mm)" onChange={(v) => setAnimationParam("startPosition", { ...animation.startPosition, x: v })} />
        <NumberInput value={animation.startPosition.y} label="Start Y (mm)" onChange={(v) => setAnimationParam("startPosition", { ...animation.startPosition, y: v })} />
        <NumberInput value={animation.startPosition.z} label="Start Z (mm)" onChange={(v) => setAnimationParam("startPosition", { ...animation.startPosition, z: v })} />
        <NumberInput value={animation.endPosition.x} label="End X (mm)" onChange={(v) => setAnimationParam("endPosition", { ...animation.endPosition, x: v })} />
        <NumberInput value={animation.endPosition.y} label="End Y (mm)" onChange={(v) => setAnimationParam("endPosition", { ...animation.endPosition, y: v })} />
        <NumberInput value={animation.endPosition.z} label="End Z (mm)" onChange={(v) => setAnimationParam("endPosition", { ...animation.endPosition, z: v })} />
      </div>
      <div className="flex flex-col gap-4 p-2">
        <NumberInput value={animation.startRotation.x} label="Start Rotation X (deg)" onChange={(v) => setAnimationParam("startRotation", { ...animation.startRotation, x: v })} />
        <NumberInput value={animation.startRotation.y} label="Start Rotation Y (deg)" onChange={(v) => setAnimationParam("startRotation", { ...animation.startRotation, y: v })} />
        <NumberInput value={animation.startRotation.z} label="Start Rotation Z (deg)" onChange={(v) => setAnimationParam("startRotation", { ...animation.startRotation, z: v })} />
        <NumberInput value={animation.endRotation.x} label="End Rotation X (deg)" onChange={(v) => setAnimationParam("endRotation", { ...animation.endRotation, x: v })} />
        <NumberInput value={animation.endRotation.y} label="End Rotation Y (deg)" onChange={(v) => setAnimationParam("endRotation", { ...animation.endRotation, y: v })} />
        <NumberInput value={animation.endRotation.z} label="End Rotation Z (deg)" onChange={(v) => setAnimationParam("endRotation", { ...animation.endRotation, z: v })} />
      </div>
    </>
  );
}