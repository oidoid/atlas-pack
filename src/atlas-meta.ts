import { Aseprite, Cel, CelID, Film, Playback } from '@/atlas-pack'
import {
  Box,
  I16Box,
  Immutable,
  JSONObject,
  U16Box,
  U16XY,
  U32,
  XY,
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

export namespace AtlasMeta {
  export function fromJSON<FilmID extends Aseprite.Tag>(
    json: JSONObject,
  ): AtlasMeta<FilmID> {
    return Immutable({
      version: json.version as string,
      filename: json.filename as string,
      format: json.format as string,
      wh: new U16XY(json.wh as unknown as XY<number>),
      filmByID: mapValues(
        json.filmByID as unknown as Record<string, JSONObject>,
        parseFilm,
      ) as FilmByID<FilmID>,
      celBoundsByID: (json.celBoundsByID as []).map((bounds) =>
        new U16Box(bounds)
      ),
    })
  }
}

function parseFilm(json: JSONObject): Film {
  return {
    id: json.id as string,
    duration: json.duration as U32,
    wh: new U16XY(json.wh as unknown as XY<number>),
    cels: (json.cels as []).map(parseCel),
    period: json.period as U32,
    direction: json.direction as Playback,
  }
}

function parseCel(json: JSONObject): Cel {
  return {
    id: json.id as CelID,
    bounds: new U16Box(json.bounds as unknown as Box<number>),
    duration: json.duration as U32,
    sliceBounds: new I16Box(json.sliceBounds as unknown as Box<number>),
    slices: (json.slices as unknown as Box<number>[]).map((slice) =>
      new I16Box(slice)
    ),
  }
}
