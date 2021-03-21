import {Aseprite, Atlas, Parser} from '../aseprite-atlas/aseprite-atlas.js'
import {AtlasID} from './atlas-id.js'
import atlasJSON from './atlas.json'

const file: Aseprite.File = Object.freeze(atlasJSON)
const atlas: Atlas = Parser.parse(file)
const ids: readonly AtlasID[] = Object.freeze(Object.values(AtlasID))

// Every AtlasID exists in the Atlas.
test.each(ids)('%# AtlasID %p has an Animation', id =>
  expect(atlas.animations).toHaveProperty(id)
)

// Every Animation ID in the Atlas exists in AtlasID.
test.each(Object.keys(atlas.animations))(
  '%# animation ID %p has an AtlasID',
  id => expect(ids).toContainEqual(id)
)

// Every AtlasID value is unique.
test.each(ids)(`%# AtlasID %p is unique`, id =>
  expect(ids.filter(val => id === val)).toHaveLength(1)
)
