import {Aseprite} from './Aseprite'
import {Milliseconds} from './Milliseconds'
import {Rect} from './Rect'
import {WH} from './WH'
import {XY} from './XY'

/** All types are immutably frozen by their parsers. The reason is that this
    data comes from the sprite sheet and is expected to be unchanging. If you
    need a mutable copy, create a duplicate instance of the parts that
    change. */
export interface Atlas {
  /** The Aseprite version of the parsed file. */
  readonly version: string
  readonly animations: Atlas.AnimationRecord
}

export namespace Atlas {
  export interface AnimationRecord
    extends Readonly<Record<Aseprite.Tag, Atlas.Animation>> {}

  /** A sequence of animation cels. */
  export interface Animation {
    /** Width and height within the source atlas image in integral pixels.
        Dimensions are identical for every cel. */
    readonly size: Readonly<WH>
    readonly cels: readonly Cel[]
    /** Positive animation length in milliseconds for a full cycle, possibly
        infinite. For a ping-pong animation, this is a full traversal forward
        plus the traversal backward excluding the first and last frame. E.g.,
        in a five cel animation, the total duration would be the sum of the
        individual durations for the initial five frames and the middle three
        frames. */
    readonly duration: Milliseconds
    readonly direction: Aseprite.AnimationDirection
  }

  /** A single frame of an animation sequence. */
  export interface Cel {
    /** Location within the source atlas image in integral pixels from the
        top-left. */
    readonly position: Readonly<XY>
    /** Positive cel exposure in integral milliseconds, possibly infinite. */
    readonly duration: Milliseconds
    /** Slices within the cel in local pixels. */
    readonly slices: readonly Rect[]
  }
}
