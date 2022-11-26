import { Aseprite, AtlasMetaParser, CelID, Playback } from '@/atlas-pack';
import { U16, U16Box, U16Millis, U16XY, U32Millis } from '@/oidlib';
import { assertEquals, assertThrows } from 'std/testing/asserts.ts';
import { CelIDFactory } from './AtlasMetaParser.ts';
import { InfiniteDuration } from './Film.ts';

Deno.test('parse()', async (test) => {
  await test.step('Parses Meta.', () => {
    assertEquals(
      AtlasMetaParser.parse(
        {
          meta: {
            app: 'http://www.aseprite.org/',
            version: '1.2.8.1',
            image: 'atlas.png',
            format: 'I8',
            size: { w: 1, h: 2 },
            scale: '1',
            frameTags: [],
            slices: [],
          },
          frames: {},
        },
        new Set([]),
      ),
      {
        version: '1.2.8.1',
        filename: 'atlas.png',
        format: 'I8',
        wh: U16XY(1, 2),
        filmByID: {},
        celBoundsByID: [],
      },
    );
  });
});

Deno.test('parseFilmByID()', async (test) => {
  await test.step('Parses films.', () => {
    const frameTags = [
      { name: 'sceneryCloud', from: 0, to: 0, direction: 'forward' },
      { name: 'palette-red', from: 1, to: 1, direction: 'forward' },
      { name: 'sceneryConifer', from: 2, to: 2, direction: 'forward' },
      { name: 'sceneryConifer-shadow', from: 3, to: 3, direction: 'forward' },
    ];
    const frames = {
      'sceneryCloud-0': {
        frame: { x: 220, y: 18, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 1,
      },
      'palette-red-1': {
        frame: { x: 90, y: 54, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
      'sceneryConifer-2': {
        frame: { x: 72, y: 54, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
      'sceneryConifer-shadow-3': {
        frame: { x: 54, y: 54, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
    };
    const slices = [
      {
        name: 'sceneryCloud',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 8, y: 12, w: 2, h: 3 } }],
      },
      {
        name: 'palette-red',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 7, y: 11, w: 3, h: 4 } }],
      },
      {
        name: 'sceneryConifer',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 7, y: 10, w: 3, h: 5 } }],
      },
      {
        name: 'sceneryConifer-shadow',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 7, y: 9, w: 3, h: 6 } }],
      },
    ];
    assertEquals(
      AtlasMetaParser.parseFilmByID(
        new CelIDFactory(),
        { meta: <Aseprite.Meta> (<unknown> { frameTags, slices }), frames },
        new Set([
          'sceneryCloud',
          'palette-red',
          'sceneryConifer',
          'sceneryConifer-shadow',
        ]),
      ),
      {
        sceneryCloud: {
          id: 'sceneryCloud',
          wh: U16XY(16, 16),
          cels: [
            {
              id: <CelID> 0,
              bounds: U16Box(221, 19, 16, 16),
              duration: U16Millis(1),
              sliceBounds: U16Box(8, 12, 2, 3),
              slices: [U16Box(8, 12, 2, 3)],
            },
          ],
          celIndexByDivision: [U16(0)],
          timeDivision: U32Millis(1),
          duration: U16Millis(1),
          direction: 'Forward',
        },
        'palette-red': {
          id: 'palette-red',
          wh: U16XY(16, 16),
          cels: [
            {
              id: <CelID> 1,
              bounds: U16Box(91, 55, 16, 16),
              duration: InfiniteDuration,
              sliceBounds: U16Box(7, 11, 3, 4),
              slices: [U16Box(7, 11, 3, 4)],
            },
          ],
          celIndexByDivision: [U16(0)],
          timeDivision: InfiniteDuration,
          duration: InfiniteDuration,
          direction: 'Forward',
        },
        sceneryConifer: {
          id: 'sceneryConifer',
          wh: U16XY(16, 16),
          cels: [
            {
              id: <CelID> 2,
              bounds: U16Box(73, 55, 16, 16),
              duration: InfiniteDuration,
              sliceBounds: U16Box(7, 10, 3, 5),
              slices: [U16Box(7, 10, 3, 5)],
            },
          ],
          celIndexByDivision: [U16(0)],
          timeDivision: InfiniteDuration,
          duration: InfiniteDuration,
          direction: 'Forward',
        },
        'sceneryConifer-shadow': {
          id: 'sceneryConifer-shadow',
          wh: U16XY(16, 16),
          cels: [
            {
              id: <CelID> 3,
              bounds: U16Box(55, 55, 16, 16),
              duration: InfiniteDuration,
              sliceBounds: U16Box(7, 9, 3, 6),
              slices: [U16Box(7, 9, 3, 6)],
            },
          ],
          celIndexByDivision: [U16(0)],
          timeDivision: InfiniteDuration,
          duration: InfiniteDuration,
          direction: 'Forward',
        },
      },
    );
  });

  await test.step('Throws Error on duplicate FrameTag.', () => {
    const frameTags = [
      { name: 'sceneryCloud', from: 0, to: 0, direction: 'forward' },
      { name: 'palette-red', from: 1, to: 1, direction: 'forward' },
      { name: 'sceneryCloud', from: 0, to: 0, direction: 'forward' },
    ];
    const frames = {
      'sceneryCloud 0': {
        frame: { x: 220, y: 18, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 1,
      },
      'palette-red 1': {
        frame: { x: 90, y: 54, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
    };
    assertThrows(() =>
      AtlasMetaParser.parseFilmByID(
        new CelIDFactory(),
        { meta: <Aseprite.Meta> (<unknown> { frameTags, slices: [] }), frames },
        new Set(['sceneryCloud', 'palette-red']),
      )
    );
  });
});

Deno.test('parseFilm()', async (test) => {
  await test.step('Parses FrameTag, Frame from Frame[], and Slice.', () => {
    const frameTag = { name: 'cloud s', from: 1, to: 1, direction: 'forward' };
    const frames = {
      'cloud xs-0': {
        frame: { x: 202, y: 36, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
      'cloud s-1': {
        frame: { x: 184, y: 36, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
      'cloud m-2': {
        frame: { x: 166, y: 36, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
    };
    const slices = [
      {
        name: 'cloud xs',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 4, y: 12, w: 7, h: 3 } }],
      },
      {
        name: 'cloud s',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 4, y: 11, w: 9, h: 4 } }],
      },
      {
        name: 'cloud m',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 3, y: 11, w: 10, h: 4 } }],
      },
    ];
    assertEquals(
      AtlasMetaParser.parseFilm(
        'cloud s',
        frameTag,
        frames,
        slices,
        new CelIDFactory(),
      ),
      {
        id: 'cloud s',
        wh: U16XY(16, 16),
        cels: [
          {
            id: <CelID> 0,
            bounds: U16Box(185, 37, 16, 16),
            duration: InfiniteDuration,
            sliceBounds: U16Box(4, 11, 9, 4),
            slices: [U16Box(4, 11, 9, 4)],
          },
        ],
        celIndexByDivision: [U16(0)],
        timeDivision: InfiniteDuration,
        duration: InfiniteDuration,
        direction: 'Forward',
      },
    );
  });

  await test.step('Ping-pong total duration is correct.', () => {
    const frameTag = { name: 'frog', from: 0, to: 3, direction: 'pingpong' };
    const frames = {
      'frog-0': {
        frame: { x: 0, y: 0, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 10,
      },
      'frog-1': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 12,
      },
      'frog-2': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 130,
      },
      'frog-3': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 1400,
      },
    };
    assertEquals(
      AtlasMetaParser.parseFilm(
        'frog',
        frameTag,
        frames,
        [],
        new CelIDFactory(),
      ).duration,
      10 + 12 + 130 + 1400 + 12 + 130,
    );
  });

  await test.step('Throws error on film with no cels.', () => {
    const frameTag = { name: 'frog', from: 1, to: 0, direction: 'forward' };
    const frames = {
      'frog.0': {
        frame: { x: 0, y: 0, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 0,
      },
      'frog.1': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 0,
      },
    };
    assertThrows(() =>
      AtlasMetaParser.parseFilm(
        'frog',
        frameTag,
        frames,
        [],
        new CelIDFactory(),
      )
    );
  });

  await test.step('Throws Error on intermediate Cel with infinite duration.', () => {
    const frameTag = { name: 'frog', from: 0, to: 1, direction: 'forward' };
    const frames = {
      'frog.0': {
        frame: { x: 0, y: 0, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 65535,
      },
      'frog.1': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 65535,
      },
    };
    assertThrows(() =>
      AtlasMetaParser.parseFilm(
        'frog',
        frameTag,
        frames,
        [],
        new CelIDFactory(),
      )
    );
  });

  await test.step('Throws Error when no Frame is associated with Tag.', () => {
    const frameTag = { name: 'frog', from: 0, to: 0, direction: 'forward' };
    assertThrows(() =>
      AtlasMetaParser.parseFilm(
        'frog',
        frameTag,
        {},
        [],
        new CelIDFactory(),
      )
    );
  });
});

