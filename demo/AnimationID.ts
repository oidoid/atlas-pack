import { Immutable } from '@/oidlib';

/**
 * The Atlas.Animation identifier for all Animations in the Atlas. IDs are used
 * to reference immutable image source properties, such as dimensions and
 * animation duration, from the Atlas. The tag convention used here is
 * <file stem>-<state or variant or ancillary image>.
 */
export type AnimationID = Parameters<typeof AnimationID.values['has']>[0];

export namespace AnimationID {
  export const values = Immutable(
    new Set(
      [
        'FrogEat',
        'FrogIdle',
        'BackpackerWalkRight',
        'BackpackerWalkDown',
        'BackpackerWalkUp',
      ] as const,
    ),
  );
}
