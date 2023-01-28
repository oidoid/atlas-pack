import {
  Aseprite,
  Cel,
  CelID,
  CelJSON,
  Film,
  FilmJSON,
  Playback,
} from '@/atlas-pack'
import {
  BoxJSON,
  I16Box,
  Immutable,
  U16Box,
  U16XY,
  U32,
  XYJSON,
} from '@/oidlib'
import { mapValues } from 'std/collections/map_values.ts'

/**
 * All film and metadata for a sprite sheet.
 *
 * All types are immutably frozen by their parsers. The reason is that this
 * data comes from the sprite sheet and is expected to be unchanging. If you
 * need a mutable copy, create a duplicate instance of the parts that change.
 */
export interface AtlasMeta<FilmID extends Aseprite.Tag> {
  /** The Aseprite version of the parsed file. E.g., '1.2.8.1'. */
  readonly version: string
  /** The atlas image basename. E.g., 'atlas.png'. */
  readonly filename: string
  /** Atlas image format. E.g., 'RGBA8888' or 'I8'. */
  readonly format: string
  /** Atlas image dimensions (power of 2). */
  readonly wh: Readonly<U16XY>
  readonly filmByID: FilmByID<FilmID>
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
  readonly celBoundsByID: CelBoundsByID
}

/** Film look up table. */
export type FilmByID<FilmID extends Aseprite.Tag> = Readonly<
  { [id in FilmID]: Film }
>

export type CelBoundsByID = readonly Readonly<U16Box>[]

export interface AtlasMetaJSON {
  readonly version: string
  readonly filename: string
  readonly format: string
  readonly wh: Readonly<XYJSON>
  readonly filmByID: FilmByIDJSON
  readonly celBoundsByID: CelBoundsByIDJSON
}

export type CelBoundsByIDJSON = readonly Readonly<BoxJSON>[]

export interface FilmByIDJSON {
  readonly [id: string]: FilmJSON
}

export namespace AtlasMeta {
  export function fromJSON<FilmID extends Aseprite.Tag>(
    json: AtlasMetaJSON,
  ): AtlasMeta<FilmID> {
    return Immutable({
      version: json.version,
      filename: json.filename,
      format: json.format,
      wh: U16XY.fromJSON(json.wh),
      filmByID: mapValues(json.filmByID, parseFilm) as FilmByID<FilmID>,
      celBoundsByID: json.celBoundsByID.map((bounds) =>
        U16Box.fromJSON(bounds)
      ),
    })
  }
}

function parseFilm(json: FilmJSON): Film {
  return {
    id: json.id,
    duration: U32(json.duration),
    wh: U16XY.fromJSON(json.wh),
    cels: json.cels.map(parseCel),
    period: U32(json.period),
    direction: json.direction as Playback,
  }
}

function parseCel(json: CelJSON): Cel {
  return {
    id: json.id as CelID,
    bounds: U16Box.fromJSON(json.bounds),
    duration: U32(json.duration),
    sliceBounds: I16Box.fromJSON(json.sliceBounds),
    slices: json.slices.map((slice) => I16Box.fromJSON(slice)),
  }
}
