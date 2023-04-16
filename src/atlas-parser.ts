import {
  AsepriteDirection,
  AsepriteFile,
  AsepriteFileTag,
  AsepriteFileTagFrameNumber,
  AsepriteFrame,
  AsepriteFrameMap,
  AsepriteFrameTag,
  AsepriteSlice,
  AsepriteWH,
  Atlas,
  Cel,
  CelID,
  Film,
  FilmByID,
  Playback,
} from '@/atlas-pack'
import { assert, Box, JSONObject, NonNull, XY } from '@/ooz'

/**
 * @arg ids If defined, the returned Atlas is validated to have the same
 *   membership as the FilmID set. If undefined, the caller may wish to use a
 *   string type for FilmID and perform their own Atlas.filmByID lookup
 *   checks.
 */
export function parseAtlas<const FilmID extends AsepriteFileTag>(
  file: AsepriteFile | JSONObject,
  ids?: ReadonlySet<FilmID> | undefined,
): Atlas<FilmID> {
  const factory = new CelIDFactory()
  const asepriteFile = file as AsepriteFile
  const filmByID = parseFilmByID(factory, asepriteFile, ids)
  return {
    version: asepriteFile.meta.version,
    filename: asepriteFile.meta.image,
    format: asepriteFile.meta.format,
    wh: parseXY(asepriteFile.meta.size),
    filmByID,
    celBoundsByID: newCelBoundsByID(factory, filmByID),
  }
}

/** @internal */
export function parseFilmByID<const FilmID extends AsepriteFileTag>(
  factory: CelIDFactory,
  file: AsepriteFile,
  ids: ReadonlySet<FilmID> | undefined,
): FilmByID<FilmID> {
  const { frameTags, slices } = file.meta
  const map = new Map<FilmID, Film>()
  for (const frameTag of frameTags) {
    const id = frameTag.name
    assert(isFilmID(id, ids), `Unknown ID in atlas: "${id}".`)
    assert(!map.has(id), `Duplicate ID in atlas: "${id}".`)
    map.set(id, parseFilm(id, frameTag, file.frames, slices, factory))
  }
  const missingIDs = ids == null || ids.size === map.size
    ? []
    : [...ids.keys()].filter((id) => !map.has(id)).map((id) => `"${id}"`)
  assert(
    missingIDs.length === 0,
    `Missing ID(s) in atlas: ${missingIDs.join(', ')}.`,
  )

  // No orphan Slices. Each Slice has a FileTag (and there may be multiple
  // Slices with the same FileTag).
  const orphanSlices = slices.filter((slice) => !map.has(slice.name as FilmID))
  assert(
    orphanSlices.length === 0,
    `Missing ID(s) for slice(s): ${
      orphanSlices.map((slice) => slice.name).join(', ')
    }.`,
  )

  return <FilmByID<FilmID>> Object.fromEntries(map)
}

/** @internal */
export function newCelBoundsByID<const FilmID extends AsepriteFileTag>(
  factory: Readonly<CelIDFactory>,
  filmByID: FilmByID<FilmID>,
): readonly Readonly<Box>[] {
  const celBoundsByID = []
  for (const film of Object.values<Film>(filmByID)) {
    for (const cel of film.cels) celBoundsByID[cel.id] = cel.bounds
  }
  assert(
    celBoundsByID.length === factory.size,
    `Cel bounds lookup table has incorrect length ` +
      `(${celBoundsByID.length}); length should equal number of CelIDs ` +
      `created (${factory.size}).`,
  )
  return celBoundsByID
}

/** @internal */
export function isFilmID<const FilmID extends AsepriteFileTag>(
  id: AsepriteFileTag,
  ids: ReadonlySet<FilmID> | undefined,
): id is FilmID {
  return ids == null || ids.has(<FilmID> id)
}

/** @internal */
export function parseFilm<const FilmID extends AsepriteFileTag>(
  id: FilmID,
  frameTag: AsepriteFrameTag,
  frameMap: AsepriteFrameMap,
  slices: Iterable<AsepriteSlice>,
  factory: CelIDFactory,
): Film {
  const frames = [...parseFrames(frameTag, frameMap)]
  const cels = frames.map((frame, i) =>
    parseCel(frameTag, frame, i, slices, factory)
  )
  assert(cels.length > 0, `"${frameTag.name}" film has no cels.`)

  let duration = cels.reduce(
    (time, { duration }) => time + duration,
    0,
  )
  if (
    (frameTag.direction === AsepriteDirection.PingPong ||
      frameTag.direction === AsepriteDirection.PingPongReverse) &&
    cels.length > 2
  ) {
    duration += duration - (cels[0]!.duration + cels.at(-1)!.duration)
  }
  assert(duration > 0, `Zero total duration for "${frameTag.name}" film.`)

  // Cels is known to have at least one and is derived from frames.
  const wh = parseXY(frames[0]!.sourceSize)
  const area = wh.x * wh.y
  assert(
    cels.every(({ bounds }) => bounds.area === area),
    `Cel sizes for "${frameTag.name}" film vary.`,
  )

  const period = computePeriod(cels)

  // Add cels needed to make the tagged film's frequency uniform so that cel
  // lookup uses the same formula.
  for (let i = cels.length - 1; i >= 0; i--) {
    const cel = cels[i]!
    const copies = (cel.duration / period) - 1
    cels.splice(i, 0, ...Array(copies).fill(cel))
  }

  return {
    id,
    wh,
    cels,
    sliceBounds: cels.reduce(
      (union, cel) =>
        cel.sliceBounds.flipped ? union : union.union(cel.sliceBounds),
      cels[0]!.sliceBounds.copy(),
    ),
    period,
    duration,
    direction: parsePlayback(frameTag.direction),
    loops: frameTag.repeat == null
      ? Number.POSITIVE_INFINITY
      : Number.parseInt(frameTag.repeat, 10),
  }
}

