import {Aseprite} from '../types/Aseprite'
import {Atlas} from '../types/Atlas'
import {Rect} from '../types/Rect'
import {WH} from '../types/WH'
import {XY} from '../types/XY'

export namespace Parser {
  export function parse(file: Aseprite.File): Atlas {
    return Object.freeze({
      version: file.meta.version,
      filename: file.meta.image,
      format: file.meta.format,
      size: file.meta.size,
      animations: parseAnimationRecord(file)
    })
  }

  /** @internal */
  export function parseAnimationRecord({
    meta,
    frames
  }: Aseprite.File): Atlas.AnimationRecord {
    const {frameTags, slices} = meta
    const record = Object.freeze(
      frameTags.reduce((atlas, frameTag) => {
        // Every tag should be unique within the sheet.
        if (frameTag.name in atlas)
          throw new Error(`Duplicate tag "${frameTag.name}".`)

        return {
          ...atlas,
          [frameTag.name]: parseAnimation(frameTag, frames, slices)
        }
      }, {})
    )
    return record
  }

  /** @internal */
  export function parseAnimation(
    frameTag: Aseprite.FrameTag,
    frameMap: Aseprite.FrameMap,
    slices: readonly Aseprite.Slice[]
  ): Atlas.Animation {
    const frames = tagFrames(frameTag, frameMap)
    const cels = frames.map((frame, i) => parseCel(frameTag, frame, i, slices))
    let duration = cels.reduce((time, {duration}) => time + duration, 0)
    const pingPong =
      frameTag.direction === Aseprite.AnimationDirection.PING_PONG
    if (pingPong && cels.length > 2)
      duration += duration - (cels[0].duration + cels[cels.length - 1].duration)

    if (!cels.length)
      throw new Error(`"${frameTag.name}" animation missing cels.`)
    if (duration <= 0)
      throw new Error(
        `Total duration for "${frameTag.name}" animation is non-positive.`
      )
    if (
      cels
        .slice(0, -1)
        .some(({duration}) => duration === Number.POSITIVE_INFINITY)
    )
      throw new Error(
        `Intermediate cel has infinite duration for "${frameTag.name}" animation.`
      )

    const {w, h} = frames[0].sourceSize
    return {
      size: Object.freeze({w, h}),
      cels: Object.freeze(cels),
      duration,
      direction: parseAnimationDirection(frameTag)
    }
  }

  function tagFrames(
    {name, from, to}: Aseprite.FrameTag,
    frameMap: Aseprite.FrameMap
  ): readonly Aseprite.Frame[] {
    const frames = []
    for (; from <= to; ++from) frames.push(frameMap[`${name} ${from}`])
    return frames
  }

  /** @internal */
  export function parseAnimationDirection({
    direction
  }: Aseprite.FrameTag): Aseprite.AnimationDirection {
    if (isAnimationDirection(direction)) return direction
    throw new Error(`"${direction}" is not a Direction.`)
  }

  /** @internal */
  export function isAnimationDirection(
    direction: string
  ): direction is Aseprite.AnimationDirection {
    const vals = Object.values(Aseprite.AnimationDirection)
    return vals.includes(<Aseprite.AnimationDirection>direction)
  }

  /** @internal */
  export function parseCel(
    frameTag: Aseprite.FrameTag,
    frame: Aseprite.Frame,
    frameNumber: number,
    slices: readonly Aseprite.Slice[]
  ): Atlas.Cel {
    return Object.freeze({
      position: parsePosition(frame),
      duration: parseDuration(frame.duration),
      slices: parseSlices(frameTag, frameNumber, slices)
    })
  }

  /** @internal */
  export function parsePosition(frame: Aseprite.Frame): Readonly<XY> {
    const padding = parsePadding(frame)
    return Object.freeze({
      x: frame.frame.x + padding.w / 2,
      y: frame.frame.y + padding.h / 2
    })
  }

  /** @internal */
  export function parsePadding({
    frame,
    sourceSize
  }: Aseprite.Frame): Readonly<WH> {
    return Object.freeze({w: frame.w - sourceSize.w, h: frame.h - sourceSize.h})
  }

  /** @internal */
  export function parseDuration(duration: Aseprite.Duration): number {
    if (!duration) throw new Error('Expected positive cel duration.')
    return duration === Aseprite.INFINITE ? Number.POSITIVE_INFINITY : duration
  }

  /** @internal */
  export function parseSlices(
    {name}: Aseprite.FrameTag,
    index: number,
    slices: readonly Aseprite.Slice[]
  ): readonly Readonly<Rect>[] {
    // Filter out Slices not for this Tag.
    slices = slices.filter(slice => slice.name === name)
    return Object.freeze(
      slices
        // For each Slice, get the greatest relevant Key.
        .map(({keys}) => keys.filter(key => key.frame <= index).slice(-1)[0])
        .map(({bounds}) => Object.freeze(bounds))
    )
  }
}
