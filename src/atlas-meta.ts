import {
  AsepriteFileTag,
  Cel,
  CelID,
  CelJSON,
  Film,
  FilmJSON,
  Playback,
} from '@/atlas-pack'
import { Box, PartialBox, PartialXY, XY } from '@/ooz'
import { mapValues } from 'std/collections/map_values.ts'

/**
 * All film and metadata for a sprite sheet.
 *
 * All types are immutably frozen by their parsers. The reason is that this
 * data comes from the sprite sheet and is expected to be unchanging. If you
 * need a mutable copy, create a duplicate instance of the parts that change.
 */
export class AtlasMeta<in FilmID extends AsepriteFileTag> {
  static fromJSON<const FilmID extends AsepriteFileTag>(
    json: AtlasMetaJSON,
  ): AtlasMeta<FilmID> {
    return new AtlasMeta(
      json.version,
      json.filename,
      json.format,
      XY.fromJSON(json.wh),
      mapValues(json.filmByID, parseFilm) as FilmByID<FilmID>,
      json.celBoundsByID.map((bounds) => Box.fromJSON(bounds)),
    )
  }

  constructor(
    /** The Aseprite version of the parsed file. E.g., '1.2.8.1'. */
    readonly version: string,
    /** The atlas image basename. E.g., 'atlas.png'. */
    readonly filename: string,
    /** Atlas image format. E.g., 'RGBA8888' or 'I8'. */
    readonly format: string,
    /** Atlas image dimensions (power of 2). */
    readonly wh: Readonly<XY>,
    readonly filmByID: FilmByID<FilmID>,
    /**
     * Every cel in the atlas keyed by a contiguous array of CelIDs. Used for fast
     * atlas source dimension look-up.
     *
     * Eg:
     *
     *   0 → frog idle film cel 0
     *   1 → frog idle film cel 1
     *   2 → cloud film cel 0
     *   ⋮
     */
    readonly celBoundsByID: readonly Readonly<Box>[],
  ) {}
}

/** Film look up table. */
export type FilmByID<in FilmID extends AsepriteFileTag> = Readonly<
  { [id in FilmID]: Film }
>

export interface AtlasMetaJSON {
  readonly version: string
  readonly filename: string
  readonly format: string
  readonly wh: Readonly<PartialXY>
  readonly filmByID: { readonly [id: string]: FilmJSON }
  readonly celBoundsByID: readonly Readonly<PartialBox>[]
}

function parseFilm(json: FilmJSON): Film {
  return {
    id: json.id as AsepriteFileTag,
    duration: json.duration,
    wh: XY.fromJSON(json.wh),
    cels: json.cels.map(parseCel),
    sliceBounds: Box.fromJSON(json.sliceBounds),
    period: json.period,
    direction: json.direction as Playback,
    loops: json.loops == null ? Number.POSITIVE_INFINITY : json.loops,
  }
}

function parseCel(json: CelJSON): Cel {
  return {
    id: json.id as CelID,
    bounds: Box.fromJSON(json.bounds),
    duration: json.duration,
    sliceBounds: Box.fromJSON(json.sliceBounds),
    slices: json.slices.map((slice) => Box.fromJSON(slice)),
  }
}
