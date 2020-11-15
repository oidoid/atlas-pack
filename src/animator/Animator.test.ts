import {Animator} from './Animator'
import {Aseprite} from '../types/Aseprite'

describe('animate()', () => {
  test('time < duration', () => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = <const>{
      size: {w: 0, h: 0},
      cels: [cel, cel],
      duration: 2,
      direction: 'forward'
    }
    const animator = Animator.animate(0, 0.5, animation)
    expect(animator).toMatchObject({period: 0, exposure: 0.5})
  })

  test('time === duration', () => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = <const>{
      size: {w: 0, h: 0},
      cels: [cel, cel],
      duration: 2,
      direction: 'forward'
    }
    const animator = Animator.animate(0, 1, animation)
    expect(animator).toMatchObject({period: 1, exposure: 0})
  })

  test('time > duration', () => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = <const>{
      size: {w: 0, h: 0},
      cels: [cel, cel],
      duration: 2,
      direction: 'forward'
    }
    const animator = Animator.animate(0, 1.5, animation)
    expect(animator).toMatchObject({period: 1, exposure: 0.5})
  })

  test('one cel', () => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = <const>{
      size: {w: 0, h: 0},
      cels: [cel],
      duration: 2,
      direction: 'forward'
    }
    const animator = Animator.animate(0, 1.5, animation)
    expect(animator).toMatchObject({period: 1, exposure: 0.5})
  })
})

describe('index', () => {
  test.each(Object.values(Aseprite.Direction))(
    '%# direction %p array start',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel],
        duration: 2,
        direction
      }
      const {period} = Animator.animate(0, 1, animation)
      const animator = Animator.index(period, animation.cels)
      expect(animator).toStrictEqual(1)
    }
  )

  test.each(Object.values(Aseprite.Direction))(
    '%# direction %p array end',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel],
        duration: 2,
        direction
      }
      const {period} = Animator.animate(1, 1, animation)
      const animator = Animator.index(period, animation.cels)
      expect(animator).toStrictEqual(0)
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
  ])('%# direction %p bounds %p', (direction, period, expected) => {
    const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
    const animation = {
      size: {w: 0, h: 0},
      cels: [cel, cel, cel, cel],
      duration: 4,
      direction
    }
    let exposure = 0
    const playback = []
    for (let i = 0; i < animation.cels.length * 5; ++i) {
      ;({period, exposure} = Animator.animate(period, exposure + 1, animation))
      playback.push(Animator.index(period, animation.cels))
    }
    expect(playback).toStrictEqual(expected)
  })

  test.each(Object.values(Aseprite.Direction))(
    '%# duration met direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      let {period, exposure} = {period: 0, exposure: 0}
      const playback = []
      for (let i = 0; i < animation.cels.length * 3; ++i) {
        ;({period, exposure} = Animator.animate(
          period,
          exposure + 1,
          animation
        ))
        playback.push(Animator.index(period, animation.cels))
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
    '%# duration exceeded direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      let {period, exposure} = {period: 0, exposure: 0}
      const playback = []
      for (let i = 0; i < animation.cels.length * 3; ++i) {
        ;({period, exposure} = Animator.animate(
          period,
          exposure + 6,
          animation
        ))
        playback.push(Animator.index(period, animation.cels))
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
    '%# fractional duration met direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      let {period, exposure} = {period: 0, exposure: 0}
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        ;({period, exposure} = Animator.animate(
          period,
          exposure + 0.5,
          animation
        ))
        playback.push(Animator.index(period, animation.cels))
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
    '%# duration not met direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      let {period, exposure} = {period: 0, exposure: 0}
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        ;({period, exposure} = Animator.animate(
          period,
          exposure + 0.9,
          animation
        ))
        playback.push(Animator.index(period, animation.cels))
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
    '%# fractional duration exceeded direction %p cycles',
    direction => {
      const cel = {position: {x: 0, y: 0}, duration: 1, slices: []}
      const animation = {
        size: {w: 0, h: 0},
        cels: [cel, cel, cel, cel, cel],
        duration: 5,
        direction
      }
      let {period, exposure} = {period: 0, exposure: 0}
      const playback = []
      for (let i = 0; i < animation.cels.length * 6; ++i) {
        ;({period, exposure} = Animator.animate(
          period,
          exposure + 5.5,
          animation
        ))
        playback.push(Animator.index(period, animation.cels))
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