/** @internal */
function* parseFrames(
  { name, from, to }: AsepriteFrameTag,
  frameMap: AsepriteFrameMap,
): IterableIterator<AsepriteFrame> {
  for (; from <= to; from++) {
    assert(name.includes('--'), `"${name}" is not a FileTag.`)
    const fileTagFrameNumber = `${name}--${from}` as AsepriteFileTagFrameNumber
    const frame = frameMap[fileTagFrameNumber]
    assert(frame != null, `Missing Frame "${fileTagFrameNumber}".`)
    yield frame
  }
}

const playback: Readonly<Record<AsepriteDirection, Playback>> = {
  'forward': 'Forward',
  'reverse': 'Reverse',
  'pingpong': 'PingPong',
  'pingpong_reverse': 'PingPongReverse',
}

/** @internal */
export function parsePlayback(
  direction: AsepriteDirection | string,
): Playback {
  return NonNull(
    playback[direction as AsepriteDirection],
    `"${direction}" is not a Direction.`,
  )
}

/** @internal */
export function parseCel(
  frameTag: AsepriteFrameTag,
  frame: AsepriteFrame,
  frameNumber: number,
  slices: Iterable<AsepriteSlice>,
  factory: CelIDFactory,
): Cel {
  const sliceBoxes = parseSlices(frameTag, frameNumber, slices)
  const sliceBounds = sliceBoxes.length < 1
    ? new Box(0, 0, -1, -1)
    : sliceBoxes.reduce((sum, slice) => sum.union(slice))
  return {
    id: factory.new(),
    bounds: parseBounds(frame),
    duration: parseDuration(frame.duration),
    sliceBounds,
    slices: sliceBoxes,
  }
}

/** @internal */
export function parseBounds(frame: AsepriteFrame): Readonly<Box> {
  const padding = parsePadding(frame)
  return new Box(
    frame.frame.x + padding.x / 2,
    frame.frame.y + padding.y / 2,
    frame.sourceSize.w,
    frame.sourceSize.h,
  )
}

/** @internal */
export function parsePadding(frame: AsepriteFrame): Readonly<XY> {
  const w = frame.frame.w - frame.sourceSize.w
  const h = frame.frame.h - frame.sourceSize.h
  assert(isEven(w) && isEven(h), 'Cel padding is not evenly divisible.')
  return new XY(w, h)
}

function isEven(val: number): boolean {
  return (val & 1) === 0
}

/** @internal */
export function parseDuration(duration: number): number {
  assert(duration > 0, 'Cel duration is not positive.')
  return duration
}

/** @internal */
export function parseSlices(
  frameTag: AsepriteFrameTag,
  index: number,
  slices: Iterable<AsepriteSlice>,
): readonly Readonly<Box>[] {
  const bounds = []
  for (const slice of slices) {
    // Ignore Slices not for this FileTag.
    if (slice.name !== frameTag.name) continue
    // Get the greatest relevant Key, if any.
    const key = slice.keys.filter((key) => key.frame <= index).at(-1)
    if (key != null) {
      bounds.push(
        new Box(key.bounds.x, key.bounds.y, key.bounds.w, key.bounds.h),
      )
    }
  }

  return bounds
}

function parseXY(wh: AsepriteWH): XY {
  return new XY(wh.w, wh.h)
}

function computePeriod(cels: Iterable<Cel>): number {
  const durations = []
  for (const cel of cels) durations.push(cel.duration)
  if (durations.length <= 1) return durations[0]!

  return greatestCommonDivisor(durations as [number, ...number[]])
}

function greatestCommonDivisor(ints: [number, ...number[]]): number {
  return ints.reduce(
    (gcd, int) => greatestCommonDivisorPair(gcd, int),
    ints[0],
  )
}

function greatestCommonDivisorPair(lhs: number, rhs: number): number {
  assert(lhs !== 0 && rhs !== 0, 'Cannot divide by zero.')
  const remainder = lhs % rhs
  if (remainder === 0) return rhs
  return greatestCommonDivisorPair(rhs, remainder)
}

/** @internal */
export class CelIDFactory {
  #id: CelID = <CelID> 0

  new(): CelID {
    return <CelID> this.#id++
  }

  get size(): number {
    return this.#id
  }
}
