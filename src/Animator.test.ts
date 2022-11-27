import { Animator, CelID, InfiniteDuration, Playback } from '@/atlas-pack';
import { U16Box, U16Millis, U16XY, U32Millis, UnumberMillis } from '@/oidlib';
import { assertEquals } from 'std/testing/asserts.ts';

Deno.test('Animator()', async (test) => {
  await test.step('Exposure < duration.', () => {
    const cel = {
      id: <CelID> 0,
      bounds: U16Box(1, 2, 3, 4),
      duration: U16Millis(1),
      sliceBounds: U16Box(1, 1, -1, -1),
      slices: [],
    };
    const film = {
      id: 'abc',
      wh: U16XY(0, 0),
      cels: [cel, cel],
      period: U32Millis(1),
      duration: U16Millis(2),
      direction: 'Forward' as const,
    };
    const animator = Animator(film, UnumberMillis(0.5));
    assertEquals(animator, { film, start: UnumberMillis(0.5) });
    const index = Animator.index(animator, UnumberMillis(0.5));
    assertEquals(index, 0);
  });

  await test.step('Exposure == duration.', () => {
    const cel = {
      id: <CelID> 0,
      bounds: U16Box(1, 2, 3, 4),
      duration: U16Millis(1),
      sliceBounds: U16Box(1, 1, -1, -1),
      slices: [],
    };
    const film = {
      id: 'abc',
      wh: U16XY(0, 0),
      cels: [cel, cel],
      period: U32Millis(1),
      duration: U16Millis(2),
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    assertEquals(animator, { film, start: UnumberMillis(0) });
    const index = Animator.index(animator, UnumberMillis(1));
    assertEquals(index, 1);
  });

  await test.step('Exposure > duration.', () => {
    const cel = {
      id: <CelID> 0,
      bounds: U16Box(1, 2, 3, 4),
      duration: U16Millis(1),
      sliceBounds: U16Box(1, 1, -1, -1),
      slices: [],
    };
    const film = {
      id: 'abc',
      wh: U16XY(0, 0),
      cels: [cel, cel],
      period: U32Millis(1),
      duration: U16Millis(2),
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    assertEquals(animator, { film, start: UnumberMillis(0) });
    const index = Animator.index(animator, UnumberMillis(1.5));
    assertEquals(index, 1);
  });

  await test.step('Infinite duration.', () => {
    const film = {
      id: 'abc',
      wh: U16XY(0, 0),
      cels: [
        {
          id: <CelID> 0,
          bounds: U16Box(1, 2, 3, 4),
          duration: U16Millis(1),
          sliceBounds: U16Box(1, 1, -1, -1),
          slices: [],
        },
        {
          id: <CelID> 1,
          bounds: U16Box(1, 2, 3, 4),
          duration: InfiniteDuration,
          sliceBounds: U16Box(1, 1, -1, -1),
          slices: [],
        },
      ],
      period: U32Millis(1),
      duration: InfiniteDuration,
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    assertEquals(animator, { film, start: UnumberMillis(0) });
    let index = Animator.index(animator, UnumberMillis(0.5));
    assertEquals(index, 0);
    index = Animator.index(animator, UnumberMillis(100));
    assertEquals(index, 1);
  });

  await test.step('One cel.', () => {
    const film = {
      id: 'abc',
      wh: U16XY(0, 0),
      cels: [{
        id: <CelID> 0,
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      }],
      period: U32Millis(1),
      duration: U16Millis(2),
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    assertEquals(animator, { film, start: UnumberMillis(0) });
    const index = Animator.index(animator, UnumberMillis(1.5));
    assertEquals(index, 0);
  });
});

Deno.test('setFilm()', () => {
  const cel = {
    id: <CelID> 0,
    bounds: U16Box(0, 0, 0, 0),
    duration: U16Millis(1),
    sliceBounds: U16Box(1, 1, -1, -1),
    slices: [],
  };
  const film = {
    id: 'abc',
    wh: U16XY(0, 0),
    cels: [cel, cel],
    duration: U16Millis(2),
    period: U32Millis(1),
    direction: 'Forward' as const,
  };
  const animator = Animator(film);
  let index = Animator.index(animator, UnumberMillis(1.5));
  assertEquals(index, 1);
  Animator.setFilm(animator, UnumberMillis(2));
  index = Animator.index(animator, UnumberMillis(2));
  assertEquals(index, 0);
});

Deno.test('index()', async (test) => {
  for (const direction of Playback.values) {
    await test.step(`Direction ${direction} array start.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      };
      const film = {
        id: 'abc',
        wh: U16XY(0, 0),
        cels: [cel, cel],
        period: U32Millis(1),
        duration: U16Millis(2),
        direction,
      };
      const animator = Animator(film);
      const index = Animator.index(animator, UnumberMillis(1));
      const expected = { Forward: 1, Reverse: 0, PingPong: 1 };
      assertEquals(index, expected[direction]);
    });
  }

  for (const direction of Playback.values) {
    await test.step(`Direction ${direction} array end.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      };
      const film = {
        id: 'abc',
        wh: U16XY(0, 0),
        cels: [cel, cel],
        period: U32Millis(1),
        duration: U16Millis(2),
        direction,
      };
      const animator = Animator(film);
      const index = Animator.index(animator, UnumberMillis(2));
      const expected = { Forward: 0, Reverse: 1, PingPong: 0 };
      assertEquals(index, expected[direction]);
    });
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
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      };
      const film = {
        id: 'abc',
        wh: U16XY(0, 0),
        cels: [cel, cel, cel, cel],
        period: U32Millis(1),
        duration: U16Millis(4),
        direction,
      };
      const animator = { film, start: UnumberMillis(0) };
      const playback = [];
      for (let i = 0; i < film.cels.length * 5; ++i) {
        playback.push(Animator.index(animator, UnumberMillis(offset + 1 * i)));
      }
      assertEquals(playback, expected);
    });
  }

  for (const direction of Playback.values) {
    await test.step(`Exposure == duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      };
      const film = {
        id: 'abc',
        wh: U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32Millis(1),
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 3; ++i) {
        playback.push(Animator.index(animator, UnumberMillis(1 * i)));
      }
      const expected = {
        Forward: [0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4],
        Reverse: [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        PingPong: [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2],
      };
      assertEquals(playback, expected[direction]);
    });
  }

  for (const direction of Playback.values) {
    await test.step(`Exposure > duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      };
      const film = {
        id: 'abc',
        wh: U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32Millis(1),
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 3; ++i) {
        playback.push(Animator.index(animator, UnumberMillis(6 * i)));
      }
      // deno-fmt-ignore
      const expected = {
        // time     0   6  12  18  24  30  36  42  48  54  60  66  72  78  84
        // % 5      0   1   2   3   4   0   1   2   3   4   0   1   2   3   4
        Forward:  [ 0,  1,  2,  3,  4,  0,  1,  2,  3,  4,  0,  1,  2,  3,  4],
        Reverse:  [ 4,  3,  2,  1,  0,  4,  3,  2,  1,  0,  4,  3,  2,  1,  0],
        PingPong: [ 0,  2,  4,  2,  0,  2,  4,  2,  0,  2,  4,  2,  0,  2,  4],
      };
      assertEquals(playback, expected[direction]);
    });
  }

  for (const direction of Playback.values) {
    await test.step(`Fractional exposure < duration, not met Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      };
      const film = {
        id: 'abc',
        wh: U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32Millis(1),
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(Animator.index(animator, UnumberMillis(0.9 * i)));
      }
      // deno-fmt-ignore
      const expected = {
        //         v                             v                             v
        // decimal 0  9  8  7  6  5  4  3  2  1  0  9  8  7  6  5  4  3  2  1  0  9  8  7  6  5  4  3  2  1
        Forward:  [0, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 3, 4, 0, 1, 2, 3, 4, 0, 1],
        Reverse:  [4, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 1, 0, 4, 3, 2, 1, 0, 4, 3],
        PingPong: [0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 2, 3, 4, 3, 2, 1, 0, 1, 2]
      }
      assertEquals(playback, expected[direction]);
    });
  }

  for (const direction of Playback.values) {
    await test.step(`Fractional exposure == duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      };
      const film = {
        id: 'abc',
        wh: U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32Millis(1),
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(Animator.index(animator, UnumberMillis(0.5 * i)));
      }
      // deno-fmt-ignore
      const expected = {
        Forward:  [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
        Reverse:  [4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0],
        PingPong: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2]
      }
      assertEquals(playback, expected[direction]);
    });
  }

  for (const direction of Playback.values) {
    await test.step(`Fractional exposure > duration, Direction ${direction} cycles.`, () => {
      const cel = {
        id: <CelID> 0,
        bounds: U16Box(1, 2, 3, 4),
        duration: U16Millis(1),
        sliceBounds: U16Box(1, 1, -1, -1),
        slices: [],
      };
      const film = {
        id: 'abc',
        wh: U16XY(0, 0),
        cels: [cel, cel, cel, cel, cel],
        period: U32Millis(1),
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 6; ++i) {
        playback.push(Animator.index(animator, UnumberMillis(5.5 * i)));
      }
      // deno-fmt-ignore
      const expected = {
        Forward:  [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
        Reverse:  [4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0],
        PingPong: [0, 3, 3, 0, 2, 3, 1, 2, 4, 1, 1, 4, 2, 1, 3, 2, 0, 3, 3, 0, 2, 3, 1, 2, 4, 1, 1, 4, 2, 1]
      }
      assertEquals(playback, expected[direction]);
    });
  }
});
