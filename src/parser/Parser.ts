import {Aseprite} from '../types/Aseprite'
import {Atlas} from '../types/Atlas'
import {Rect} from '../types/Rect'
import {WH} from '../types/WH'
import {XY} from '../types/XY'

export namespace Parser {
  export function parse(file: Aseprite.File): Atlas {
    return Object.freeze({
      version: file.meta.version,
      animations: parseAnimationRecord(file)
    })
  }

  export function parseAnimationRecord({
    meta,
    frames
  }: Aseprite.File): Atlas.AnimationRecord {
    const {frameTags, slices} = meta
    return Object.freeze(
      frameTags.reduce(
        (atlas, frameTag) => ({
          ...atlas,
          [frameTag.name]: parseAnimation(frameTag, frames, slices)
        }),
        {}
      )
    )
  }

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

  export function parseAnimationDirection({
    direction
  }: Aseprite.FrameTag): Aseprite.AnimationDirection {
    if (isAnimationDirection(direction)) return direction
    throw new Error(`"${direction}" is not a Direction.`)
  }

  export function isAnimationDirection(
    direction: string
  ): direction is Aseprite.AnimationDirection {
    const vals = Object.values(Aseprite.AnimationDirection)
    return vals.includes(<Aseprite.AnimationDirection>direction)
  }

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

  export function parsePosition(frame: Aseprite.Frame): Readonly<XY> {
    const padding = parsePadding(frame)
    return Object.freeze({
      x: frame.frame.x + padding.w / 2,
      y: frame.frame.y + padding.h / 2
    })
  }

  export function parsePadding({
    frame,
    sourceSize
  }: Aseprite.Frame): Readonly<WH> {
    return Object.freeze({w: frame.w - sourceSize.w, h: frame.h - sourceSize.h})
  }

  export function parseDuration(duration: Aseprite.Duration): number {
    return duration === Aseprite.INFINITE ? Number.POSITIVE_INFINITY : duration
  }

  export function parseSlices(
    {name}: Aseprite.FrameTag,
    index: number,
    slices: readonly Aseprite.Slice[]
  ): readonly Rect[] {
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
