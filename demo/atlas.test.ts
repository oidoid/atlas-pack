import { Atlas } from '@/atlas-pack'
import { assertEquals } from 'std/testing/asserts.ts'
import atlasJSON from './atlas.json' assert { type: 'json' }

Deno.test('Atlas.toJSON()', () => {
  assertEquals(atlasJSON, JSON.parse(JSON.stringify(Atlas.fromJSON(atlasJSON))))
})
