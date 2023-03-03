import {
  Aseprite,
  AtlasMetaParser,
  CelID,
  CelIDFactory,
  InfiniteDuration,
} from '@/atlas-pack'
import { I16Box, U16, U16Box, U16XY, U32 } from '@/ooz'
import { assertEquals, assertThrows } from 'std/testing/asserts.ts'

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
        wh: new U16XY(1, 2),
        filmByID: {},
        celBoundsByID: [],
      },
    )
  })
})

Deno.test('parseFilmByID()', async (test) => {
  await test.step('Parses films.', () => {
    const frameTags = [
      { name: 'scenery-Cloud', from: 0, to: 0, direction: 'forward' },
      { name: 'palette-red', from: 1, to: 1, direction: 'forward' },
      { name: 'scenery-Conifer', from: 2, to: 2, direction: 'forward' },
      { name: 'scenery-ConiferShadow', from: 3, to: 3, direction: 'forward' },
    ]
    const frames = {
      'scenery-Cloud-0': {
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
      'scenery-Conifer-2': {
        frame: { x: 72, y: 54, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
      'scenery-ConiferShadow-3': {
        frame: { x: 54, y: 54, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
    }
    const slices = [
      {
        name: 'scenery-Cloud',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 8, y: 12, w: 2, h: 3 } }],
      },
      {
        name: 'palette-red',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 7, y: 11, w: 3, h: 4 } }],
      },
      {
        name: 'scenery-Conifer',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 7, y: 10, w: 3, h: 5 } }],
      },
      {
        name: 'scenery-ConiferShadow',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 7, y: 9, w: 3, h: 6 } }],
      },
    ]
    assertEquals(
      AtlasMetaParser.parseFilmByID(
        new CelIDFactory(),
        { meta: <Aseprite.Meta> (<unknown> { frameTags, slices }), frames },
        new Set([
          'scenery-Cloud',
          'palette-red',
          'scenery-Conifer',
          'scenery-ConiferShadow',
        ]),
      ),
      {
        'scenery-Cloud': {
          id: 'scenery-Cloud',
          wh: new U16XY(16, 16),
          cels: [
            {
              id: <CelID> 0,
              bounds: new U16Box(221, 19, 16, 16),
              duration: U16(1),
              sliceBounds: new I16Box(8, 12, 2, 3),
              slices: [new I16Box(8, 12, 2, 3)],
            },
          ],
          period: U32(1),
          duration: U16(1),
          direction: 'Forward',
          loops: Number.POSITIVE_INFINITY,
        },
        'palette-red': {
          id: 'palette-red',
          wh: new U16XY(16, 16),
          cels: [
            {
              id: <CelID> 1,
              bounds: new U16Box(91, 55, 16, 16),
              duration: InfiniteDuration,
              sliceBounds: new I16Box(7, 11, 3, 4),
              slices: [new I16Box(7, 11, 3, 4)],
            },
          ],
          period: InfiniteDuration,
          duration: InfiniteDuration,
          direction: 'Forward',
          loops: Number.POSITIVE_INFINITY,
        },
        'scenery-Conifer': {
          id: 'scenery-Conifer',
          wh: new U16XY(16, 16),
          cels: [
            {
              id: <CelID> 2,
              bounds: new U16Box(73, 55, 16, 16),
              duration: InfiniteDuration,
              sliceBounds: new I16Box(7, 10, 3, 5),
              slices: [new I16Box(7, 10, 3, 5)],
            },
          ],
          period: InfiniteDuration,
          duration: InfiniteDuration,
          direction: 'Forward',
          loops: Number.POSITIVE_INFINITY,
        },
        'scenery-ConiferShadow': {
          id: 'scenery-ConiferShadow',
          wh: new U16XY(16, 16),
          cels: [
            {
              id: <CelID> 3,
              bounds: new U16Box(55, 55, 16, 16),
              duration: InfiniteDuration,
              sliceBounds: new I16Box(7, 9, 3, 6),
              slices: [new I16Box(7, 9, 3, 6)],
            },
          ],
          period: InfiniteDuration,
          duration: InfiniteDuration,
          direction: 'Forward',
          loops: Number.POSITIVE_INFINITY,
        },
      },
    )
  })

  await test.step('Throws Error on duplicate FrameTag.', () => {
    const frameTags = [
      { name: 'scenery-Cloud', from: 0, to: 0, direction: 'forward' },
      { name: 'palette-red', from: 1, to: 1, direction: 'forward' },
      { name: 'scenery-Cloud', from: 0, to: 0, direction: 'forward' },
    ]
    const frames = {
      'scenery-Cloud-0': {
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
    }
    assertThrows(() =>
      AtlasMetaParser.parseFilmByID(
        new CelIDFactory(),
        { meta: <Aseprite.Meta> (<unknown> { frameTags, slices: [] }), frames },
        new Set(['scenery-Cloud', 'palette-red']),
      )
    )
  })
})

