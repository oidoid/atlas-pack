// import { assertSnapshot } from '@/oidlib';
import { AtlasMetaParser } from '@/atlas-pack';
import { assertSnapshot } from '../../oidlib/src/test/TestUtil.ts';
import { AnimationID } from './AnimationID.ts';
import atlasJSON from './atlas.json' assert { type: 'json' };

Deno.test('Atlas is parsable.', async (test) =>
  await assertSnapshot(
    test,
    AtlasMetaParser.parse(atlasJSON, AnimationID.values),
  ));
