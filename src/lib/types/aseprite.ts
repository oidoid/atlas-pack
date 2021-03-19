import type {Int} from './int.js'
import type {Millis} from './millis.js'
import type {Rect} from './rect.js'
import type {WH} from './wh.js'

/**
 * This typing assumes the options specified in aseprite-atlas-pack and
 * annotated herein with **via CLI**. The JSON export format appears to be
 * undocumented but the related [binary format] is. Types marked
 * "**by convention**" are supplemental to and unenforced by the JSON format.
 * Any data of these types should be validated as soon as possible. All numbers
 * are integers. All indices are zero-based. All geometry are described from
 * the top left to the bottom right in pixel units.
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
  export type File = Readonly<{
    meta: Meta
    /** All Frames for all files packed. */
    frames: FrameMap
  }>

  export type FrameMap = Readonly<Record<TagFrameNumber, Frame>>

  export type Meta = Readonly<{
    /** E.g., 'http://www.aseprite.org/'. */
    app: string
    /** E.g., '1.2.8.1'. */
    version: string
    /** The associated output basename. E.g., 'atlas.png'. */
    image: string
    /** E.g., 'RGBA8888' or 'I8'. */
    format: string
    /** Output dimensions. **Via CLI** `--sheet-pack`, uses a power of 2. */
    size: Readonly<WH>
    /** E.g., '1'. */
    scale: string
    /** All FrameTags for all files packed **via CLI** `--list-tags`. */
    frameTags: readonly FrameTag[]
    /** All slices for all files packed **via CLI** `--list-slices`. */
    slices: readonly Slice[]
  }>

  /**
   * A Tag followed by a space followed by a frame number **via CLI**
   * `--filename-format '{tag} {frame}'`.
   */
  export type TagFrameNumber = string

  export type Tag = string

  /**
   * A single animation frame and most primitive unit. Each file packed always
   * has at least one `Frame`.
   */
  export type Frame = Readonly<{
    /**
     * The `Frame`'s bounds within the atlas, including a any border padding
     * **via CLI** `--inner-padding n`. The padding dimensions may also be
     * calculated by subtracting member's WH dimensions from sourceSize and
     * dividing by two.
     */
    frame: Readonly<Rect>
    rotated: boolean
    trimmed: boolean
    /** The `Frame`'s bounds within the file packed, not including padding. */
    spriteSourceSize: Readonly<Rect>
    /** The width and height components of spriteSourceSize. */
    sourceSize: Readonly<WH>
    duration: Duration
  }>

  /**
   * A label and animation behavior for one or more `Frame`s. When combined with
   * the referenced `Frame`s, an animation is represented.
   */
  export type FrameTag = Readonly<{
    /** **By convention**, the associated `Frame`'s `Tag`. */
    name: Tag
    /** The inclusive starting Frame index. */
    from: Int
    /**
     * The inclusive ending `Frame` index, possibly identical to the starting
     * frame index.
     */
    to: Int
    /**
     * Loosened typing to a string so a cast isn't needed when parsing the
     * Aseprite JSON.
     */
    direction: Direction | string
  }>

  /**
   * Positive animation length in milliseconds. **By convention**, animations
   * that should pause use the special Infinite value.
   */
  export type Duration = Millis | Infinite

  /**
   * **By convention**, a reserved value to indicate a value without
   * termination.
   */
  export type Infinite = typeof Infinite
  export const Infinite = <const>0xffff

  /**
   * The `Animation` playback orientation: forward, backward, or forward then
   * backward.
   */
  export type Direction = typeof Direction[keyof typeof Direction]
  export const Direction = <const>{
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
    PingPong: 'pingpong'
  }

  export type Slice = Readonly<{
    name: Tag
    /** Color in `#rrggbbaa` format. E.g., blue is '#0000ffff'. */
    color: string
    keys: readonly Key[]
  }>

  export type Key = Readonly<{
    /**
     * The inclusive associated `Frame`'s start offset, the exclusive previous
     * `Frame`'s end offset. **By convention,** the exclusive end offset is the
     * next higher `Key.frame` if it exists or the animation's end if not. A
     * `Key`'s `Frame` index may be calculated from
     * `FrameTag.index + Key.frame`.
     */
    frame: Int
    /** The `Slice` dimensions. */
    bounds: Readonly<Rect>
  }>
}
