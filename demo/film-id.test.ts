import { Atlas } from '@/atlas-pack'
import { assertExists } from 'std/testing/asserts.ts'
import atlasJSON from './atlas.json' assert { type: 'json' }
import { FilmID, FilmIDSet } from './film-id.ts'

Deno.test('Atlas and FilmIDs are aligned.', () => {
  const atlas = Atlas.fromJSON(atlasJSON)
  for (const id of FilmIDSet) {
    assertExists(atlas.filmByID[id], `Atlas missing ${id} FilmID.`)
  }
  for (const id of Object.keys(atlas.filmByID)) {
    assertExists(FilmIDSet.has(id as FilmID), `FilmID missing ${id}.`)
  }
})