Deno.test('parsePlayback()', async (test) => {
  for (const direction of Playback.values) {
    await test.step(
      `Direction ${direction}.`,
      () =>
        assertEquals(
          AtlasMetaParser.parsePlayback(direction.toLocaleLowerCase()),
          direction,
        ),
    );
  }

  await test.step('Invalid direction.', () => {
    assertThrows(() => AtlasMetaParser.parsePlayback('unknown'));
  });
});

Deno.test('isDirection()', async (test) => {
  for (const direction of Object.values(Aseprite.Direction)) {
    await test.step(
      `Direction ${direction}.`,
      () => assertEquals(AtlasMetaParser.isDirection(direction), true),
    );
  }

  await test.step('Unknown.', () =>
    assertEquals(AtlasMetaParser.isDirection('unknown'), false));
});

Deno.test('parseCel()', async (test) => {
  await test.step('Parses 1:1 texture mapping.', () => {
    const frameTag = { name: 'stem ', from: 0, to: 0, direction: 'forward' };
    const frame = {
      frame: { x: 130, y: 18, w: 18, h: 18 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
      sourceSize: { w: 16, h: 16 },
      duration: 65535,
    };
    const slices = [
      {
        name: 'stem ',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 4, y: 4, w: 8, h: 12 } }],
      },
    ];
    assertEquals(
      AtlasMetaParser.parseCel(
        frameTag,
        frame,
        0,
        slices,
        new CelIDFactory(),
      ),
      {
        id: <CelID> 0,
        bounds: U16Box(131, 19, 16, 16),
        duration: InfiniteDuration,
        sliceBounds: U16Box(4, 4, 8, 12),
        slices: [U16Box(4, 4, 8, 12)],
      },
    );
  });
});

