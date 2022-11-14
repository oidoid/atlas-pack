import {
  Anim,
  AnimationByID,
  Aseprite,
  AtlasMeta,
  Cel,
  CelBoundsByID,
  CelID,
  Playback,
} from '@/atlas-pack';
import {
  assert,
  Immutable,
  Int,
  JSONObject,
  U16,
  U16Box,
  U16Millis,
  U16XY,
} from '@/oidlib';

export namespace AtlasMetaParser {
  /**
   * @arg ids If defined, the returned Atlas is validated to have the same
   *  membership as the AnimationID set. If undefined, the caller may wish to use a
   *  string type for AnimationID and perform their own Atlas.animations look-up
   *  checks.
   */
  export function parse<AnimationID extends Aseprite.Tag>(
    file: Aseprite.File | JSONObject,
    ids?: ReadonlySet<AnimationID> | undefined,
  ): AtlasMeta<AnimationID> {
    const asepriteFile = (file as Aseprite.File);
    const animationByID = parseAnimationByID(asepriteFile, ids);
    return Immutable({
      version: asepriteFile.meta.version,
      filename: asepriteFile.meta.image,
      format: asepriteFile.meta.format,
      wh: parseU16XY(asepriteFile.meta.size),
      animationByID,
      celBoundsByID: constructCelBoundsByID(animationByID),
    });
  }

  /** @internal */
  export function parseAnimationByID<AnimationID extends Aseprite.Tag>(
    { meta, frames }: Aseprite.File,
    ids: ReadonlySet<AnimationID> | undefined,
  ): AnimationByID<AnimationID> {
    const { frameTags, slices } = meta;
    const map = new Map<AnimationID, Anim>();
    const factory = new CelIDFactory();
    for (const frameTag of frameTags) {
      const id = frameTag.name;
      assert(isAnimationID(id, ids), `Unknown ID in atlas: "${id}".`);
      assert(!map.has(id), `Duplicate ID in atlas: "${id}".`);
      map.set(id, parseAnimation(id, frameTag, frames, slices, factory));
    }
    if (ids != null && map.size != ids.size) {
      const missing = Array.from(ids.keys())
        .filter((id) => !map.has(id))
        .map((id) => `"${id}"`)
        .join(', ');
      throw Error(`Missing ID(s) in atlas: ${missing}.`);
    }

    // No orphan Slices. Each Slice has a Tag (and there may be multiple Slices with
    // the same Tag).
    const orphanSlices = slices.filter((slice) =>
      !map.has(slice.name as AnimationID)
    );
    if (orphanSlices.length > 0) {
      throw Error(
        `Missing AnimationID(s) for slice(s): ${
          orphanSlices.map((slice) => slice.name).join(', ')
        }.`,
      );
    }

    return <AnimationByID<AnimationID>> Object.fromEntries(map);
  }

  /** @internal */
  export function constructCelBoundsByID<AnimationID extends Aseprite.Tag>(
    animationByID: AnimationByID<AnimationID>,
  ): CelBoundsByID {
    const celBoundsByID = Object.create(null);
    for (const animation of Object.values<Anim>(animationByID)) {
      for (const cel of animation.cels) celBoundsByID[cel.id] = cel.bounds;
    }
    return celBoundsByID;
  }

  /** @internal */
  export function isAnimationID<AnimationID extends Aseprite.Tag>(
    id: Aseprite.Tag,
    ids: ReadonlySet<AnimationID> | undefined,
  ): id is AnimationID {
    return ids == null || ids.has(<AnimationID> id);
  }

  /** @internal */
  export function parseAnimation<AnimationID extends Aseprite.Tag>(
    id: AnimationID,
    frameTag: Aseprite.FrameTag,
    frameMap: Aseprite.FrameMap,
    slices: readonly Aseprite.Slice[],
    factory: CelIDFactory,
  ): Anim {
    const frames = parseTagFrames(frameTag, frameMap);
    const cels = frames.map((frame, i) =>
      parseCel(frameTag, frame, i, slices, factory)
    );
    let duration = cels.reduce((time, { duration }) => time + duration, 0);
    const pingPong = frameTag.direction == Aseprite.Direction.PingPong;
    if (pingPong && cels.length > 2) {
      duration += duration - (cels[0]!.duration + cels.at(-1)!.duration);
    }
    assert(
      duration > 0,
      `Zero total duration for "${frameTag.name}" animation.`,
    );

    assert(cels.length > 0, `"${frameTag.name}" animation has no cels.`);
    assert(
      cels.slice(0, -1).every(({ duration }) =>
        duration < Number.POSITIVE_INFINITY
      ),
      `Intermediate cel has infinite duration for "${frameTag.name}" animation.`,
    );

    const wh = parseU16XY(frames[0]!.sourceSize);
    const area = wh.x * wh.y;
    assert(
      cels.every(({ bounds }) => U16Box.area(bounds) == area),
      `Cel sizes for "${frameTag.name}" animation vary.`,
    );

    return {
      id,
      wh,
      cels,
      duration,
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
    const playback: Record<Aseprite.Direction, Playback> = {
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
      ? U16Box(1, 1, -1, -1)
      : sliceBoxes.reduce((sum, slice) => U16Box.union(sum, slice));
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
    return U16Box(
      frame.frame.x + padding.x / 2,
      frame.frame.y + padding.y / 2,
      frame.sourceSize.w,
      frame.sourceSize.h,
    );
  }

  /** @internal */
  export function parsePadding({
    frame,
    sourceSize,
  }: Aseprite.Frame): Readonly<U16XY> {
    const w = frame.w - sourceSize.w;
    const h = frame.h - sourceSize.h;
    assert(isEven(w) && isEven(h), 'Cel padding is not evenly divisible.');
    return U16XY(w, h);
  }

  /** @internal */
  function isEven(val: number): boolean {
    return (val & 1) == 0;
  }

  /** @internal */
  export function parseDuration(
    duration: Aseprite.Duration,
  ): U16Millis | typeof Number.POSITIVE_INFINITY {
    assert(duration > 0, 'Cel duration is not positive.');
    return duration == Aseprite.Infinite ? Number.POSITIVE_INFINITY : duration;
  }

  /** @internal */
  export function parseSlices(
    { name }: Aseprite.FrameTag,
    index: number,
    slices: readonly Aseprite.Slice[],
  ): readonly Readonly<U16Box>[] {
    const bounds = [];
    for (const slice of slices) {
      // Ignore Slices not for this Tag.
      if (slice.name != name) continue;
      // Get the greatest relevant Key, if any.
      const key = slice.keys.filter((key) => key.frame <= index).at(-1);
      if (key != null) bounds.push(parseU16Box(key.bounds));
    }

    return bounds;
  }

  /** @internal */
  export function parseU16Box(
    { x, y, w, h }: Readonly<Aseprite.Rect<U16 | number>>,
  ): U16Box {
    return U16Box(x, y, w, h);
  }

  /** @internal */
  export function parseU16XY({ w, h }: Aseprite.WH<Int | number>): U16XY {
    return U16XY(w, h);
  }

  /** @internal */
  export class CelIDFactory {
    #id: CelID = <CelID> 0;
    new(): CelID {
      return <CelID> this.#id++;
    }
  }
}
