import { Immutable, U16, U16Box, U16XY, U32Millis } from '@/oidlib';

/** A reserved value to indicate endless time. */
export type InfiniteDuration = typeof InfiniteDuration;
export const InfiniteDuration = U32Millis.max;

/**
 * A sequence of animation cels.
 *
 * Films advance at a frequency determined by their cels. Ideally, cels share a
 * high duration factor to avoid duplicate spacer cels.
 *
 * "Film" terminology is user over "animation" to avoid conflict with the
 * `Animation` global.
 */
export interface Film {
  /**
   * The Aseprite tag, a unique identifier for the film like "FrogIdle".
   *
   * This ID matches a key in `AtlasMeta.filmsByID` but the typing isn't used
   * here because it adds a lot of templating overhead without much value.
   */
  readonly id: string;

  /**
   * Positive film length in milliseconds for a full cycle, possibly infinite.
   * For a ping-pong film, this is a full traversal forward plus the traversal
   * backward excluding the first and last frame. Eg, in a five cel animation,
   * the total duration would be the sum of the individual durations for the
   * initial five frames and the middle three frames.
   *
   * This is a U32, not a U16, since its an aggregation of U16s.
   */
  readonly duration: U32Millis | InfiniteDuration;

  /**
   * Width and height within the source atlas image in integral pixels.
   * Dimensions are identical for every cel.
   */
  readonly wh: Readonly<U16XY>;

  /** Every film is expected to have at least one cel. */
  readonly cels: readonly Cel[];

  /**
   * The length of time before the cel may change, possibly infinite. This is
   * the inverse of frequency, or cels per second, and is the greatest common
   * multiple of cel durations, excluding infinite durations.
   *
   * Cels are duplicated by reference as needed by the parser to support a
   * uniform frequency.
   *
   * Eg, consider an animation with three cels:
   *
   *   Duration  Active        Cel Index
   *   100 ms      0 -  99 ms  0
   *   400 ms    100 - 499 ms  1
   *   200 ms    500 - 699 ms  2
   *
   * The greatest common multiple of durations is 100 ms. That is, the animation
   * changes cels at a maximum frequency of once every 100 ms (1 / 100 ms) and
   * the period is the inverse (100 ms). The total duration is 700 ms.
   *
   *   total periods = frequency * total duration
   *                 = (1 / 100 ms) * 700 ms
   *                 = 7
   *
   * Time is mapped to a period via trunc(time * frequency).
   *
   * Infinite durations are ignored for multi-cel animation greatest common
   * multiple computations. The period of single cel animations is the duration
   * of the cel.
   *
   * The same example with an additional infinite duration cel:
   *
   *   Duration  Time Window   Cel Index
   *   100 ms      0 -  99 ms  0
   *   400 ms    100 - 499 ms  1
   *   200 ms    500 - 699 ms  2
   *     ∞ ms    700 -   ∞ ms  3
   *
   * The period is still 100 ms since infinite durations only appear in the last
   * cel and are treated specially.
   */
  readonly period: U32Millis | InfiniteDuration;

  readonly direction: Playback;
}

/** A single animation frame of a film. */
export interface Cel {
  readonly id: CelID;

  /**
   * Location and area within the source atlas image in integral pixels from
   * the top-left. The width and height duplicate the owning film's size and are
   * for convenience only. Sizes never vary.
   */
  readonly bounds: Readonly<U16Box>;

  /**
   * Positive cel exposure requirement in integral milliseconds, possibly
   * infinite.
   *
   * Aseprite uses U16 durations but `Film` has an aggregation so it must use
   * a U32. However, that means that `Cel.duration` and `Film.duration` must
   * agree on a definition of infinity that cannot be accidentally summed to.
   */
  readonly duration: U32Millis | InfiniteDuration;

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
        /**
         * Animate from start to end; when looping, return to start. Supports an
         * infinite duration in the last cel.
         */
        'Forward',

        /**
         * Animate from end to start; when looping, return to end. Supports an
         * infinite duration in the first cel.
         */
        'Reverse',

        /**
         * Animate from start to end - 1 or start, whichever is greater; when
         * looping, change direction (initially, end to start + 1 or end,
         * whichever is lesser. A traversal from start to end - 1 then end to
         * start + 1 is considered a complete loop. Does not support infinite
         * duration cels.
         */
        'PingPong',
      ] as const,
    ),
  );
}