Deno.test('parseBounds()', async (test) => {
  await test.step('Parses 1:1 texture mapping.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 3, h: 4 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
      sourceSize: { w: 3, h: 4 },
      duration: 1,
    };
    assertEquals(AtlasMetaParser.parseBounds(frame), U16Box(1, 2, 3, 4));
  });

  await test.step('Parses texture mapping with padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 5, h: 6 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
      sourceSize: { w: 3, h: 4 },
      duration: 1,
    };
    assertEquals(AtlasMetaParser.parseBounds(frame), U16Box(2, 3, 3, 4));
  });
});

Deno.test('parsePadding()', async (test) => {
  await test.step('Parses zero padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 3, h: 4 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
      sourceSize: { w: 3, h: 4 },
      duration: 1,
    };
    assertEquals(AtlasMetaParser.parsePadding(frame), U16XY(0, 0));
  });

  await test.step('Fails on indivisible padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 4, h: 5 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
      sourceSize: { w: 3, h: 4 },
      duration: 1,
    };
    assertThrows(() => AtlasMetaParser.parsePadding(frame));
  });

  await test.step('Parses nonzero padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 6, h: 6 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 4, h: 4 },
      sourceSize: { w: 4, h: 4 },
      duration: 1,
    };
    assertEquals(AtlasMetaParser.parsePadding(frame), U16XY(2, 2));
  });

  await test.step('Parses mixed padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 6, h: 10 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 4, h: 6 },
      sourceSize: { w: 4, h: 6 },
      duration: 1,
    };
    assertEquals(AtlasMetaParser.parsePadding(frame), U16XY(2, 4));
  });
});

