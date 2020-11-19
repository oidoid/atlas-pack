import {Aseprite} from '../types/Aseprite'
import {Atlas} from '../types/Atlas'
import {Integer} from '../types/Integer'
import {Milliseconds} from '../types/Milliseconds'
import {Rect} from '../types/Rect'
import {WH} from '../types/WH'
import {XY} from '../types/XY'

export const Parser = Object.freeze({
  parse(file: Aseprite.File): Atlas {
    return Object.freeze({
      version: file.meta.version,
      filename: file.meta.image,
      format: file.meta.format,
      size: file.meta.size,
      animations: this.parseAnimationRecord(file)
    })
  },

  /** @internal */
  parseAnimationRecord({meta, frames}: Aseprite.File): Atlas.AnimationRecord {
    const {frameTags, slices} = meta
    const record = Object.freeze(
      frameTags.reduce((atlas, frameTag) => {
        // Every tag should be unique within the sheet.
        if (frameTag.name in atlas)
          throw new Error(`Duplicate tag "${frameTag.name}".`)

        return {
          ...atlas,
          [frameTag.name]: this.parseAnimation(frameTag, frames, slices)
        }
      }, {})
    )
    return record
  },

  /** @internal */
  parseAnimation(
    frameTag: Aseprite.FrameTag,
    frameMap: Aseprite.FrameMap,
    slices: readonly Aseprite.Slice[]
  ): Atlas.Animation {
    const frames = this.tagFrames(frameTag, frameMap)
    const cels = frames.map((frame, i) =>
      this.parseCel(frameTag, frame, i, slices)
    )
    let duration = cels.reduce((time, {duration}) => time + duration, 0)
    const pingPong = frameTag.direction === Aseprite.Direction.PingPong
    if (pingPong && cels.length > 2)
      duration +=
        duration - (cels[0]!.duration + cels[cels.length - 1]!.duration)

    if (!cels.length)
      throw new Error(`"${frameTag.name}" animation missing cels.`)
    if (
      cels
        .slice(0, -1)
        .some(({duration}) => duration === Number.POSITIVE_INFINITY)
    )
      throw new Error(
        `Intermediate cel has infinite duration for "${frameTag.name}" animation.`
      )

    const {w, h} = frames[0]!.sourceSize
    return {
      size: Object.freeze({w, h}),
      cels: Object.freeze(cels),
      duration,
      direction: this.parseDirection(frameTag.direction)
    }
  },

  /** @internal */
  tagFrames(
    {name, from, to}: Aseprite.FrameTag,
    frameMap: Aseprite.FrameMap
  ): readonly Aseprite.Frame[] {
    const frames = []
    for (; from <= to; ++from) {
      const frame = frameMap[`${name} ${from}`]
      if (!frame) throw new Error(`Missing Frame "${name} ${from}".`)
      frames.push(frame)
    }
    return frames
  },

  /** @internal */
  parseDirection(direction: Aseprite.Direction | string): Aseprite.Direction {
    if (this.isDirection(direction)) return direction
    throw new Error(`"${direction}" is not a Direction.`)
  },

  /** @internal */
  isDirection(value: string): value is Aseprite.Direction {
    return Object.values(Aseprite.Direction).some(
      direction => value === direction
    )
  },

  /** @internal */
  parseCel(
    frameTag: Aseprite.FrameTag,
    frame: Aseprite.Frame,
    frameNumber: number,
    slices: readonly Aseprite.Slice[]
  ): Atlas.Cel {
    return Object.freeze({
      position: this.parsePosition(frame),
      duration: this.parseDuration(frame.duration),
      slices: this.parseSlices(frameTag, frameNumber, slices)
    })
  },

  /** @internal */
  parsePosition(frame: Aseprite.Frame): Readonly<XY> {
    const padding = this.parsePadding(frame)
    return Object.freeze({
      x: frame.frame.x + padding.w / 2,
      y: frame.frame.y + padding.h / 2
    })
  },

  /** @internal */
  parsePadding({frame, sourceSize}: Aseprite.Frame): Readonly<WH> {
    return Object.freeze({w: frame.w - sourceSize.w, h: frame.h - sourceSize.h})
  },

  /** @internal */
  parseDuration(
    duration: Aseprite.Duration
  ): Milliseconds | typeof Number.POSITIVE_INFINITY {
    if (duration <= 0) throw new Error('Expected positive cel duration.')
    return duration === Aseprite.Infinite ? Number.POSITIVE_INFINITY : duration
  },

  /** @internal */
  parseSlices(
    {name}: Aseprite.FrameTag,
    index: Integer,
    slices: readonly Aseprite.Slice[]
  ): readonly Readonly<Rect>[] {
    const bounds = []
    for (const slice of slices) {
      // Ignore Slices not for this Tag.
      if (slice.name !== name) continue
      // Get the greatest relevant Key.
      const key = slice.keys.filter(key => key.frame <= index).slice(-1)[0]
      if (key) bounds.push(key.bounds)
    }
    return Object.freeze(bounds)
  }
})
