import { Animator, CelID, Playback } from '@/atlas-pack'
import { I16Box, U16, U16Box, U16XY, U32 } from '@/ooz'
import { assertEquals } from 'std/testing/asserts.ts'
import { Aseprite } from './aseprite.ts'
import { AtlasMetaParser } from './atlas-meta-parser.ts'
import { Film } from './film.ts'

Deno.test('Animator()', async (test) => {
  await test.step('Exposure < duration.', () => {
    const cel = {
      id: <CelID> 0,
      bounds: new U16Box(1, 2, 3, 4),
      duration: U16(1),
      sliceBounds: new I16Box(1, 1, 2, 2),
      slices: [],
    }
    const film = {
      id: 'filename--Tag' as const,
      wh: new U16XY(0, 0),
      cels: [cel, cel],
      period: U32(1),
      duration: U16(2),
      direction: 'Forward' as const,
      loops: Number.POSITIVE_INFINITY,
    }
    const animator = new Animator(film, 0.5)
    const index = animator.index(0.5)
    assertEquals(index, 0)
  })

  await test.step('Exposure === duration.', () => {
    const cel = {
      id: <CelID> 0,
      bounds: new U16Box(1, 2, 3, 4),
      duration: U16(1),
      sliceBounds: new I16Box(1, 1, 2, 2),
      slices: [],
    }
    const film = {
      id: 'filename--Tag' as const,
      wh: new U16XY(0, 0),
      cels: [cel, cel],
      period: U32(1),
      duration: U16(2),
      direction: 'Forward' as const,
      loops: Number.POSITIVE_INFINITY,
    }
    const animator = new Animator(film)
    const index = animator.index(1)
    assertEquals(index, 1)
  })

  await test.step('Exposure > duration.', () => {
    const cel = {
      id: <CelID> 0,
      bounds: new U16Box(1, 2, 3, 4),
      duration: U16(1),
      sliceBounds: new I16Box(1, 1, 2, 2),
      slices: [],
    }
    const film = {
      id: 'filename--Tag' as const,
      wh: new U16XY(0, 0),
      cels: [cel, cel],
      period: U32(1),
      duration: U16(2),
      direction: 'Forward' as const,
      loops: Number.POSITIVE_INFINITY,
    }
    const animator = new Animator(film)
    const index = animator.index(1.5)
    assertEquals(index, 1)
  })

  await test.step('Different durations.', () => {
    const film = {
      id: 'filename--Tag' as const,
      wh: new U16XY(0, 0),
      cels: [
        {
          id: <CelID> 0,
          bounds: new U16Box(1, 2, 3, 4),
          duration: U16(1),
          sliceBounds: new I16Box(1, 1, 2, 2),
          slices: [],
        },
        ...Array(1000).fill({
          id: <CelID> 1,
          bounds: new U16Box(1, 2, 3, 4),
          duration: U16(1000),
          sliceBounds: new I16Box(1, 1, 2, 2),
          slices: [],
        }),
      ],
      period: U32(1),
      duration: U32(1001),
      direction: 'Forward' as const,
      loops: Number.POSITIVE_INFINITY,
    }
    const animator = new Animator(film)
    assertEquals(animator.index(0.5), 0)
    assertEquals(animator.index(100), 100)
  })

  await test.step('Different durations ping-pong reverse.', () => {
    const film = {
      id: 'filename--Tag' as const,
      wh: new U16XY(0, 0),
      cels: [
        {
          id: <CelID> 0,
          bounds: new U16Box(1, 2, 3, 4),
          duration: U16(1),
          sliceBounds: new I16Box(1, 1, 2, 2),
          slices: [],
        },
        ...Array(10).fill({
          id: <CelID> 1,
          bounds: new U16Box(1, 2, 3, 4),
          duration: U16(10),
          sliceBounds: new I16Box(1, 1, 2, 2),
          slices: [],
        }),
      ],
      period: U32(1),
      duration: U32(11),
      direction: 'PingPongReverse' as const,
      loops: Number.POSITIVE_INFINITY,
    }
    const animator = new Animator(film)
    assertEquals(animator.index(0), 10)
    assertEquals(animator.cel(0).id, 1)
    assertEquals(animator.index(1), 9)
    assertEquals(animator.cel(1).id, 1)
    assertEquals(animator.index(2), 8)
    assertEquals(animator.cel(2).id, 1)
    assertEquals(animator.index(3), 7)
    assertEquals(animator.cel(3).id, 1)
    assertEquals(animator.index(4), 6)
    assertEquals(animator.cel(4).id, 1)
    assertEquals(animator.index(5), 5)
    assertEquals(animator.cel(5).id, 1)
    assertEquals(animator.index(6), 4)
    assertEquals(animator.cel(6).id, 1)
    assertEquals(animator.index(7), 3)
    assertEquals(animator.cel(7).id, 1)
    assertEquals(animator.index(8), 2)
    assertEquals(animator.cel(8).id, 1)
    assertEquals(animator.index(9), 1)
    assertEquals(animator.cel(9).id, 1)
    assertEquals(animator.index(10), 0)
    assertEquals(animator.cel(10).id, 0)
    assertEquals(animator.index(11), 10)
    assertEquals(animator.cel(11).id, 1)
    assertEquals(animator.index(12), 9)
    assertEquals(animator.cel(12).id, 1)
    assertEquals(animator.index(13), 8)
    assertEquals(animator.cel(13).id, 1)
    assertEquals(animator.index(14), 7)
    assertEquals(animator.cel(14).id, 1)
    assertEquals(animator.index(15), 6)
    assertEquals(animator.cel(15).id, 1)
    assertEquals(animator.index(16), 5)
    assertEquals(animator.cel(16).id, 1)
    assertEquals(animator.index(17), 4)
    assertEquals(animator.cel(17).id, 1)
    assertEquals(animator.index(18), 3)
    assertEquals(animator.cel(18).id, 1)
    assertEquals(animator.index(19), 2)
    assertEquals(animator.cel(19).id, 1)
    assertEquals(animator.index(20), 1)
    assertEquals(animator.cel(20).id, 1)
    assertEquals(animator.index(21), 0)
    assertEquals(animator.cel(21).id, 0)
    assertEquals(animator.index(22), 10)
    assertEquals(animator.cel(22).id, 1)
    assertEquals(animator.index(23), 9)
    assertEquals(animator.cel(23).id, 1)
    assertEquals(animator.index(24), 8)
    assertEquals(animator.cel(24).id, 1)
    assertEquals(animator.index(25), 7)
    assertEquals(animator.cel(25).id, 1)
    assertEquals(animator.index(26), 6)
    assertEquals(animator.cel(26).id, 1)
    assertEquals(animator.index(27), 5)
    assertEquals(animator.cel(27).id, 1)
    assertEquals(animator.index(28), 4)
    assertEquals(animator.cel(28).id, 1)
    assertEquals(animator.index(29), 3)
    assertEquals(animator.cel(29).id, 1)
    assertEquals(animator.index(30), 2)
    assertEquals(animator.cel(30).id, 1)
    assertEquals(animator.index(31), 1)
    assertEquals(animator.cel(31).id, 1)
    assertEquals(animator.index(32), 0)
    assertEquals(animator.cel(32).id, 0)
  })
})

