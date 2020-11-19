import {Animator} from './Animator'
import {Aseprite} from '../types/Aseprite'

describe('step()', () => {
  test('time < duration', () => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = {
      size: {w: 0, h: 0},
      cels: [cel, cel],
      duration: 2,
      direction: Aseprite.AnimationDirection.FORWARD
    }
    const animator = new Animator(animation)
    animator.animate(0.5)
    expect(animator).toMatchObject({period: 0, exposure: 0.5})
  })

  test('time === duration', () => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = {
      size: {w: 0, h: 0},
      cels: [cel, cel],
      duration: 2,
      direction: Aseprite.AnimationDirection.FORWARD
    }
    const animator = new Animator(animation)
    animator.animate(1)
    expect(animator).toMatchObject({period: 1, exposure: 0})
  })

  test('time > duration', () => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = {
      size: {w: 0, h: 0},
      cels: [cel, cel],
      duration: 2,
      direction: Aseprite.AnimationDirection.FORWARD
    }
    const animator = new Animator(animation)
    animator.animate(1.5)
    expect(animator).toMatchObject({period: 1, exposure: 0.5})
  })
})

describe('index', () => {
  test.each(Object.values(Aseprite.AnimationDirection))(
    '%# direction %p array start',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel],
        duration: 2,
        direction
      }
      const animator = new Animator(animation)
      animator.animate(1)
      expect(animator.index()).toStrictEqual(1)
    }
  )

  test.each(Object.values(Aseprite.AnimationDirection))(
    '%# direction %p array end',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel],
        duration: 2,
        direction
      }
      const animator = new Animator(animation, 1)
      animator.animate(1)
      expect(animator.index()).toStrictEqual(0)
    }
  )

  test.each(<
    readonly [Aseprite.AnimationDirection, number, readonly number[]][]
  >[
    [
      Aseprite.AnimationDirection.FORWARD,
      0,
      [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]
    ],
    [
      Aseprite.AnimationDirection.FORWARD,
      Number.MAX_SAFE_INTEGER,
      [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]
    ],
    [
      Aseprite.AnimationDirection.REVERSE,
      Number.MIN_SAFE_INTEGER,
      [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0]
    ],
    [
      Aseprite.AnimationDirection.REVERSE,
      3,
      [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3]
    ],
    [
      Aseprite.AnimationDirection.PING_PONG,
      -2,
      [3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2]
    ],
    [
      Aseprite.AnimationDirection.PING_PONG,
      0,
      [1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2]
    ],
    [
      Aseprite.AnimationDirection.PING_PONG,
      3,
      [2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1]
    ]
  ])('%# direction %p bounds %p', (direction, period, expected) => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = {
      size: {w: 0, h: 0},
      cels: [cel, cel, cel, cel],
      duration: 4,
      direction
    }
    const animator = new Animator(animation, period)
    const playback = []
    for (let i = 0; i < animation.cels.length * 5; ++i) {
      animator.animate(1)
      playback.push(animator.index())
    }
    expect(playback).toStrictEqual(expected)
  })

  test.each(Object.values(Aseprite.AnimationDirection))(
    '%# duration met direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = new Animator(animation)

      const playback = []
      for (let i = 0; i < animation.cels.length * 3; ++i) {
        animator.animate(1)
        playback.push(animator.index())
      }
      // prettier-ignore
      const expected = {
        [Aseprite.AnimationDirection.FORWARD]:   [1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0],
        [Aseprite.AnimationDirection.REVERSE]:   [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        [Aseprite.AnimationDirection.PING_PONG]: [1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )

  test.each(Object.values(Aseprite.AnimationDirection))(
    '%# duration exceeded direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = new Animator(animation)
      const playback = []
      for (let i = 0; i < animation.cels.length * 3; ++i) {
        animator.animate(6)
        playback.push(animator.index())
      }
      // prettier-ignore
      const expected = {
        [Aseprite.AnimationDirection.FORWARD]:   [1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0],
        [Aseprite.AnimationDirection.REVERSE]:   [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 2, 1, 0],
        [Aseprite.AnimationDirection.PING_PONG]: [1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )

  test.each(Object.values(Aseprite.AnimationDirection))(
    '%# fractional duration met direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = new Animator(animation)
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        animator.animate(0.5)
        playback.push(animator.index())
      }
      // prettier-ignore
      const expected = {
        [Aseprite.AnimationDirection.FORWARD]:   [0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0],
        [Aseprite.AnimationDirection.REVERSE]:   [0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0],
        [Aseprite.AnimationDirection.PING_PONG]: [0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )

  test.each(Object.values(Aseprite.AnimationDirection))(
    '%# duration not met direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = new Animator(animation)
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        animator.animate(0.9)
        playback.push(animator.index())
      }
      // prettier-ignore
      const expected = {
        [Aseprite.AnimationDirection.FORWARD]:   [0, 1, 2, 3, 4, 0, 1, 2, 3, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 1],
        [Aseprite.AnimationDirection.REVERSE]:   [0, 4, 3, 2, 1, 0, 4, 3, 2, 2, 1, 0, 4, 3, 2, 1, 0, 4, 3, 3, 2, 1, 0, 4, 3, 2, 1, 0, 4, 4],
        [Aseprite.AnimationDirection.PING_PONG]: [0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 2]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )

  test.each(Object.values(Aseprite.AnimationDirection))(
    '%# fractional duration exceeded direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      const animator = new Animator(animation)
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        animator.animate(5.5)
        playback.push(animator.index())
      }
      // prettier-ignore
      const expected = {
        [Aseprite.AnimationDirection.FORWARD]:   [0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0],
        [Aseprite.AnimationDirection.REVERSE]:   [0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 4, 4, 3, 3, 2, 2, 1, 1, 0],
        [Aseprite.AnimationDirection.PING_PONG]: [0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1]
      }
      expect(playback).toStrictEqual(expected[direction])
    }
  )
})
