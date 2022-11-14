import { Immutable, U16, U16Box, U16Millis, U16XY } from '@/oidlib';

/** A sequence of animation `Cel`s. */
export interface Anim {
  /**
   * The Aseprite tag, a unique identifier for the animation like "FrogIdle".
   */
  readonly id: string;

  /**
   * Width and height within the source atlas image in integral pixels.
   * Dimensions are identical for every cel.
   */
  readonly wh: Readonly<U16XY>;

  /** Every animation is expected to have at least one Cel. */
  readonly cels: readonly Cel[];

  /**
   * Positive animation length in milliseconds for a full cycle, possibly
   * infinite. For a ping-pong animation, this is a full traversal forward
   * plus the traversal backward excluding the first and last frame. Eg, in a
   * five cel animation, the total duration would be the sum of the individual
   * durations for the initial five frames and the middle three frames.
   */
  readonly duration: U16Millis | typeof Number.POSITIVE_INFINITY;

  readonly direction: Playback;
}

/** A single frame of an animation sequence. */
export interface Cel {
  readonly id: CelID;

  /**
   * Location and area within the source atlas image in integral pixels from
   * the top-left. The width and height duplicate the owning animation's size
   * and are for convenience only. Sizes does not vary from animation.
   */
  readonly bounds: Readonly<U16Box>;

  /** Positive cel exposure in integral milliseconds, possibly infinite. */
  readonly duration: U16Millis | typeof Number.POSITIVE_INFINITY;

  /**
   * The union of all slices. If a point is not in sliceBounds, it's not in
   * slices. Slice bounds are a subset of bounds and a superset of slices, may
   * vary cel-to-cel, and are flipped when no slices.
   */
  readonly sliceBounds: Readonly<U16Box>;

  /** Slices within the cel in local pixels. Slices may vary cel-to-cel. */
  readonly slices: readonly Readonly<U16Box>[];
}

/** A unique identifier for the cel, contiguous and starting at 0. */
export type CelID = U16 & { [celID]: never };
declare const celID: unique symbol;

export type Playback = Parameters<typeof Playback.values['has']>[0];
export namespace Playback {
  export const values = Immutable(
    new Set(
      [
        /** Animate from start to end; when looping, return to start. */
        'Forward',

        /** Animate from end to start; when looping, return to end. */
        'Reverse',

        /**
         * Animate from start to end - 1 or start, whichever is greater; when
         * looping, change direction (initially, end to start + 1 or end, whichever
         * is lesser. A traversal from start to end - 1 then end to start + 1 is
         * considered a complete loop.
         */
        'PingPong',
      ] as const,
    ),
  );
}