Deno.test('parseDuration()', async (test) => {
  await test.step('Parses finite duration.', () =>
    assertEquals(AtlasMetaParser.parseDuration(1), 1));

  await test.step('Parses infinite duration.', () =>
    assertEquals(
      AtlasMetaParser.parseDuration(65535),
      InfiniteDuration,
    ));

  await test.step('Parses negative duration.', () => {
    assertThrows(() => AtlasMetaParser.parseDuration(-1));
  });

  await test.step('Parses zero duration.', () => {
    assertThrows(() => AtlasMetaParser.parseDuration(0));
  });
});

Deno.test('parseSlices()', async (test) => {
  await test.step('Converts Slice to Rect[].', () => {
    const frameTag = { name: 'stem ', from: 0, to: 0, direction: 'forward' };
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [{ frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
    ];
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, slices), [
      U16Box(0, 1, 2, 3),
    ]);
  });

  await test.step('Filters out unrelated Tags.', () => {
    const frameTag = { name: 'stem ', from: 0, to: 0, direction: 'forward' };
    const slices = [
      {
        name: 'unrelated ',
        color: '#00000000',
        keys: [{ frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
    ];
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, slices), []);
  });

  await test.step('Filters out unrelated Frame number Keys.', () => {
    const frameTag = { name: 'stem ', from: 0, to: 2, direction: 'forward' };
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [
          { frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } },
          { frame: 1, bounds: { x: 4, y: 5, w: 6, h: 7 } },
          { frame: 2, bounds: { x: 8, y: 9, w: 10, h: 11 } },
        ],
      },
    ];
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 1, slices), [
      U16Box(4, 5, 6, 7),
    ]);
  });

  await test.step('Converts Slice with multiple Keys to Rect[].', () => {
    const frameTag = { name: 'stem ', from: 0, to: 1, direction: 'forward' };
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [
          { frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } },
          { frame: 1, bounds: { x: 4, y: 5, w: 6, h: 7 } },
        ],
      },
    ];
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, slices), [
      U16Box(0, 1, 2, 3),
    ]);
  });

  await test.step('Converts no Slices.', () => {
    const frameTag = { name: 'stem ', from: 0, to: 0, direction: 'forward' };
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, []), []);
  });

  await test.step('Converts multiple Slices.', () => {
    const frameTag = { name: 'stem ', from: 0, to: 1, direction: 'forward' };
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [
          { frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } },
          { frame: 1, bounds: { x: 4, y: 5, w: 6, h: 7 } },
          { frame: 2, bounds: { x: 12, y: 13, w: 14, h: 15 } },
        ],
      },
      {
        name: 'unrelated ',
        color: '#00000000',
        keys: [{ frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
      {
        name: 'stem ',
        color: '#00000000',
        keys: [{ frame: 1, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
      {
        name: 'stem ',
        color: '#00000000',
        keys: [{ frame: 0, bounds: { x: 8, y: 9, w: 10, h: 11 } }],
      },
    ];
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 1, slices), [
      U16Box(4, 5, 6, 7),
      U16Box(0, 1, 2, 3),
      U16Box(8, 9, 10, 11),
    ]);
  });

  await test.step('Parses no Slices when none are relevant for the Frame index.', () => {
    const frameTag = { name: 'stem ', from: 0, to: 0, direction: 'forward' };
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [{ frame: 1, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
    ];
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, slices), []);
  });
});
