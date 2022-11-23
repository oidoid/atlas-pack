import { Aseprite, Film } from '@/atlas-pack';
import { U16Box, U16XY } from '@/oidlib';

/**
 * All film and metadata for a sprite sheet.
 *
 * All types are immutably frozen by their parsers. The reason is that this
 * data comes from the sprite sheet and is expected to be unchanging. If you
 * need a mutable copy, create a duplicate instance of the parts that change.
 */
export interface AtlasMeta<FilmID extends Aseprite.Tag> {
  /** The Aseprite version of the parsed file. E.g., '1.2.8.1'. */
  readonly version: string;
  /** The atlas image basename. E.g., 'atlas.png'. */
  readonly filename: string;
  /** Atlas image format. E.g., 'RGBA8888' or 'I8'. */
  readonly format: string;
  /** Atlas image dimensions (power of 2). */
  readonly wh: Readonly<U16XY>;
  readonly filmByID: FilmByID<FilmID>;
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
  readonly celBoundsByID: CelBoundsByID;
}

/** Film look up table. */
export type FilmByID<FilmID extends Aseprite.Tag> = Readonly<
  { [id in FilmID]: Film }
>;

export type CelBoundsByID = readonly Readonly<U16Box>[];