Deno.test('reset()', () => {
  const cel = {
    id: <CelID> 0,
    bounds: new U16Box(0, 0, 0, 0),
    duration: U16(1),
    sliceBounds: new I16Box(1, 1, 2, 2),
    slices: [],
  }
  const film = {
    id: 'filename--Tag' as const,
    wh: new U16XY(0, 0),
    cels: [cel, cel],
    duration: U16(2),
    period: U32(1),
    direction: 'Forward' as const,
    loops: Number.POSITIVE_INFINITY,
  }
  const animator = new Animator(film)
  let index = animator.index(1.5)
  assertEquals(index, 1)
  animator.reset(2)
  index = animator.index(2)
  assertEquals(index, 0)
})

Deno.test('index()', async (test) => {
  for (const direction of Playback.values) {
    await test.step(`Direction ${direction} array start.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'filename--Tag' as const,
        wh: new U16XY(0, 0),
        cels: [cel, cel],
        period: U32(1),
        duration: U16(2),
        direction,
        loops: Number.POSITIVE_INFINITY,
      }
      const animator = new Animator(film)
      const index = animator.index(1)
      const expected = {
        Forward: 1,
        Reverse: 0,
        PingPong: 1,
        PingPongReverse: 0,
      }
      assertEquals(index, expected[direction])
    })
  }

  for (const direction of Playback.values) {
    await test.step(`Direction ${direction} array end.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'filename--Tag' as const,
        wh: new U16XY(0, 0),
        cels: [cel, cel],
        period: U32(1),
        duration: U16(2),
        direction,
        loops: Number.POSITIVE_INFINITY,
      }
      const animator = new Animator(film)
      const index = animator.index(2)
      const expected = {
        Forward: 0,
        Reverse: 1,
        PingPong: 0,
        PingPongReverse: 1,
      }
      assertEquals(index, expected[direction])
    })
  }

  for (
    const [direction, ids] of [
      [
        'forward',
        // deno-fmt-ignore
        [0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4],
      ],
      [
        'reverse',
        // deno-fmt-ignore
        [4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0],
      ],
      [
        // An monotonically increasing input time is mapped to a cel.
        // time input                  0  1  2  3  4  5  6  7  8  9 10 11
        //                12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
        //                28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43
        //                44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59
        // unique mapping -4 -3 -2 -1  0  1  2  3  4  5  6  7  8  9 10 11
        // index           6  5  4  3  0  1  2  3  4  5  6  7  8  9 10 11
        // cel.id          3  2  2  1  0  0  0  1  2  2  3  4  4  4  4  4
        'pingpong',
        // deno-fmt-ignore
        [0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4],
      ],
      [
        'pingpong_reverse',
        // deno-fmt-ignore
        [4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 0, 0],
      ],
    ] as [Aseprite.Direction, number[]][]
  ) {
    await test.step(`Direction ${direction} different durations.`, () => {
      const film: Film = {
        id: 'filename--Tag',
        wh: new U16XY(0, 0),
        cels: [
          ...Array(3).fill({
            id: <CelID> 0,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(3),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          }),
          {
            id: <CelID> 1,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(1),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          },
          ...Array(2).fill({
            id: <CelID> 2,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(2),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          }),
          {
            id: <CelID> 3,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(1),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          },
          ...Array(5).fill({
            id: <CelID> 4,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(5),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          }),
        ],
        period: U32(1),
        duration: U32(
          (direction === 'forward' || direction === 'reverse') ? 12 : 16, // 3 + 1 + 2 + 1 + 5 + 1 + 2 + 1
        ),
        direction: AtlasMetaParser.parsePlayback(direction),
        loops: 1000,
      }
      const meta = AtlasMetaParser.parse({
        frames: {
          'filename--Tag--0': {
            duration: 3,
            frame: { x: 1, y: 2, w: 3, h: 4 },
            sourceSize: { w: 3, h: 4 },
            spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
          },
          'filename--Tag--1': {
            duration: 1,
            frame: { x: 4, y: 2, w: 3, h: 4 },
            sourceSize: { w: 3, h: 4 },
            spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
          },
          'filename--Tag--2': {
            duration: 2,
            frame: { x: 7, y: 6, w: 3, h: 4 },
            sourceSize: { w: 3, h: 4 },
            spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
          },
          'filename--Tag--3': {
            duration: 1,
            frame: { x: 10, y: 6, w: 3, h: 4 },
            sourceSize: { w: 3, h: 4 },
            spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
          },
          'filename--Tag--4': {
            duration: 5,
            frame: { x: 13, y: 6, w: 3, h: 4 },
            sourceSize: { w: 3, h: 4 },
            spriteSourceSize: { x: 0, y: 0, w: 3, h: 4 },
          },
        },
        meta: {
          frameTags: [
            { name: 'filename--Tag', direction, from: 0, to: 4, repeat: 1000 },
          ],
          slices: [],
          size: { w: 128, h: 128 },
        },
      })
      assertEquals(meta.celBoundsByID[film.cels[0]!.id], new U16Box(1, 2, 3, 4))
      assertEquals(meta.celBoundsByID[film.cels[1]!.id], new U16Box(1, 2, 3, 4))
      assertEquals(meta.celBoundsByID[film.cels[2]!.id], new U16Box(1, 2, 3, 4))
      assertEquals(meta.celBoundsByID[film.cels[3]!.id], new U16Box(1, 2, 3, 4))
      assertEquals(meta.celBoundsByID[film.cels[4]!.id], new U16Box(1, 2, 3, 4))
      assertEquals(meta.filmByID['filename--Tag'], film)

      const animator = new Animator(film)
      for (let i = 0, time = 0; time < 50; time++, i++) {
        const id = animator.cel(time).id
        assertEquals(
          id,
          ids[i],
          `ID ${id} !== expected ID ${ids[i]} at time ${time} (index ${i}).`,
        )
      }
    })
  }

  for (
    const [direction, ids] of [
      [
        'forward',
        // deno-fmt-ignore
        [0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      ],
      [
        'reverse',
        // deno-fmt-ignore
        [4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      [
        'pingpong',
        // deno-fmt-ignore
        [0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      [
        'pingpong_reverse',
        // deno-fmt-ignore
        [4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0, 0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      ],
    ] as [Aseprite.Direction, number[]][]
  ) {
    await test.step(`Loop-limited Direction ${direction} different durations.`, () => {
      const film: Film = {
        id: 'filename--Tag',
        wh: new U16XY(0, 0),
        cels: [
          ...Array(3).fill({
            id: <CelID> 0,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(3),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          }),
          {
            id: <CelID> 1,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(1),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          },
          ...Array(2).fill({
            id: <CelID> 2,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(2),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          }),
          {
            id: <CelID> 3,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(1),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          },
          ...Array(5).fill({
            id: <CelID> 4,
            bounds: new U16Box(1, 2, 3, 4),
            duration: U16(5),
            sliceBounds: new I16Box(1, 1, 2, 2),
            slices: [],
          }),
        ],
        period: U32(1),
        duration: U32(
          (direction === 'forward' || direction === 'reverse') ? 12 : 16, // 3 + 1 + 2 + 1 + 5 + 1 + 2 + 1
        ),
        direction: AtlasMetaParser.parsePlayback(direction),
        loops: 2,
      }
      const animator = new Animator(film)
      for (let i = 0, time = 0; time < 60; time++, i++) {
        const id = animator.cel(time).id
        assertEquals(
          id,
          ids[i],
          `ID ${id} !== expected ID ${ids[i]} at time ${time} (index ${i}).`,
        )
      }
    })
  }

  for (
    const [direction, offset, expected] of [
      [
        'Forward',
        0,
        [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],
      ],
      [
        'Forward',
        10 * 4,
        [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],
      ],
      [
        'Reverse',
        0,
        [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0],
      ],
      [
        'Reverse',
        10 * 4,
        [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0],
      ],
      [
        'Reverse',
        1,
        [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3],
      ],
      [
        'PingPong',
        2,
        [2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3],
      ],
      [
        'PingPong',
        0,
        [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1],
      ],
      [
        'PingPong',
        3,
        [3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2],
      ],
      [
        'PingPongReverse',
        2,
        [1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0],
      ],
      [
        'PingPongReverse',
        0,
        [3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2],
      ],
      [
        'PingPongReverse',
        3,
        [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1],
      ],
    ] as [Playback, number, number[]][]
  ) {
    await test.step(`Direction ${direction} offset ${offset}.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'filename--Tag' as const,
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel],
        period: U32(1),
        duration: U16(4),
        direction,
        loops: Number.POSITIVE_INFINITY,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 5; ++i) {
        playback.push(animator.index(offset + 1 * i))
      }
      assertEquals(playback, expected)
    })
  }

  for (const direction of Playback.values) {
    await test.step(`Exposure === duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'filename--Tag' as const,
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
        loops: Number.POSITIVE_INFINITY,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 3; ++i) {
        playback.push(animator.index(1 * i))
      }
      // deno-fmt-ignore
      const expected = {
        Forward:         [0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4],
        Reverse:         [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        PingPong:        [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2],
        PingPongReverse: [4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2],
      }
      assertEquals(playback, expected[direction])
    })
  }

  for (const direction of Playback.values) {
    await test.step(`Exposure > duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'filename--Tag' as const,
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
        loops: Number.POSITIVE_INFINITY,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 3; ++i) {
        playback.push(animator.index(6 * i))
      }
      // deno-fmt-ignore
      const expected = {
        // time            0   6  12  18  24  30  36  42  48  54  60  66  72  78  84
        // % 5             0   1   2   3   4   0   1   2   3   4   0   1   2   3   4
        Forward:         [ 0,  1,  2,  3,  4,  0,  1,  2,  3,  4,  0,  1,  2,  3,  4],
        Reverse:         [ 4,  3,  2,  1,  0,  4,  3,  2,  1,  0,  4,  3,  2,  1,  0],
        PingPong:        [ 0,  2,  4,  2,  0,  2,  4,  2,  0,  2,  4,  2,  0,  2,  4],
        PingPongReverse: [ 4,  2,  0,  2,  4,  2,  0,  2,  4,  2,  0,  2,  4,  2,  0],
      };
      assertEquals(playback, expected[direction])
    })
  }

  for (const direction of Playback.values) {
    await test.step(`Fractional exposure < duration, not met Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'filename--Tag' as const,
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
        loops: Number.POSITIVE_INFINITY,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(animator.index(0.9 * i))
      }
      // deno-fmt-ignore
      const expected = {
        //                v                             v                             v
        // decimal        0  9  8  7  6  5  4  3  2  1  0  9  8  7  6  5  4  3  2  1  0  9  8  7  6  5  4  3  2  1
        Forward:         [0, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 3, 4, 0, 1, 2, 3, 4, 0, 1],
        Reverse:         [4, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 1, 0, 4, 3, 2, 1, 0, 4, 3],
        PingPong:        [0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 2, 3, 4, 3, 2, 1, 0, 1, 2],
        PingPongReverse: [4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 2, 1, 0, 1, 2, 3, 4, 3, 2],
      }
      assertEquals(playback, expected[direction])
    })
  }

  for (const direction of Playback.values) {
    await test.step(`Fractional exposure === duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'filename--Tag' as const,
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
        loops: Number.POSITIVE_INFINITY,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(animator.index(0.5 * i))
      }
      // deno-fmt-ignore
      const expected = {
        Forward:         [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
        Reverse:         [4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0],
        PingPong:        [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2],
        PingPongReverse: [4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2],
      }
      assertEquals(playback, expected[direction])
    })
  }

  for (const direction of Playback.values) {
    await test.step(`Fractional exposure > duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'filename--Tag' as const,
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
        loops: Number.POSITIVE_INFINITY,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(animator.index(5.5 * i))
      }
      // deno-fmt-ignore
      const expected = {
        Forward:         [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
        Reverse:         [4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0],
        PingPong:        [0, 3, 3, 0, 2, 3, 1, 2, 4, 1, 1, 4, 2, 1, 3, 2, 0, 3, 3, 0, 2, 3, 1, 2, 4, 1, 1, 4, 2, 1],
        PingPongReverse: [4, 1, 1, 4, 2, 1, 3, 2, 0, 3, 3, 0, 2, 3, 1, 2, 4, 1, 1, 4, 2, 1, 3, 2, 0, 3, 3, 0, 2, 3],
      }
      assertEquals(playback, expected[direction])
    })
  }
})