Deno.test('parseFilm()', async (test) => {
  await test.step('Parses FrameTag, Frame from Frame[], and Slice.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'cloud-s',
      from: 1,
      to: 1,
      direction: 'forward',
    }
    const frames = {
      'cloud-xs-0': {
        frame: { x: 202, y: 36, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
      'cloud-s-1': {
        frame: { x: 184, y: 36, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
      'cloud-m-2': {
        frame: { x: 166, y: 36, w: 18, h: 18 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
        sourceSize: { w: 16, h: 16 },
        duration: 65535,
      },
    }
    const slices = [
      {
        name: 'cloud-xs',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 4, y: 12, w: 7, h: 3 } }],
      },
      {
        name: 'cloud-s',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 4, y: 11, w: 9, h: 4 } }],
      },
      {
        name: 'cloud-m',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 3, y: 11, w: 10, h: 4 } }],
      },
    ] as const
    assertEquals(
      AtlasMetaParser.parseFilm(
        'cloud-s',
        frameTag,
        frames,
        slices,
        new CelIDFactory(),
      ),
      {
        id: 'cloud-s',
        wh: new U16XY(16, 16),
        cels: [
          {
            id: <CelID> 0,
            bounds: new U16Box(185, 37, 16, 16),
            duration: InfiniteDuration,
            sliceBounds: new I16Box(4, 11, 9, 4),
            slices: [new I16Box(4, 11, 9, 4)],
          },
        ],
        period: InfiniteDuration,
        duration: InfiniteDuration,
        direction: 'Forward',
        loops: Number.POSITIVE_INFINITY,
      },
    )
  })

  await test.step('Ping-pong total duration is correct.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'frog-idle',
      from: 0,
      to: 3,
      direction: 'pingpong',
      repeat: '1',
    }
    const frames: Aseprite.FrameMap = {
      'frog-idle-0': {
        frame: { x: 0, y: 0, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 10,
      },
      'frog-idle-1': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 12,
      },
      'frog-idle-2': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 130,
      },
      'frog-idle-3': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 1400,
      },
    }
    assertEquals(
      AtlasMetaParser.parseFilm(
        'frog-idle',
        frameTag,
        frames,
        [],
        new CelIDFactory(),
      ).duration,
      10 + 12 + 130 + 1400 + 12 + 130,
    )
  })

  await test.step('Throws error on film with no cels.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'frog-walk',
      from: 1,
      to: 0,
      direction: 'forward',
    }
    const frames = {
      'frog-walk-0': {
        frame: { x: 0, y: 0, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 0,
      },
      'frog-walk-1': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 0,
      },
    }
    assertThrows(() =>
      AtlasMetaParser.parseFilm(
        'frog-walk',
        frameTag,
        frames,
        [],
        new CelIDFactory(),
      )
    )
  })

  await test.step('Throws Error on intermediate Cel with infinite duration.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'frog-walk',
      from: 0,
      to: 1,
      direction: 'forward',
      repeat: '1',
    }
    const frames = {
      'frog-walk-0': {
        frame: { x: 0, y: 0, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 65535,
      },
      'frog-walk-1': {
        frame: { x: 1, y: 1, w: 0, h: 0 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 },
        duration: 65535,
      },
    }
    assertThrows(() =>
      AtlasMetaParser.parseFilm(
        'frog-walk',
        frameTag,
        frames,
        [],
        new CelIDFactory(),
      )
    )
  })

  await test.step('Throws Error when no Frame is associated with Tag.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'frog-walk',
      from: 0,
      to: 0,
      direction: 'forward',
    }
    assertThrows(() =>
      AtlasMetaParser.parseFilm(
        'frog-walk',
        frameTag,
        {},
        [],
        new CelIDFactory(),
      )
    )
  })
})

