import { Animator, CelID, InfiniteDuration, Playback } from '@/atlas-pack'
import { I16Box, U16, U16Box, U16XY, U32 } from '@/oidlib'
import { assertEquals } from 'std/testing/asserts.ts'

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
      id: 'abc',
      wh: new U16XY(0, 0),
      cels: [cel, cel],
      period: U32(1),
      duration: U16(2),
      direction: 'Forward' as const,
    }
    const animator = new Animator(film, 0.5)
    const index = animator.index(0.5)
    assertEquals(index, 0)
  })

  await test.step('Exposure == duration.', () => {
    const cel = {
      id: <CelID> 0,
      bounds: new U16Box(1, 2, 3, 4),
      duration: U16(1),
      sliceBounds: new I16Box(1, 1, 2, 2),
      slices: [],
    }
    const film = {
      id: 'abc',
      wh: new U16XY(0, 0),
      cels: [cel, cel],
      period: U32(1),
      duration: U16(2),
      direction: 'Forward' as const,
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
      id: 'abc',
      wh: new U16XY(0, 0),
      cels: [cel, cel],
      period: U32(1),
      duration: U16(2),
      direction: 'Forward' as const,
    }
    const animator = new Animator(film)
    const index = animator.index(1.5)
    assertEquals(index, 1)
  })

  await test.step('Infinite duration.', () => {
    const film = {
      id: 'abc',
      wh: new U16XY(0, 0),
      cels: [
        {
          id: <CelID> 0,
          bounds: new U16Box(1, 2, 3, 4),
          duration: U16(1),
          sliceBounds: new I16Box(1, 1, 2, 2),
          slices: [],
        },
        {
          id: <CelID> 1,
          bounds: new U16Box(1, 2, 3, 4),
          duration: InfiniteDuration,
          sliceBounds: new I16Box(1, 1, 2, 2),
          slices: [],
        },
      ],
      period: U32(1),
      duration: InfiniteDuration,
      direction: 'Forward' as const,
    }
    const animator = new Animator(film)
    let index = animator.index(0.5)
    assertEquals(index, 0)
    index = animator.index(100)
    assertEquals(index, 1)
  })

  await test.step('One cel.', () => {
    const film = {
      id: 'abc',
      wh: new U16XY(0, 0),
      cels: [{
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }],
      period: U32(1),
      duration: U16(2),
      direction: 'Forward' as const,
    }
    const animator = new Animator(film)
    const index = animator.index(1.5)
    assertEquals(index, 0)
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
    id: 'abc',
    wh: new U16XY(0, 0),
    cels: [cel, cel],
    duration: U16(2),
    period: U32(1),
    direction: 'Forward' as const,
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
        id: 'abc',
        wh: new U16XY(0, 0),
        cels: [cel, cel],
        period: U32(1),
        duration: U16(2),
        direction,
      }
      const animator = new Animator(film)
      const index = animator.index(1)
      const expected = { Forward: 1, Reverse: 0, PingPong: 1 }
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
        id: 'abc',
        wh: new U16XY(0, 0),
        cels: [cel, cel],
        period: U32(1),
        duration: U16(2),
        direction,
      }
      const animator = new Animator(film)
      const index = animator.index(2)
      const expected = { Forward: 0, Reverse: 1, PingPong: 0 }
      assertEquals(index, expected[direction])
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
        id: 'abc',
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel],
        period: U32(1),
        duration: U16(4),
        direction,
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
    await test.step(`Exposure == duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'abc',
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 3; ++i) {
        playback.push(animator.index(1 * i))
      }
      const expected = {
        Forward: [0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4],
        Reverse: [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        PingPong: [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2],
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
        id: 'abc',
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 3; ++i) {
        playback.push(animator.index(6 * i))
      }
      // deno-fmt-ignore
      const expected = {
        // time     0   6  12  18  24  30  36  42  48  54  60  66  72  78  84
        // % 5      0   1   2   3   4   0   1   2   3   4   0   1   2   3   4
        Forward:  [ 0,  1,  2,  3,  4,  0,  1,  2,  3,  4,  0,  1,  2,  3,  4],
        Reverse:  [ 4,  3,  2,  1,  0,  4,  3,  2,  1,  0,  4,  3,  2,  1,  0],
        PingPong: [ 0,  2,  4,  2,  0,  2,  4,  2,  0,  2,  4,  2,  0,  2,  4],
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
        id: 'abc',
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(animator.index(0.9 * i))
      }
      // deno-fmt-ignore
      const expected = {
        //         v                             v                             v
        // decimal 0  9  8  7  6  5  4  3  2  1  0  9  8  7  6  5  4  3  2  1  0  9  8  7  6  5  4  3  2  1
        Forward:  [0, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 3, 4, 0, 1, 2, 3, 4, 0, 1],
        Reverse:  [4, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 1, 0, 4, 3, 2, 1, 0, 4, 3],
        PingPong: [0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 2, 3, 4, 3, 2, 1, 0, 1, 2]
      }
      assertEquals(playback, expected[direction])
    })
  }

  for (const direction of Playback.values) {
    await test.step(`Fractional exposure == duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: new U16Box(1, 2, 3, 4),
        duration: U16(1),
        sliceBounds: new I16Box(1, 1, 2, 2),
        slices: [],
      }
      const film = {
        id: 'abc',
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(animator.index(0.5 * i))
      }
      // deno-fmt-ignore
      const expected = {
        Forward:  [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
        Reverse:  [4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0],
        PingPong: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2]
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
        id: 'abc',
        wh: new U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32(1),
        duration: U16(5),
        direction,
      }
      const animator = new Animator(film)
      const playback = []
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(animator.index(5.5 * i))
      }
      // deno-fmt-ignore
      const expected = {
        Forward:  [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
        Reverse:  [4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0],
        PingPong: [0, 3, 3, 0, 2, 3, 1, 2, 4, 1, 1, 4, 2, 1, 3, 2, 0, 3, 3, 0, 2, 3, 1, 2, 4, 1, 1, 4, 2, 1]
      }
      assertEquals(playback, expected[direction])
    })
  }
})
