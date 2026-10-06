import type {
  AnimationParams,
  MotionAxis,
  MotionType,
  XYZ,
} from '../../../types/motion'
import { NumberInput } from '../inputs/NumberInput'
import { SelectInput } from '../inputs/SelectInput'
import { AXES, MOTION_TYPES } from './options'
import { XYZGroup } from './XYZGroup'

function patchXYZ(
  current: XYZ,
  key: keyof XYZ,
  value: number,
): XYZ {
  return { ...current, [key]: value }
}

export function MotionFields({
  animation,
  setMotionType,
  patchAnimation,
}: {
  animation: AnimationParams
  setMotionType: (type: MotionType) => void
  patchAnimation: (patch: Partial<AnimationParams>) => void
}) {
  return (
    <>
      <SelectInput<MotionType>
        label="Motion Type"
        value={animation.type}
        options={MOTION_TYPES}
        onChange={setMotionType}
      />

      {animation.type === 'linear' && (
        <>
          <XYZGroup
            label="Start Position"
            xVal={animation.startPosition.x}
            yVal={animation.startPosition.y}
            zVal={animation.startPosition.z}
            onX={(x) =>
              patchAnimation({
                startPosition: patchXYZ(animation.startPosition, 'x', x),
              })
            }
            onY={(y) =>
              patchAnimation({
                startPosition: patchXYZ(animation.startPosition, 'y', y),
              })
            }
            onZ={(z) =>
              patchAnimation({
                startPosition: patchXYZ(animation.startPosition, 'z', z),
              })
            }
            min={-1000}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <XYZGroup
            label="End Position"
            xVal={animation.endPosition.x}
            yVal={animation.endPosition.y}
            zVal={animation.endPosition.z}
            onX={(x) =>
              patchAnimation({
                endPosition: patchXYZ(animation.endPosition, 'x', x),
              })
            }
            onY={(y) =>
              patchAnimation({
                endPosition: patchXYZ(animation.endPosition, 'y', y),
              })
            }
            onZ={(z) =>
              patchAnimation({
                endPosition: patchXYZ(animation.endPosition, 'z', z),
              })
            }
            min={-1000}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <XYZGroup
            label="Start Angle"
            xVal={animation.startRotation.x}
            yVal={animation.startRotation.y}
            zVal={animation.startRotation.z}
            onX={(x) =>
              patchAnimation({
                startRotation: patchXYZ(animation.startRotation, 'x', x),
              })
            }
            onY={(y) =>
              patchAnimation({
                startRotation: patchXYZ(animation.startRotation, 'y', y),
              })
            }
            onZ={(z) =>
              patchAnimation({
                startRotation: patchXYZ(animation.startRotation, 'z', z),
              })
            }
            min={-360}
            max={360}
            step={1}
            unit="°"
          />
          <XYZGroup
            label="End Angle"
            xVal={animation.endRotation.x}
            yVal={animation.endRotation.y}
            zVal={animation.endRotation.z}
            onX={(x) =>
              patchAnimation({
                endRotation: patchXYZ(animation.endRotation, 'x', x),
              })
            }
            onY={(y) =>
              patchAnimation({
                endRotation: patchXYZ(animation.endRotation, 'y', y),
              })
            }
            onZ={(z) =>
              patchAnimation({
                endRotation: patchXYZ(animation.endRotation, 'z', z),
              })
            }
            min={-360}
            max={360}
            step={1}
            unit="°"
          />
        </>
      )}

      {animation.type === 'rotate' && (
        <>
          <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
            Magnet spins in place about a world axis. Use 0→360° for a full turn
            (angle encoding).
          </p>
          <XYZGroup
            label="Centre Position"
            xVal={animation.position.x}
            yVal={animation.position.y}
            zVal={animation.position.z}
            onX={(x) =>
              patchAnimation({
                position: patchXYZ(animation.position, 'x', x),
              })
            }
            onY={(y) =>
              patchAnimation({
                position: patchXYZ(animation.position, 'y', y),
              })
            }
            onZ={(z) =>
              patchAnimation({
                position: patchXYZ(animation.position, 'z', z),
              })
            }
            min={-1000}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <SelectInput<MotionAxis>
            label="Axis"
            value={animation.axis}
            options={AXES}
            onChange={(axis) => patchAnimation({ axis })}
          />
          <NumberInput
            label="Start Angle"
            value={animation.startAngle}
            onChange={(startAngle) => patchAnimation({ startAngle })}
            min={-720}
            max={720}
            step={1}
            unit="°"
          />
          <NumberInput
            label="End Angle"
            value={animation.endAngle}
            onChange={(endAngle) => patchAnimation({ endAngle })}
            min={-720}
            max={720}
            step={1}
            unit="°"
          />
        </>
      )}

      {animation.type === 'hinge' && (
        <>
          <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
            Lid / door swing: magnet rides an arc about a pivot. At 0° the magnet
            sits arm-length along +X from the pivot (or +Y if axis is X).
          </p>
          <XYZGroup
            label="Hinge Pivot"
            xVal={animation.pivot.x}
            yVal={animation.pivot.y}
            zVal={animation.pivot.z}
            onX={(x) =>
              patchAnimation({ pivot: patchXYZ(animation.pivot, 'x', x) })
            }
            onY={(y) =>
              patchAnimation({ pivot: patchXYZ(animation.pivot, 'y', y) })
            }
            onZ={(z) =>
              patchAnimation({ pivot: patchXYZ(animation.pivot, 'z', z) })
            }
            min={-1000}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <SelectInput<MotionAxis>
            label="Hinge Axis"
            value={animation.axis}
            options={AXES}
            onChange={(axis) => patchAnimation({ axis })}
          />
          <NumberInput
            label="Arm Length"
            value={animation.armLength}
            onChange={(armLength) => patchAnimation({ armLength })}
            min={0.1}
            max={1000}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Start Angle"
            value={animation.startAngle}
            onChange={(startAngle) => patchAnimation({ startAngle })}
            min={-180}
            max={180}
            step={1}
            unit="°"
          />
          <NumberInput
            label="End Angle"
            value={animation.endAngle}
            onChange={(endAngle) => patchAnimation({ endAngle })}
            min={-180}
            max={180}
            step={1}
            unit="°"
          />
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
              Bounce
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={animation.bounce}
              onClick={() => patchAnimation({ bounce: !animation.bounce })}
              className={[
                'relative h-5 w-9 rounded-full border transition-colors',
                animation.bounce
                  ? 'bg-[var(--accent)] border-[var(--accent)]'
                  : 'bg-[var(--muted)] border-[var(--border)]',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 h-3.5 w-3.5 rounded-full bg-[var(--accent-foreground)] transition-transform',
                  animation.bounce ? 'left-[18px]' : 'left-0.5',
                ].join(' ')}
                style={
                  animation.bounce
                    ? undefined
                    : { backgroundColor: 'var(--muted-foreground)' }
                }
              />
            </button>
          </label>
          <p className="font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
            {animation.bounce
              ? 'On: path goes start → end → start over the duration.'
              : 'Off: one-way swing from start to end.'}
          </p>
        </>
      )}
    </>
  )
}
