import {Animator} from './animator.js'
import {Aseprite} from '../types/aseprite.js'
import {WH} from '../types/wh.js'
import {XY} from '../types/xy.js'

describe('animate()', () => {
  test('exposure < duration', () => {
    const cel = {position: XY(0, 0), duration: 1, slices: []}
    const animation = <const>{
      size: WH(0, 0),
      cels: [cel, cel],
      duration: 2,
      direction: 'forward'
    }
    const animator = Animator()
    Animator.animate(animator, 0.5, animation)
    expect(animator).toMatchObject({period: 0, exposure: 0.5})
  })

  test('exposure === duration', () => {
    const cel = {position: XY(0, 0), duration: 1, slices: []}
    const animation = <const>{
      size: WH(0, 0),
      cels: [cel, cel],
      duration: 2,
      direction: 'forward'
    }
    const animator = Animator()
    Animator.animate(animator, 1, animation)
    expect(animator).toMatchObject({period: 1, exposure: 0})
  })

  test('exposure > duration', () => {
    const cel = {position: XY(0, 0), duration: 1, slices: []}
    const animation = <const>{
      size: WH(0, 0),
      cels: [cel, cel],
      duration: 2,
      direction: 'forward'
    }
    const animator = Animator()
    Animator.animate(animator, 1.5, animation)
    expect(animator).toMatchObject({period: 1, exposure: 0.5})
  })

  test('infinite duration', () => {
    const animation = <const>{
      size: WH(0, 0),
      cels: [
        {position: XY(0, 0), duration: 1, slices: []},
        {position: XY(0, 0), duration: Number.POSITIVE_INFINITY, slices: []}
      ],
      duration: Number.POSITIVE_INFINITY,
      direction: 'forward'
    }
    const animator = Animator()
    Animator.animate(animator, 0.5, animation)
    expect(animator).toMatchObject({period: 0, exposure: 0.5})
    Animator.animate(animator, 100, animation)
    expect(animator).toMatchObject({period: 1, exposure: 99.5})
  })

  test('one cel', () => {
    const cel = {position: XY(0, 0), duration: 1, slices: []}
    const animation = <const>{
      size: WH(0, 0),
      cels: [cel],
      duration: 2,
      direction: 'forward'
    }
    const animator = Animator()
    Animator.animate(animator, 1.5, animation)
    expect(animator).toMatchObject({period: 1, exposure: 0.5})
  })
})

describe('index()', () => {
  test.each(Object.values(Aseprite.Direction))(
    '%# Direction %s array start',
    direction => {
      const cel = {position: XY(0, 0), duration: 1, slices: []}
      const animation = {
        size: WH(0, 0),
        cels: [cel, cel],
        duration: 2,
        direction
      }
      const animator = Animator()
      Animator.animate(animator, 1, animation)
      const index = Animator.index(animator, animation)
      expect(index).toStrictEqual(1)
    }
  )

  test.each(Object.values(Aseprite.Direction))(
    '%# Direction %s array end',
    direction => {
      const cel = {position: XY(0, 0), duration: 1, slices: []}
      const animation = {
        size: WH(0, 0),
        cels: [cel, cel],
        duration: 2,
        direction
      }
      const animator = Animator(1)
      Animator.animate(animator, 1, animation)
      const index = Animator.index(animator, animation)
      expect(index).toStrictEqual(0)
    }
  )

  test.each(<const>[
    [
      'forward',
      0,
      [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]
    ],
    [
      'forward',
      Number.MAX_SAFE_INTEGER,
      [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]
    ],
    [
      'reverse',
      Number.MIN_SAFE_INTEGER,
      [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0]
    ],
    [
      'reverse',
      3,
      [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3]
    ],
    [
      'pingpong',
      -2,
      [3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2]
    ],
    [
      'pingpong',
      0,
      [1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2]
    ],
    [
      'pingpong',
      3,
      [2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1]
    ]
  ])('%# Direction %s bounds %p', (direction, period, expected) => {
    const cel = {position: XY(0, 0), duration: 1, slices: []}
    const animation = {
      size: WH(0, 0),
      cels: [cel, cel, cel, cel],
      duration: 4,
      direction
    }
    const animator = Animator(period)
    const playback = []
    for (let i = 0; i < animation.cels.length * 5; ++i) {
      Animator.animate(animator, 1, animation)
      playback.push(Animator.index(animator, animation))
    }
    expect(playback).toStrictEqual(expected)
  })

  test.each(Object.values(Aseprite.Direction))(
    '%# exposure === duration, Direction %s cycles',
    direction => {
      const cel = {position: XY(0, 0), duration: 1, slices: []}
      const animation = {
        size: WH(0, 0),
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = Animator()
      const playback = []
      for (let i = 0; i < animation.cels.length * 3; ++i) {
        Animator.animate(animator, 1, animation)
        playback.push(Animator.index(animator, animation))
      }
      // prettier-ignore
      const expected = {
        forward:  [1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0],
        reverse:  [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        pingpong: [1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )

  test.each(Object.values(Aseprite.Direction))(
    '%# exposure > duration, Direction %s cycles',
    direction => {
      const cel = {position: XY(0, 0), duration: 1, slices: []}
      const animation = {
        size: WH(0, 0),
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = Animator()
      const playback = []
      for (let i = 0; i < animation.cels.length * 3; ++i) {
        Animator.animate(animator, 6, animation)
        playback.push(Animator.index(animator, animation))
      }
      // prettier-ignore
      const expected = {
        forward:  [1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0],
        reverse:  [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        pingpong: [1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )

  test.each(Object.values(Aseprite.Direction))(
    '%# fractional exposure < duration, not met Direction %s cycles',
    direction => {
      const cel = {position: XY(0, 0), duration: 1, slices: []}
      const animation = {
        size: WH(0, 0),
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = Animator()
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        Animator.animate(animator, 0.9, animation)
        playback.push(Animator.index(animator, animation))
      }
      // prettier-ignore
      const expected = {
        forward:  [0, 1, 2, 3, 4, 0, 1, 2, 3, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 1],
        reverse:  [0, 4, 3, 2, 1, 0, 4, 3, 2, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 4],
        pingpong: [0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 2]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )

  test.each(Object.values(Aseprite.Direction))(
    '%# fractional exposure === duration, Direction %s cycles',
    direction => {
      const cel = {position: XY(0, 0), duration: 1, slices: []}
      const animation = {
        size: WH(0, 0),
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = Animator()
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        Animator.animate(animator, 0.5, animation)
        playback.push(Animator.index(animator, animation))
      }
      // prettier-ignore
      const expected = {
        forward:  [0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0],
        reverse:  [0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0],
        pingpong: [0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )

  test.each(Object.values(Aseprite.Direction))(
    '%# fractional exposure > duration, Direction %s cycles',
    direction => {
      const cel = {position: XY(0, 0), duration: 1, slices: []}
      const animation = {
        size: WH(0, 0),
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = Animator()
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        Animator.animate(animator, 5.5, animation)
        playback.push(Animator.index(animator, animation))
      }
      // prettier-ignore
      const expected = {
        forward:  [0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0],
        reverse:  [0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0],
        pingpong: [0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )
})
