import {
  Aseprite,
  AtlasMeta,
  Cel,
  CelBoundsByID,
  CelID,
  Film,
  FilmByID,
  InfiniteDuration,
  Playback,
} from '@/atlas-pack';
import {
  assert,
  I16Box,
  Immutable,
  Int,
  JSONObject,
  U16Box,
  U16XY,
  U32,
} from '@/oidlib';

export namespace AtlasMetaParser {
  /**
   * @arg ids If defined, the returned Atlas is validated to have the same
   *   membership as the FilmID set. If undefined, the caller may wish to use a
   *   string type for FilmID and perform their own Atlas.filmByID lookup
   *   checks.
   */
  export function parse<FilmID extends Aseprite.Tag>(
    file: Aseprite.File | JSONObject,
    ids?: ReadonlySet<FilmID> | undefined,
  ): AtlasMeta<FilmID> {
    const factory = new CelIDFactory();
    const asepriteFile = file as Aseprite.File;
    const filmByID = parseFilmByID(factory, asepriteFile, ids);
    return Immutable({
      version: asepriteFile.meta.version,
      filename: asepriteFile.meta.image,
      format: asepriteFile.meta.format,
      wh: parseU16XY(asepriteFile.meta.size),
      filmByID,
      celBoundsByID: newCelBoundsByID(factory, filmByID),
    });
  }

  /** @internal */
  export function parseFilmByID<FilmID extends Aseprite.Tag>(
    factory: CelIDFactory,
    file: Aseprite.File,
    ids: ReadonlySet<FilmID> | undefined,
  ): FilmByID<FilmID> {
    const { frameTags, slices } = file.meta;
    const map = new Map<FilmID, Film>();
    for (const frameTag of frameTags) {
      const id = frameTag.name;
      assert(isFilmID(id, ids), `Unknown ID in atlas: "${id}".`);
      assert(!map.has(id), `Duplicate ID in atlas: "${id}".`);
      map.set(id, parseFilm(id, frameTag, file.frames, slices, factory));
    }
    const missingIDs = ids == null || ids.size == map.size
      ? []
      : [...ids.keys()].filter((id) => !map.has(id)).map((id) => `"${id}"`);
    assert(
      missingIDs.length == 0,
      `Missing ID(s) in atlas: ${missingIDs.join(', ')}.`,
    );

    // No orphan Slices. Each Slice has a Tag (and there may be multiple Slices
    // with the same Tag).
    const orphanSlices = slices.filter((slice) =>
      !map.has(slice.name as FilmID)
    );
    assert(
      orphanSlices.length == 0,
      `Missing ID(s) for slice(s): ${
        orphanSlices.map((slice) => slice.name).join(', ')
      }.`,
    );

    return <FilmByID<FilmID>> Object.fromEntries(map);
  }

  /** @internal */
  export function newCelBoundsByID<FilmID extends Aseprite.Tag>(
    factory: Readonly<CelIDFactory>,
    filmByID: FilmByID<FilmID>,
  ): CelBoundsByID {
    const celBoundsByID = [];
    for (const film of Object.values<Film>(filmByID)) {
      for (const cel of film.cels) celBoundsByID[cel.id] = cel.bounds;
    }
    assert(
      celBoundsByID.length == factory.size,
      `Cel bounds lookup table has incorrect length ` +
        `(${celBoundsByID.length}); length should equal number of CelIDs ` +
        `created (${factory.size}).`,
    );
    return celBoundsByID;
  }

  /** @internal */
  export function isFilmID<FilmID extends Aseprite.Tag>(
    id: Aseprite.Tag,
    ids: ReadonlySet<FilmID> | undefined,
  ): id is FilmID {
    return ids == null || ids.has(<FilmID> id);
  }

  /** @internal */
  export function parseFilm<FilmID extends Aseprite.Tag>(
    id: FilmID,
    frameTag: Aseprite.FrameTag,
    frameMap: Aseprite.FrameMap,
    slices: readonly Aseprite.Slice[],
    factory: CelIDFactory,
  ): Film {
    const frames = parseTagFrames(frameTag, frameMap);
    const cels = frames.map((frame, i) =>
      parseCel(frameTag, frame, i, slices, factory)
    );
    assert(cels.length > 0, `"${frameTag.name}" film has no cels.`);

    const invalidDurationCelIndex = cels.slice(
      frameTag.direction == Aseprite.Direction.Reverse ? 1 : 0,
      frameTag.direction == Aseprite.Direction.Forward ? -1 : undefined,
    ).findIndex(({ duration }) => duration == InfiniteDuration);
    assert(
      invalidDurationCelIndex == -1,
      `Cel ${invalidDurationCelIndex} must have finite duration (less than ` +
        `${Aseprite.Infinity}) for ${frameTag.direction} playback in ` +
        `"${frameTag.name}" film.`,
    );

    let duration = cels.reduce(
      (time, { duration }) => Math.min(InfiniteDuration, time + duration),
      0,
    );
    if (frameTag.direction == Aseprite.Direction.PingPong && cels.length > 2) {
      duration += duration - (cels[0]!.duration + cels.at(-1)!.duration);
    }
    assert(duration > 0, `Zero total duration for "${frameTag.name}" film.`);

    // Cels is known to have at least one and is derived from frames.
    const wh = parseU16XY(frames[0]!.sourceSize);
    const area = wh.x * wh.y;
    assert(
      cels.every(({ bounds }) => bounds.areaNum == area),
      `Cel sizes for "${frameTag.name}" film vary.`,
    );

    const period = computePeriod(cels);

    // Add cels needed to make the tagged film's frequency uniform so that cel
    // lookup uses the same formula.
    for (let i = cels.length - 1; i >= 0; i--) {
      const cel = cels[i]!;
      if (cel.duration == InfiniteDuration) continue;
      for (
        let duration: number = period;
        duration < cel.duration;
        duration += period
      ) cels.splice(i, 0, cel);
    }

    return {
      id,
      wh,
      cels,
      period,
      duration: U32(duration),
      direction: parsePlayback(frameTag.direction),
    };
  }

