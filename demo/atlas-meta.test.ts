import { AtlasMeta } from '@/atlas-pack'
import { assertEquals } from 'std/testing/asserts.ts'
import atlasJSON from './atlas.json' assert { type: 'json' }

Deno.test('AtlasMeta.toJSON()', () => {
  assertEquals(
    atlasJSON,
    JSON.parse(JSON.stringify(AtlasMeta.fromJSON(atlasJSON))),
  )
})
