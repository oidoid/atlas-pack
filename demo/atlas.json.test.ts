// import { assertSnapshot } from '@/oidlib';
import { AtlasMetaParser } from '@/atlas-pack';
import { assertSnapshot } from '../../oidlib/src/test/TestUtil.ts';
import atlasJSON from './atlas.json' assert { type: 'json' };
import { FilmID } from './FilmID.ts';

Deno.test('Atlas is parsable.', async (test) =>
  await assertSnapshot(
    test,
    AtlasMetaParser.parse(atlasJSON, FilmID.values),
  ));