  /** @internal */
  function parseTagFrames(
    { name, from, to }: Aseprite.FrameTag,
    frameMap: Aseprite.FrameMap,
  ): readonly Aseprite.Frame[] {
    const frames = [];
    for (; from <= to; from++) {
      const tagFrameNumber: Aseprite.TagFrameNumber = `${name}-${from}`;
      const frame = frameMap[tagFrameNumber];
      assert(frame != null, `Missing Frame "${tagFrameNumber}".`);
      frames.push(frame);
    }
    return frames;
  }

  /** @internal */
  export function parsePlayback(
    direction: Aseprite.Direction | string,
  ): Playback {
    assert(isDirection(direction), `"${direction}" is not a Direction.`);
    const playback: { [direction in Aseprite.Direction]: Playback } = {
      'forward': 'Forward',
      'reverse': 'Reverse',
      'pingpong': 'PingPong',
    };
    return playback[direction];
  }

  /** @internal */
  export function isDirection(value: string): value is Aseprite.Direction {
    return Object.values(Aseprite.Direction).some(
      (direction) => value == direction,
    );
  }

  /** @internal */
  export function parseCel(
    frameTag: Aseprite.FrameTag,
    frame: Aseprite.Frame,
    frameNumber: number,
    slices: readonly Aseprite.Slice[],
    factory: CelIDFactory,
  ): Cel {
    // to-do: slices seem to be one pixel too wide and tall for how they're
    // rendered in Aseprite.
    const sliceBoxes = parseSlices(frameTag, frameNumber, slices);
    const sliceBounds = sliceBoxes.length < 1
      ? new I16Box(1, 1, -1, -1)
      : sliceBoxes.reduce((sum, slice) => sum.union(slice));
    return {
      id: factory.new(),
      bounds: parseBounds(frame),
      duration: parseDuration(frame.duration),
      sliceBounds,
      slices: sliceBoxes,
    };
  }

  /** @internal */
  export function parseBounds(frame: Aseprite.Frame): Readonly<U16Box> {
    const padding = parsePadding(frame);
    return new U16Box(
      frame.frame.x + padding.x / 2,
      frame.frame.y + padding.y / 2,
      frame.sourceSize.w,
      frame.sourceSize.h,
    );
  }

  /** @internal */
  export function parsePadding(frame: Aseprite.Frame): Readonly<U16XY> {
    const w = frame.frame.w - frame.sourceSize.w;
    const h = frame.frame.h - frame.sourceSize.h;
    assert(isEven(w) && isEven(h), 'Cel padding is not evenly divisible.');
    return new U16XY(w, h);
  }

  function isEven(val: number): boolean {
    return (val & 1) == 0;
  }

  /** @internal */
  export function parseDuration(duration: Aseprite.Duration): U32 {
    assert(duration > 0, 'Cel duration is not positive.');
    if (duration == Aseprite.Infinity) return InfiniteDuration;
    return U32(duration);
  }

  /** @internal */
  export function parseSlices(
    frameTag: Aseprite.FrameTag,
    index: number,
    slices: readonly Aseprite.Slice[],
  ): readonly Readonly<I16Box>[] {
    const bounds = [];
    for (const slice of slices) {
      // Ignore Slices not for this Tag.
      if (slice.name != frameTag.name) continue;
      // Get the greatest relevant Key, if any.
      const key = slice.keys.filter((key) => key.frame <= index).at(-1);
      if (key != null) bounds.push(new I16Box(key.bounds));
    }

    return bounds;
  }

  /** @internal */
  export function parseU16XY(wh: Aseprite.WH<Int | number>): U16XY {
    return new U16XY(wh.w, wh.h);
  }

  function computePeriod(cels: readonly Cel[]): U32 | InfiniteDuration {
    const durations = cels.map((cel) => cel.duration);
    if (durations.length <= 1) return durations[0]!;

    const infinite = durations.at(-1) == InfiniteDuration;
    const finiteDurations = infinite ? durations.slice(0, -1) : durations;
    const period = greatestCommonDivisor(
      finiteDurations as [U32, ...U32[]],
    );

    return U32(period);
  }

  /** @internal */
  export function greatestCommonDivisor(ints: [Int, ...Int[]]): Int {
    return ints.reduce(
      (gcd, int) => greatestCommonDivisorPair(gcd, int),
      ints[0],
    );
  }

  /** @internal */
  export function greatestCommonDivisorPair(lhs: Int, rhs: Int): Int {
    assert(lhs != 0 && rhs != 0, 'Cannot divide by zero.');
    const remainder = lhs % rhs;
    if (remainder == 0) return rhs;
    return greatestCommonDivisorPair(rhs, Int(remainder));
  }
}

/** @internal */
export class CelIDFactory {
  #id: CelID = <CelID> 0;

  new(): CelID {
    return <CelID> this.#id++;
  }

  get size(): number {
    return this.#id;
  }
}