Deno.test('parsePlayback()', async (test) => {
  for (const [playback, direction] of Object.entries(Aseprite.Direction)) {
    await test.step(
      `Direction ${playback}.`,
      () =>
        assertEquals(
          AtlasMetaParser.parsePlayback(direction),
          playback,
        ),
    )
  }

  await test.step('Invalid direction.', () => {
    assertThrows(() => AtlasMetaParser.parsePlayback('unknown'))
  })
})

Deno.test('isDirection()', async (test) => {
  for (const direction of Object.values(Aseprite.Direction)) {
    await test.step(
      `Direction ${direction}.`,
      () => assertEquals(AtlasMetaParser.isDirection(direction), true),
    )
  }

  await test.step('Unknown.', () =>
    assertEquals(AtlasMetaParser.isDirection('unknown'), false))
})

Deno.test('parseCel()', async (test) => {
  await test.step('Parses 1:1 texture mapping.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'stem-foo',
      from: 0,
      to: 0,
      direction: 'forward',
    }
    const frame = {
      frame: { x: 130, y: 18, w: 18, h: 18 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
      sourceSize: { w: 16, h: 16 },
      duration: 65535,
    }
    const slices = [
      {
        name: 'stem-foo',
        color: '#0000ffff',
        keys: [{ frame: 0, bounds: { x: 4, y: 4, w: 8, h: 12 } }],
      },
    ] as const
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
        bounds: new U16Box(131, 19, 16, 16),
        duration: InfiniteDuration,
        sliceBounds: new I16Box(4, 4, 8, 12),
        slices: [new I16Box(4, 4, 8, 12)],
      },
    )
  })
})

Deno.test('parseBounds()', async (test) => {
  await test.step('Parses 1:1 texture mapping.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 3, h: 4 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
      sourceSize: { w: 3, h: 4 },
      duration: 1,
    }
    assertEquals(AtlasMetaParser.parseBounds(frame), new U16Box(1, 2, 3, 4))
  })

  await test.step('Parses texture mapping with padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 5, h: 6 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
      sourceSize: { w: 3, h: 4 },
      duration: 1,
    }
    assertEquals(AtlasMetaParser.parseBounds(frame), new U16Box(2, 3, 3, 4))
  })
})

Deno.test('parsePadding()', async (test) => {
  await test.step('Parses zero padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 3, h: 4 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
      sourceSize: { w: 3, h: 4 },
      duration: 1,
    }
    assertEquals(AtlasMetaParser.parsePadding(frame), new U16XY(0, 0))
  })

  await test.step('Fails on indivisible padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 4, h: 5 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
      sourceSize: { w: 3, h: 4 },
      duration: 1,
    }
    assertThrows(() => AtlasMetaParser.parsePadding(frame))
  })

  await test.step('Parses nonzero padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 6, h: 6 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 4, h: 4 },
      sourceSize: { w: 4, h: 4 },
      duration: 1,
    }
    assertEquals(AtlasMetaParser.parsePadding(frame), new U16XY(2, 2))
  })

  await test.step('Parses mixed padding.', () => {
    const frame = {
      frame: { x: 1, y: 2, w: 6, h: 10 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 4, h: 6 },
      sourceSize: { w: 4, h: 6 },
      duration: 1,
    }
    assertEquals(AtlasMetaParser.parsePadding(frame), new U16XY(2, 4))
  })
})

