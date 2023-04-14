import { AsepriteFileTag } from '@/atlas-pack'
import { Box, PartialBox, PartialXY, XY } from '@/ooz'

/**
 * A sequence of animation cels.
 *
 * Films advance at a frequency determined by their cels. Ideally, cels share a
 * high duration factor to avoid duplicate spacer cels.
 *
 * An Aseprite file often contains multiple films (animations) but atlas-pack
 * treats them as independent. Animators, for example, only consider one film at
 * a time; there is no "next" film to automatically play when one finishes.
 *
 * "Film" terminology is user over "animation" to avoid conflict with the
 * `Animation` global.
 */
export interface Film {
  /**
   * The Aseprite tag, a unique identifier for the film like "Frog--Idle".
   *
   * This ID matches a key in `AtlasMeta.filmsByID` but the typing isn't used
   * here because it adds a lot of templating overhead without much value.
   */
  readonly id: AsepriteFileTag

  /**
   * Positive film length in milliseconds for a full cycle. For a ping-pong
   * film, this is a full traversal forward plus the traversal backward
   * excluding the first and last frame. Eg, in a five cel animation, the total
   * duration would be the sum of the individual durations for the initial five
   * frames and the middle three frames.
   *
   * This is a number, not a number, since its an aggregation of numbers.
   */
  readonly duration: number

  /**
   * Width and height within the source atlas image in integral pixels.
   * Dimensions are identical for every cel.
   */
  readonly wh: Readonly<XY>

  /** Every film is expected to have at least one cel. */
  readonly cels: readonly Cel[]

  /** The union of all slices of all cels. */
  readonly sliceBounds: Readonly<Box>

  /**
   * The length of time before the cel may change. This is the inverse of
   * frequency, or cels per second, and is the greatest common multiple of cel
   * durations. No consideration for number of loops is made.
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
   */
  readonly period: number

  readonly direction: Playback

  /** The number of times to play the animation, possibly infinite. */
  readonly loops: number | typeof Number.POSITIVE_INFINITY
}

/** A single animation frame of a film. */
export interface Cel {
  readonly id: CelID

  /**
   * Location and area within the source atlas image in integral pixels from
   * the top-left. The width and height duplicate the owning film's size and are
   * for convenience only. Sizes never vary within a film.
   */
  readonly bounds: Readonly<Box>

  /**
   * Positive cel exposure requirement in integral milliseconds.
   *
   * Aseprite uses number durations but `Film` has an aggregation so it must use
   * a number.
   */
  readonly duration: number

  /**
   * The union of all slices. If a point is not in sliceBounds, it's not in
   * slices. Slice bounds are a subset of bounds and a superset of slices, may
   * vary cel-to-cel, and are flipped when no slices.
   */
  readonly sliceBounds: Readonly<Box>

  /** Slices within the cel in local pixels. Slices may vary cel-to-cel. */
  readonly slices: readonly Readonly<Box>[]
}

/** A unique identifier for the cel, contiguous and starting at 0. */
export type CelID = number & { [celID]: never }
declare const celID: unique symbol

export type Playback = Parameters<typeof PlaybackSet['has']>[0]
export const PlaybackSet = new Set(
  [
    /** Animate from start to end; when looping, return to start. */
    'Forward',

    /** Animate from end to start; when looping, return to end. */
    'Reverse',

    /**
     * Animate from start to end - 1 or start, whichever is greater; when
     * looping, change direction (initially, end to start + 1 or end,
     * whichever is lesser. A traversal from start to end - 1 then end to
     * start + 1 is considered a complete loop.
     */
    'PingPong',

    /**
     * Like PingPong but start from end - 1 or start, whichever is greater.
     */
    'PingPongReverse',
  ] as const,
)

export interface FilmJSON {
  readonly id: string
  readonly duration: number
  readonly wh: Readonly<PartialXY>
  readonly cels: readonly CelJSON[]
  readonly sliceBounds: Readonly<PartialBox>
  readonly period: number
  readonly direction: string
  readonly loops?: number | null
}

export interface CelJSON {
  readonly id: number
  readonly bounds: Readonly<PartialBox>
  readonly duration: number
  readonly sliceBounds: Readonly<PartialBox>
  readonly slices: readonly Readonly<PartialBox>[]
}
