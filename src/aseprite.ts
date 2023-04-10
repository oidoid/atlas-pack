/**
 * This typing assumes the options specified in atlas-pack and annotated herein
 * with **via CLI**.
 *
 * The JSON export format appears to be undocumented but the related
 * [binary format] is. Types marked "**by convention**" are supplemental to and
 * unenforced by the JSON format. Any data of these types should be validated as
 * soon as possible.
 *
 * All numbers are integers. All indices are zero-based. All geometry are
 * described in screen coordinates (from the top left to the bottom right) in
 * pixel units.
 *
 * [binary format]: https://github.com/aseprite/aseprite/blob/master/docs/ase-file-specs.md
 */

/**
 * The topmost data type for JSON exported from Aseprite. This format contains
 * all the image and animation information for every file packed in the atlas.
 * **By convention**, every file has one or more animations. Every animation
 * has a `Frame` sequence, a Tag, and zero or more Slices.
 */
export interface AsepriteFile {
  readonly meta: AsepriteMeta
  /** All Frames for all files packed. */
  readonly frames: AsepriteFrameMap
}

export interface AsepriteFrameMap {
  readonly [fileTagFrameNumber: AsepriteFileTagFrameNumber]: AsepriteFrame
}

export interface AsepriteMeta {
  /** E.g., 'http://www.aseprite.org/'. */
  readonly app: string
  /** E.g., '1.2.8.1'. */
  readonly version: string
  /** The associated output basename. E.g., 'atlas.png'. */
  readonly image: string
  /** E.g., 'RGBA8888' or 'I8'. */
  readonly format: string
  /** Output dimensions. **Via CLI** `--sheet-pack`. */
  readonly size: AsepriteWH
  /** E.g., '1'. */
  readonly scale: string
  /** All FrameTags for all files packed **via CLI** `--list-tags`. */
  readonly frameTags: readonly AsepriteFrameTag[]
  /** All slices for all files packed **via CLI** `--list-slices`. */
  readonly slices: readonly AsepriteSlice[]
}

/**
 * A `FileTag` followed by a double-hyphen followed by a frame number
 * **via CLI** `--filename-format='{title}--{tag}--{frame}'`.
 */
export type AsepriteFileTagFrameNumber = `${AsepriteFileTag}--${bigint}`

/**
 * The filename stem followed by a double-hyphen followed by the animation
 * tag **via CLI** `--tagname-format={title}--{tag}`.
 */
export type AsepriteFileTag = `${string}--${string}`

/**
 * A single animation frame and the most primitive unit. Each file packed
 * always has at least one `Frame`.
 */
export interface AsepriteFrame {
  /**
   * The `Frame`'s bounds within the atlas, including any border padding
   * **via CLI** `--inner-padding=n`. The padding dimensions may also be
   * calculated by subtracting member's WH dimensions from sourceSize and
   * dividing by two.
   */
  readonly frame: AsepriteRect
  readonly rotated: boolean
  readonly trimmed: boolean
  /** The `Frame`'s bounds within the file packed, not including padding. */
  readonly spriteSourceSize: AsepriteRect
  /** The width and height components of spriteSourceSize. */
  readonly sourceSize: AsepriteWH
  /** Positive animation length in milliseconds. */
  readonly duration: number
}

/**
 * A label and animation behavior for one or more `Frame`s. When combined with
 * the referenced `Frame`s, an animation is represented.
 */
export interface AsepriteFrameTag {
  /**
   * **By convention**, the associated `Frame`'s `FileTag`. A tag by itself
   * would be insufficient to guarantee uniqueness.
   */
  readonly name: AsepriteFileTag
  /** The inclusive starting Frame index. */
  readonly from: number
  /**
   * The inclusive ending `Frame` index, possibly identical to the starting
   * frame index.
   */
  readonly to: number
  readonly direction: AsepriteDirection | string
  /**
   * The number of times to play the animation (as a stringified number).
   *
   *   undefined → ∞
   *   '0' → never
   *   '1' → play once
   *   '2' → play twice
   *   '3' → play thrice
   *   ⋮
   */
  readonly repeat?: `${bigint}` | string
}

/** The `Animation` playback orientation. */
export type AsepriteDirection =
  typeof AsepriteDirection[keyof typeof AsepriteDirection]
export const AsepriteDirection = {
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
  /** Like PingPong but start from end - 1 or start, whichever is greater. */
  PingPongReverse: 'pingpong_reverse',
} as const

export interface AsepriteSlice {
  /** **By convention**, a `FileTag`. */
  readonly name: AsepriteFileTag
  /** Color in `#rrggbbaa` format. E.g., blue is '#0000ffff'. */
  readonly color: string
  readonly keys: readonly AsepriteKey[]
}

export interface AsepriteKey {
  /**
   * The inclusive associated `Frame`'s start offset, the exclusive previous
   * `Frame`'s end offset. **By convention,** the exclusive end offset is the
   * next higher `Key.frame` if it exists or the animation's end if not. A
   * `Key`'s `Frame` index may be calculated from
   * `FrameTag.index + Key.frame`.
   */
  readonly frame: number
  /** The `Slice` dimensions. */
  readonly bounds: AsepriteRect
}

export interface AsepriteRect extends AsepriteWH, AsepriteXY {}

export interface AsepriteWH {
  readonly w: number
  readonly h: number
}

export interface AsepriteXY {
  readonly x: number
  readonly y: number
}
