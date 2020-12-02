import {Aseprite} from './aseprite'
import {Millis} from './millis'
import {Rect} from './rect'
import {WH} from './wh'
import {XY} from './xy'

/**
 * All `Animations` and metadata for a sprite sheet.
 *
 * All types are immutably frozen by their parsers. The reason is that this
 * data comes from the sprite sheet and is expected to be unchanging. If you
 * need a mutable copy, create a duplicate instance of the parts that change.
 */
export interface Atlas {
  /** The Aseprite version of the parsed file. E.g., '1.2.8.1'. */
  readonly version: string
  /** The atlas image basename. E.g., 'atlas.png'. */
  readonly filename: string
  /** Atlas image format. E.g., 'RGBA8888' or 'I8'. */
  readonly format: string
  /** Atlas image dimensions (power of 2). */
  readonly size: Readonly<WH>
  readonly animations: Atlas.AnimationRecord
}

export namespace Atlas {
  /** `Animation` look up table. */
  export interface AnimationRecord
    extends Readonly<Record<Aseprite.Tag, Animation>> {}

  /** A sequence of animation `Cel`s. */
  export interface Animation {
    /**
     * Width and height within the source atlas image in integral pixels.
     * Dimensions are identical for every cel.
     */
    readonly size: Readonly<WH>
    /** Every Animation is expected to have at least one Cel. */
    readonly cels: readonly Cel[]
    /**
     * Positive animation length in milliseconds for a full cycle, possibly
     * infinite. For a ping-pong animation, this is a full traversal forward
     * plus the traversal backward excluding the first and last frame. E.g.,
     * in a five cel animation, the total duration would be the sum of the
     * individual durations for the initial five frames and the middle three
     * frames.
     */
    readonly duration: Millis
    readonly direction: Aseprite.Direction
  }

  /** A single frame of an animation sequence. */
  export interface Cel {
    /**
     * Location within the source atlas image in integral pixels from the
     * top-left.
     */
    readonly position: Readonly<XY>
    /** Positive cel exposure in integral milliseconds, possibly infinite. */
    readonly duration: Millis | typeof Number.POSITIVE_INFINITY
    /** Slices within the cel in local pixels. */
    readonly slices: readonly Readonly<Rect>[]
  }
}
