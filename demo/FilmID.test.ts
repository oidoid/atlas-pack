import { AtlasMeta } from '@/atlas-pack';
import { assertExists } from 'https://deno.land/std@0.159.0/testing/asserts.ts';
import atlasJSON from './atlas.json' assert { type: 'json' };
import { FilmID } from './FilmID.ts';

Deno.test('Atlas and FilmIDs are aligned.', () => {
  const atlasMeta = atlasJSON as unknown as AtlasMeta<FilmID>;
  for (const id of FilmID.values) {
    assertExists(atlasMeta.filmByID[id], `Atlas missing ${id} FilmID.`);
  }
  for (const id of Object.keys(atlasMeta.filmByID)) {
    assertExists(FilmID.values.has(id as FilmID), `FilmID missing ${id}.`);
  }
});