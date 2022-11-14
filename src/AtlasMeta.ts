import { Anim, Aseprite, CelID } from '@/atlas-pack';
import { I16Box, U16XY } from '@/oidlib';

/**
 * All `Anim` and metadata for a sprite sheet.
 *
 * All types are immutably frozen by their parsers. The reason is that this
 * data comes from the sprite sheet and is expected to be unchanging. If you
 * need a mutable copy, create a duplicate instance of the parts that change.
 */
export interface AtlasMeta<AnimationID extends Aseprite.Tag> {
  /** The Aseprite version of the parsed file. E.g., '1.2.8.1'. */
  readonly version: string;
  /** The atlas image basename. E.g., 'atlas.png'. */
  readonly filename: string;
  /** Atlas image format. E.g., 'RGBA8888' or 'I8'. */
  readonly format: string;
  /** Atlas image dimensions (power of 2). */
  readonly wh: Readonly<U16XY>;
  readonly animationByID: AnimationByID<AnimationID>;
  /**
   * A mapping from CelID to cel bounds. Used for fast atlas source dimension
   * look-up.
   */
  readonly celBoundsByID: CelBoundsByID;
}

/** `Anim` look up table. */
export type AnimationByID<AnimationID extends Aseprite.Tag> = Readonly<
  { [id in AnimationID]: Anim }
>;

export type CelBoundsByID = Readonly<{ [id: CelID]: Readonly<I16Box> }>;
