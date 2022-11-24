import { Animator, CelID, Playback } from '@/atlas-pack';
import { I32, U16Box, U16Millis, U16XY, UnumberMillis } from '@/oidlib';
import { assertEquals } from 'std/testing/asserts.ts';
import { InfiniteDuration } from './Film.ts';

Deno.test('play()', async (test) => {
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
      duration: U16Millis(2),
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    Animator.play(animator, UnumberMillis(0.5));
    assertEquals(animator, {
      film,
      period: I32(0),
      exposure: UnumberMillis(0.5),
    });
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
      duration: U16Millis(2),
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    Animator.play(animator, UnumberMillis(1));
    assertEquals(animator, {
      film,
      period: I32(1),
      exposure: UnumberMillis(0),
    });
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
      duration: U16Millis(2),
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    Animator.play(animator, UnumberMillis(1.5));
    assertEquals(animator, {
      film,
      period: I32(1),
      exposure: UnumberMillis(0.5),
    });
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
      duration: InfiniteDuration,
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    Animator.play(animator, UnumberMillis(0.5));
    assertEquals(animator, {
      film,
      period: I32(0),
      exposure: UnumberMillis(0.5),
    });
    Animator.play(animator, UnumberMillis(100));
    assertEquals(animator, {
      film,
      period: I32(1),
      exposure: UnumberMillis(99.5),
    });
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
      duration: U16Millis(2),
      direction: 'Forward' as const,
    };
    const animator = Animator(film);
    Animator.play(animator, UnumberMillis(1.5));
    assertEquals(animator, {
      film,
      period: I32(1),
      exposure: UnumberMillis(0.5),
    });
  });
});

Deno.test('reset()', () => {
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
    direction: 'Forward' as const,
  };
  const animator = Animator(film);
  Animator.play(animator, UnumberMillis(1.5));
  assertEquals(animator.period, 1);
  assertEquals(animator.exposure, 0.5);
  Animator.setFilm(animator);
  assertEquals(animator.period, 0);
  assertEquals(animator.exposure, 0);
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
        duration: U16Millis(2),
        direction,
      };
      const animator = Animator(film);
      Animator.play(animator, UnumberMillis(1));
      const index = Animator.index(animator);
      assertEquals(index, 1);
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
        duration: U16Millis(2),
        direction,
      };
      const animator = {
        film,
        period: I32(1),
        exposure: UnumberMillis(0),
      };
      Animator.play(animator, UnumberMillis(1));
      const index = Animator.index(animator);
      assertEquals(index, 0);
    });
  }

  for (
    const [direction, period, expected] of [
      [
        'Forward',
        0,
        [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0],
      ],
      [
        'Forward',
        I32.max,
        [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0],
      ],
      [
        'Reverse',
        I32.min,
        [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0],
      ],
      [
        'Reverse',
        3,
        [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3],
      ],
      [
        'PingPong',
        -2,
        [3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2],
      ],
      [
        'PingPong',
        0,
        [1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2],
      ],
      [
        'PingPong',
        3,
        [2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1],
      ],
    ] as [Playback, number, number[]][]
  ) {
    await test.step(`Direction ${direction} bounds ${period}.`, () => {
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
        duration: U16Millis(4),
        direction,
      };
      const animator = {
        film,
        period: I32(period),
        exposure: UnumberMillis(0),
      };
      const playback = [];
      for (let i = 0; i < film.cels.length * 5; ++i) {
        Animator.play(animator, UnumberMillis(1));
        playback.push(Animator.index(animator));
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
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 3; ++i) {
        Animator.play(animator, UnumberMillis(1));
        playback.push(Animator.index(animator));
      }
      const expected = {
        Forward: [1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0],
        Reverse: [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        PingPong: [1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1],
      };
      assertEquals(playback, expected[direction]);
    });
  }

  for (const direction of Playback.values) {
    await test.step(`Exposure > duration, Direction %s cycles.`, () => {
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
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 3; ++i) {
        Animator.play(animator, UnumberMillis(6));
        playback.push(Animator.index(animator));
      }
      const expected = {
        Forward: [1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0],
        Reverse: [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        PingPong: [1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1],
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
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 6; ++i) {
        Animator.play(animator, UnumberMillis(0.9));
        playback.push(Animator.index(animator));
      }
      // deno-fmt-ignore
      const expected = {
        Forward:  [0, 1, 2, 3, 4, 0, 1, 2, 3, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 1],
        Reverse:  [0, 4, 3, 2, 1, 0, 4, 3, 2, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 4],
        PingPong: [0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 2]
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
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 6; ++i) {
        Animator.play(animator, UnumberMillis(0.5));
        playback.push(Animator.index(animator));
      }
      // deno-fmt-ignore
      const expected = {
        Forward:  [0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0],
        Reverse:  [0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0],
        PingPong: [0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1]
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
        duration: U16Millis(5),
        direction,
      };
      const animator = Animator(film);
      const playback = [];
      for (let i = 0; i < film.cels.length * 6; ++i) {
        Animator.play(animator, UnumberMillis(5.5));
        playback.push(Animator.index(animator));
      }
      // deno-fmt-ignore
      const expected = {
        Forward:  [0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0],
        Reverse:  [0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0],
        PingPong: [0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1]
      }
      assertEquals(playback, expected[direction]);
    });
  }
});
