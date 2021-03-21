import {Aseprite, Parser} from '../aseprite-atlas/aseprite-atlas.js'
import {AtlasID} from './atlas-id.js'
import atlasJSON from './atlas.json'

const file: Aseprite.File = Object.freeze(atlasJSON)
const tags: readonly string[] = Object.freeze(
  file.meta.frameTags.map(frameTag => frameTag.name)
)

// No orphan Slices. Each Slice has a Tag (and there may be multiple Slices with
// the same Tag).
test.each(file.meta.slices)('%# Slice name %p is a Tag.', slice =>
  expect(tags).toContainEqual(slice.name)
)

test('Atlas is parsable.', () =>
  expect(Parser.parse(atlasJSON, AtlasID.values)).toMatchSnapshot())