Deno.test('parseDuration()', async (test) => {
  await test.step('Parses finite duration.', () =>
    assertEquals(AtlasMetaParser.parseDuration(1), 1))

  await test.step('Parses infinite duration.', () =>
    assertEquals(
      AtlasMetaParser.parseDuration(65535),
      InfiniteDuration,
    ))

  await test.step('Parses negative duration.', () => {
    assertThrows(() => AtlasMetaParser.parseDuration(-1))
  })

  await test.step('Parses zero duration.', () => {
    assertThrows(() => AtlasMetaParser.parseDuration(0))
  })
})

Deno.test('parseSlices()', async (test) => {
  await test.step('Converts Slice to Box[].', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'stem-foo',
      from: 0,
      to: 0,
      direction: 'forward',
    }
    const slices = [
      {
        name: 'stem-foo',
        color: '#00000000',
        keys: [{ frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
    ] as const
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, slices), [
      new I16Box(0, 1, 2, 3),
    ])
  })

  await test.step('Filters out unrelated Tags.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'stem-foo',
      from: 0,
      to: 0,
      direction: 'forward',
    }
    const slices = [
      {
        name: 'unrelated-bar',
        color: '#00000000',
        keys: [{ frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
    ] as const
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, slices), [])
  })

  await test.step('Filters out unrelated Frame number Keys.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'stem-foo',
      from: 0,
      to: 2,
      direction: 'forward',
    }
    const slices = [
      {
        name: 'stem-foo',
        color: '#00000000',
        keys: [
          { frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } },
          { frame: 1, bounds: { x: 4, y: 5, w: 6, h: 7 } },
          { frame: 2, bounds: { x: 8, y: 9, w: 10, h: 11 } },
        ],
      },
    ] as const
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 1, slices), [
      new I16Box(4, 5, 6, 7),
    ])
  })

  await test.step('Converts Slice with multiple Keys to Box[].', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'stem-foo',
      from: 0,
      to: 1,
      direction: 'forward',
    }
    const slices = [
      {
        name: 'stem-foo',
        color: '#00000000',
        keys: [
          { frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } },
          { frame: 1, bounds: { x: 4, y: 5, w: 6, h: 7 } },
        ],
      },
    ] as const
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, slices), [
      new I16Box(0, 1, 2, 3),
    ])
  })

  await test.step('Converts no Slices.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'stem-foo',
      from: 0,
      to: 0,
      direction: 'forward',
    }
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, []), [])
  })

  await test.step('Converts multiple Slices.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'stem-foo',
      from: 0,
      to: 1,
      direction: 'forward',
    }
    const slices = [
      {
        name: 'stem-foo',
        color: '#00000000',
        keys: [
          { frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } },
          { frame: 1, bounds: { x: 4, y: 5, w: 6, h: 7 } },
          { frame: 2, bounds: { x: 12, y: 13, w: 14, h: 15 } },
        ],
      },
      {
        name: 'unrelated-bar',
        color: '#00000000',
        keys: [{ frame: 0, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
      {
        name: 'stem-foo',
        color: '#00000000',
        keys: [{ frame: 1, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
      {
        name: 'stem-foo',
        color: '#00000000',
        keys: [{ frame: 0, bounds: { x: 8, y: 9, w: 10, h: 11 } }],
      },
    ] as const
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 1, slices), [
      new I16Box(4, 5, 6, 7),
      new I16Box(0, 1, 2, 3),
      new I16Box(8, 9, 10, 11),
    ])
  })

  await test.step('Parses no Slices when none are relevant for the Frame index.', () => {
    const frameTag: Aseprite.FrameTag = {
      name: 'stem-foo',
      from: 0,
      to: 0,
      direction: 'forward',
    }
    const slices = [
      {
        name: 'stem-foo',
        color: '#00000000',
        keys: [{ frame: 1, bounds: { x: 0, y: 1, w: 2, h: 3 } }],
      },
    ] as const
    assertEquals(AtlasMetaParser.parseSlices(frameTag, 0, slices), [])
  })
})
