import {Aseprite} from './aseprite.js'
import type {Atlas} from './atlas.js'
import type {Int} from '../math/int.js'
import type {Millis} from '../math/millis.js'
import type {Rect} from '../math/rect.js'
import type {WH} from '../math/wh.js'
import type {XY} from '../math/xy.js'

export namespace Parser {
  /**
   * @arg ids If defined, the returned Atlas is validated to have the same
   *  membership as the AtlasID set. If undefined, the caller may wish to use a
   *  string type for AtlasID and perform their own Atlas.animations look-up
   *  checks.
   */
  export function parse<AtlasID extends Aseprite.Tag>(
    file: Aseprite.File,
    ids: Readonly<Set<AtlasID>> | undefined
  ): Atlas<AtlasID> {
    return Object.freeze({
      version: file.meta.version,
      filename: file.meta.image,
      format: file.meta.format,
      size: file.meta.size,
      animations: parseAnimationRecord(file, ids)
    })
  }

  /** @internal */
  export function parseAnimationRecord<AtlasID extends Aseprite.Tag>(
    {meta, frames}: Aseprite.File,
    ids: Readonly<Set<AtlasID>> | undefined
  ): Atlas.AnimationRecord<AtlasID> {
    const {frameTags, slices} = meta
    const map: Map<AtlasID, Atlas.Animation> = new Map()
    for (const frameTag of frameTags) {
      const id = frameTag.name
      if (!isAtlasID(id, ids)) throw Error(`Invalid AtlasID "${id}".`)
      if (map.has(id)) throw Error(`Duplicate AtlasID "${id}".`)
      map.set(id, parseAnimation(frameTag, frames, slices))
    }
    if (ids && map.size !== ids.size) {
      const missing = Array.from(ids.keys())
        .filter(id => !map.has(id))
        .map(id => `"${id}"`)
        .join(', ')
      throw Error(`Missing AtlasID(s): ${missing}.`)
    }
    return <Atlas.AnimationRecord<AtlasID>>(
      Object.freeze(Object.fromEntries(map))
    )
  }

  /** @internal */
  export function isAtlasID<AtlasID extends Aseprite.Tag>(
    id: Aseprite.Tag,
    ids: Readonly<Set<AtlasID>> | undefined
  ): id is AtlasID {
    return ids === undefined || ids.has(<AtlasID>id)
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
    const pingPong = frameTag.direction === Aseprite.Direction.PingPong
    if (pingPong && cels.length > 2)
      duration +=
        duration - (cels[0]!.duration + cels[cels.length - 1]!.duration)

    if (!cels.length) throw Error(`"${frameTag.name}" animation missing cels.`)
    if (
      cels
        .slice(0, -1)
        .some(({duration}) => duration === Number.POSITIVE_INFINITY)
    )
      throw Error(
        `Intermediate cel has infinite duration for "${frameTag.name}" animation.`
      )

    const {w, h} = frames[0]!.sourceSize
    return {
      size: Object.freeze({w, h}),
      cels: Object.freeze(cels),
      duration,
      direction: parseDirection(frameTag.direction)
    }
  }

  function tagFrames(
    {name, from, to}: Aseprite.FrameTag,
    frameMap: Aseprite.FrameMap
  ): readonly Aseprite.Frame[] {
    const frames = []
    for (; from <= to; ++from) {
      const frame = frameMap[`${name} ${from}`]
      if (!frame) throw Error(`Missing Frame "${name} ${from}".`)
      frames.push(frame)
    }
    return frames
  }

  /** @internal */
  export function parseDirection(
    direction: Aseprite.Direction | string
  ): Aseprite.Direction {
    if (isDirection(direction)) return direction
    throw Error(`"${direction}" is not a Direction.`)
  }

  /** @internal */
  export function isDirection(value: string): value is Aseprite.Direction {
    return Object.values(Aseprite.Direction).some(
      direction => value === direction
    )
  }

  /** @internal */
  export function parseCel(
    frameTag: Aseprite.FrameTag,
    frame: Aseprite.Frame,
    frameNumber: Int,
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
  export function parseDuration(
    duration: Aseprite.Duration
  ): Millis | typeof Number.POSITIVE_INFINITY {
    if (duration <= 0) throw Error('Expected positive cel duration.')
    return duration === Aseprite.Infinite ? Number.POSITIVE_INFINITY : duration
  }

  /** @internal */
  export function parseSlices(
    {name}: Aseprite.FrameTag,
    index: Int,
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
}
