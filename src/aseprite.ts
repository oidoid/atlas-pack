import { Immutable, U16, XY } from '@/ooz'

/**
 * This typing assumes the options specified in atlas-pack and annotated herein
 * with **via CLI**.
 *
 * The JSON export format appears to be undocumented but the related
 * [binary format] is. Types marked "**by convention**" are supplemental to and
 * unenforced by the JSON format. Any data of these types should be validated as
 * soon as possible.
 *
 * All numbers are integers but typing is loosened so that a cast isn't needed
 * when parsing the Aseprite JSON. All indices are zero-based. All geometry are
 * described in screen coordinates (from the top left to the bottom right) in
 * pixel units.
 *
 * [binary format]: https://github.com/aseprite/aseprite/blob/master/docs/ase-file-specs.md
 */
export namespace Aseprite {
  /**
   * The topmost data type for JSON exported from Aseprite. This format contains
   * all the image and animation information for every file packed in the atlas.
   * **By convention**, every file has one or more animations. Every animation
   * has a `Frame` sequence, a Tag, and zero or more Slices.
   */
  export interface File {
    readonly meta: Meta
    /** All Frames for all files packed. */
    readonly frames: FrameMap
  }

  export interface FrameMap {
    readonly [tagFrameNumber: TagFrameNumber]: Frame
  }

  export interface Meta {
    /** E.g., 'http://www.aseprite.org/'. */
    readonly app: string
    /** E.g., '1.2.8.1'. */
    readonly version: string
    /** The associated output basename. E.g., 'atlas.png'. */
    readonly image: string
    /** E.g., 'RGBA8888' or 'I8'. */
    readonly format: string
    /** Output dimensions. **Via CLI** `--sheet-pack`. */
    readonly size: Readonly<WH<U16 | number>>
    /** E.g., '1'. */
    readonly scale: string
    /** All FrameTags for all files packed **via CLI** `--list-tags`. */
    readonly frameTags: readonly FrameTag[]
    /** All slices for all files packed **via CLI** `--list-slices`. */
    readonly slices: readonly Slice[]
  }

  /**
   * A `Tag` followed by a space followed by a frame number **via CLI**
   * `--filename-format '{tag}.{frame}'`.
   */
  export type TagFrameNumber = string

  export type Tag = string

  /**
   * A single animation frame and the most primitive unit. Each file packed
   * always has at least one `Frame`.
   */
  export interface Frame {
    /**
     * The `Frame`'s bounds within the atlas, including any border padding
     * **via CLI** `--inner-padding n`. The padding dimensions may also be
     * calculated by subtracting member's WH dimensions from sourceSize and
     * dividing by two.
     */
    readonly frame: Readonly<Rect<U16 | number>>
    readonly rotated: boolean
    readonly trimmed: boolean
    /** The `Frame`'s bounds within the file packed, not including padding. */
    readonly spriteSourceSize: Readonly<Rect<U16 | number>>
    /** The width and height components of spriteSourceSize. */
    readonly sourceSize: Readonly<WH<U16 | number>>
    readonly duration: Duration
  }

  /**
   * A label and animation behavior for one or more `Frame`s. When combined with
   * the referenced `Frame`s, an animation is represented.
   */
  export interface FrameTag {
    /** **By convention**, the associated `Frame`'s `Tag`. */
    readonly name: Tag
    /** The inclusive starting Frame index. */
    readonly from: U16 | number
    /**
     * The inclusive ending `Frame` index, possibly identical to the starting
     * frame index.
     */
    readonly to: U16 | number
    readonly direction: Direction | string
  }

  /**
   * Positive animation length in milliseconds. **By convention**, animations
   * that should pause use the special Infinite value.
   */
  export type Duration = U16 | Infinity | number

  /**
   * **By convention**, a reserved value to indicate a value without
   * termination.
   */
  export type Infinity = typeof Infinity
  // deno-lint-ignore no-shadow-restricted-names
  export const Infinity = U16.max

  /**
   * The `Animation` playback orientation: forward, backward, or forward then
   * backward.
   */
  export type Direction = typeof Direction[keyof typeof Direction]
  export const Direction = Immutable(
    {
      /** Animate from start to end; when looping, return to start. */
      Forward: 'forward',
      /** Animate from end to start; when looping, return to end. */
      Reverse: 'reverse',
      /**
       * Animate from start to end - 1 or start, whichever is greater; when
       * looping, change direction (initially, end to start + 1 or end, whichever
       * is lesser. A traversal from start to end - 1 then end to start + 1 is
       * considered a complete loop.
       */
      PingPong: 'pingpong',
    } as const,
  )

  export interface Slice {
    readonly name: Tag
    /** Color in `#rrggbbaa` format. E.g., blue is '#0000ffff'. */
    readonly color: string
    readonly keys: readonly Key[]
  }

  export interface Key {
    /**
     * The inclusive associated `Frame`'s start offset, the exclusive previous
     * `Frame`'s end offset. **By convention,** the exclusive end offset is the
     * next higher `Key.frame` if it exists or the animation's end if not. A
     * `Key`'s `Frame` index may be calculated from
     * `FrameTag.index + Key.frame`.
     */
    readonly frame: U16 | number
    /** The `Slice` dimensions. */
    readonly bounds: Readonly<Rect<U16 | number>>
  }

  export interface Rect<T> extends Readonly<WH<T>>, Readonly<XY<T>> {}

  export interface WH<T> {
    w: T
    h: T
  }
}
