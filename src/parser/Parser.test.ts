import {Aseprite} from '../types/Aseprite'
import {Parser} from './Parser'

describe('parse()', () => {
  test('Parses Animations.', () => {
    const frameTags = [
      {name: 'sceneryCloud', from: 0, to: 0, direction: 'forward'},
      {name: 'palette-red', from: 1, to: 1, direction: 'forward'},
      {name: 'sceneryConifer', from: 2, to: 2, direction: 'forward'},
      {name: 'sceneryConifer-shadow', from: 3, to: 3, direction: 'forward'}
    ]
    const frames = {
      'sceneryCloud 0': {
        frame: {x: 220, y: 18, w: 18, h: 18},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x: 0, y: 0, w: 16, h: 16},
        sourceSize: {w: 16, h: 16},
        duration: 1
      },
      'palette-red 1': {
        frame: {x: 90, y: 54, w: 18, h: 18},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x: 0, y: 0, w: 16, h: 16},
        sourceSize: {w: 16, h: 16},
        duration: 65535
      },
      'sceneryConifer 2': {
        frame: {x: 72, y: 54, w: 18, h: 18},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x: 0, y: 0, w: 16, h: 16},
        sourceSize: {w: 16, h: 16},
        duration: 65535
      },
      'sceneryConifer-shadow 3': {
        frame: {x: 54, y: 54, w: 18, h: 18},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x: 0, y: 0, w: 16, h: 16},
        sourceSize: {w: 16, h: 16},
        duration: 65535
      }
    }
    const slices = [
      {
        name: 'sceneryCloud',
        color: '#0000ffff',
        keys: [{frame: 0, bounds: {x: 8, y: 12, w: 2, h: 3}}]
      },
      {
        name: 'palette-red',
        color: '#0000ffff',
        keys: [{frame: 0, bounds: {x: 7, y: 11, w: 3, h: 4}}]
      },
      {
        name: 'sceneryConifer',
        color: '#0000ffff',
        keys: [{frame: 0, bounds: {x: 7, y: 10, w: 3, h: 5}}]
      },
      {
        name: 'sceneryConifer-shadow',
        color: '#0000ffff',
        keys: [{frame: 0, bounds: {x: 7, y: 9, w: 3, h: 6}}]
      }
    ]
    expect(
      Parser.parseAnimationRecord({
        meta: <Aseprite.Meta>(<unknown>{frameTags, slices}),
        frames
      })
    ).toStrictEqual({
      sceneryCloud: {
        size: {w: 16, h: 16},
        cels: [
          {
            position: {x: 221, y: 19},
            duration: 1,
            slices: [{x: 8, y: 12, w: 2, h: 3}]
          }
        ],
        duration: 1,
        direction: 'forward'
      },
      'palette-red': {
        size: {w: 16, h: 16},
        cels: [
          {
            position: {x: 91, y: 55},
            duration: Number.POSITIVE_INFINITY,
            slices: [{x: 7, y: 11, w: 3, h: 4}]
          }
        ],
        duration: Number.POSITIVE_INFINITY,
        direction: 'forward'
      },
      sceneryConifer: {
        size: {w: 16, h: 16},
        cels: [
          {
            position: {x: 73, y: 55},
            duration: Number.POSITIVE_INFINITY,
            slices: [{x: 7, y: 10, w: 3, h: 5}]
          }
        ],
        duration: Number.POSITIVE_INFINITY,
        direction: 'forward'
      },
      'sceneryConifer-shadow': {
        size: {w: 16, h: 16},
        cels: [
          {
            position: {x: 55, y: 55},
            duration: Number.POSITIVE_INFINITY,
            slices: [{x: 7, y: 9, w: 3, h: 6}]
          }
        ],
        duration: Number.POSITIVE_INFINITY,
        direction: 'forward'
      }
    })
  })
})

describe('parseAnimation()', () => {
  test('Parses FrameTag, Frame from Frame[], and Slice.', () => {
    const frameTag = {
      name: 'cloud s',
      from: 1,
      to: 1,
      direction: 'forward'
    }
    const frames = {
      'cloud xs 0': {
        frame: {x: 202, y: 36, w: 18, h: 18},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x: 0, y: 0, w: 16, h: 16},
        sourceSize: {w: 16, h: 16},
        duration: 65535
      },
      'cloud s 1': {
        frame: {x: 184, y: 36, w: 18, h: 18},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x: 0, y: 0, w: 16, h: 16},
        sourceSize: {w: 16, h: 16},
        duration: 65535
      },
      'cloud m 2': {
        frame: {x: 166, y: 36, w: 18, h: 18},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x: 0, y: 0, w: 16, h: 16},
        sourceSize: {w: 16, h: 16},
        duration: 65535
      }
    }
    const slices = [
      {
        name: 'cloud xs',
        color: '#0000ffff',
        keys: [{frame: 0, bounds: {x: 4, y: 12, w: 7, h: 3}}]
      },
      {
        name: 'cloud s',
        color: '#0000ffff',
        keys: [{frame: 0, bounds: {x: 4, y: 11, w: 9, h: 4}}]
      },
      {
        name: 'cloud m',
        color: '#0000ffff',
        keys: [{frame: 0, bounds: {x: 3, y: 11, w: 10, h: 4}}]
      }
    ]
    expect(Parser.parseAnimation(frameTag, frames, slices)).toStrictEqual({
      size: {w: 16, h: 16},
      cels: [
        {
          position: {x: 185, y: 37},
          duration: Number.POSITIVE_INFINITY,
          slices: [{x: 4, y: 11, w: 9, h: 4}]
        }
      ],
      duration: Number.POSITIVE_INFINITY,
      direction: 'forward'
    })
  })
})

describe('parseDirection()', () => {
  test.each(Object.values(Aseprite.Direction))('%# Direction %p', direction =>
    expect(Parser.parseDirection(direction)).toStrictEqual(direction)
  )

  test('Unknown.', () =>
    expect(() => Parser.parseDirection('unknown')).toThrow())
})

describe('isDirection()', () => {
  test.each(Object.values(Aseprite.Direction))('%# Direction %p', direction =>
    expect(Parser.isDirection(direction)).toStrictEqual(true)
  )

  test('Unknown.', () =>
    expect(Parser.isDirection('unknown')).toStrictEqual(false))
})

describe('parseCel()', () => {
  test('Parses 1:1 texture mapping.', () => {
    const frameTag = {name: 'stem ', from: 0, to: 0, direction: 'forward'}
    const frame = {
      frame: {x: 130, y: 18, w: 18, h: 18},
      rotated: false,
      trimmed: false,
      spriteSourceSize: {x: 0, y: 0, w: 16, h: 16},
      sourceSize: {w: 16, h: 16},
      duration: 65535
    }
    const slices = [
      {
        name: 'stem ',
        color: '#0000ffff',
        keys: [{frame: 0, bounds: {x: 4, y: 4, w: 8, h: 12}}]
      }
    ]
    expect(Parser.parseCel(frameTag, frame, 0, slices)).toStrictEqual({
      position: {x: 131, y: 19},
      duration: Number.POSITIVE_INFINITY,
      slices: [{x: 4, y: 4, w: 8, h: 12}]
    })
  })
})

describe('parsePosition()', () => {
  test('Parses 1:1 texture mapping.', () => {
    const frame = {
      frame: {x: 1, y: 2, w: 3, h: 4},
      rotated: false,
      trimmed: false,
      spriteSourceSize: {x: 0, y: 0, w: 3, h: 4},
      sourceSize: {w: 3, h: 4},
      duration: 1
    }
    expect(Parser.parsePosition(frame)).toStrictEqual({x: 1, y: 2})
  })

  test('Parses texture mapping with padding.', () => {
    const frame = {
      frame: {x: 1, y: 2, w: 5, h: 6},
      rotated: false,
      trimmed: false,
      spriteSourceSize: {x: 0, y: 0, w: 3, h: 4},
      sourceSize: {w: 3, h: 4},
      duration: 1
    }
    expect(Parser.parsePosition(frame)).toStrictEqual({x: 2, y: 3})
  })
})

describe('parsePadding()', () => {
  test('Parses zero padding.', () => {
    const frame = {
      frame: {x: 1, y: 2, w: 3, h: 4},
      rotated: false,
      trimmed: false,
      spriteSourceSize: {x: 0, y: 0, w: 3, h: 4},
      sourceSize: {w: 3, h: 4},
      duration: 1
    }
    expect(Parser.parsePadding(frame)).toStrictEqual({w: 0, h: 0})
  })

  test('Parses nonzero padding.', () => {
    const frame = {
      frame: {x: 1, y: 2, w: 4, h: 5},
      rotated: false,
      trimmed: false,
      spriteSourceSize: {x: 0, y: 0, w: 3, h: 4},
      sourceSize: {w: 3, h: 4},
      duration: 1
    }
    expect(Parser.parsePadding(frame)).toStrictEqual({w: 1, h: 1})
  })

  test('Parses mixed padding.', () => {
    const frame = {
      frame: {x: 1, y: 2, w: 4, h: 6},
      rotated: false,
      trimmed: false,
      spriteSourceSize: {x: 0, y: 0, w: 3, h: 4},
      sourceSize: {w: 3, h: 4},
      duration: 1
    }
    expect(Parser.parsePadding(frame)).toStrictEqual({w: 1, h: 2})
  })
})

describe('parseDuration()', () => {
  test('Parses finite duration.', () =>
    expect(Parser.parseDuration(1)).toStrictEqual(1))

  test('Parses infinite duration.', () =>
    expect(Parser.parseDuration(65535)).toStrictEqual(Number.POSITIVE_INFINITY))
})

describe('parseSlices()', () => {
  test('Converts Slice to Rect[].', () => {
    const frameTag = {name: 'stem ', from: 0, to: 0, direction: 'forward'}
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [{frame: 0, bounds: {x: 0, y: 1, w: 2, h: 3}}]
      }
    ]
    expect(Parser.parseSlices(frameTag, 0, slices)).toStrictEqual([
      {x: 0, y: 1, w: 2, h: 3}
    ])
  })

  test('Filters out unrelated Tags.', () => {
    const frameTag = {name: 'stem ', from: 0, to: 0, direction: 'forward'}
    const slices = [
      {
        name: 'unrelated ',
        color: '#00000000',
        keys: [{frame: 0, bounds: {x: 0, y: 1, w: 2, h: 3}}]
      }
    ]
    expect(Parser.parseSlices(frameTag, 0, slices)).toStrictEqual([])
  })

  test('Filters out unrelated Frame number Keys.', () => {
    const frameTag = {name: 'stem ', from: 0, to: 2, direction: 'forward'}
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [
          {frame: 0, bounds: {x: 0, y: 1, w: 2, h: 3}},
          {frame: 1, bounds: {x: 4, y: 5, w: 6, h: 7}},
          {frame: 2, bounds: {x: 8, y: 9, w: 10, h: 11}}
        ]
      }
    ]
    expect(Parser.parseSlices(frameTag, 1, slices)).toStrictEqual([
      {x: 4, y: 5, w: 6, h: 7}
    ])
  })

  test('Converts Slice with multiple Keys to Rect[].', () => {
    const frameTag = {name: 'stem ', from: 0, to: 1, direction: 'forward'}
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [
          {frame: 0, bounds: {x: 0, y: 1, w: 2, h: 3}},
          {frame: 1, bounds: {x: 4, y: 5, w: 6, h: 7}}
        ]
      }
    ]
    expect(Parser.parseSlices(frameTag, 0, slices)).toStrictEqual([
      {x: 0, y: 1, w: 2, h: 3}
    ])
  })

  test('Converts no Slices.', () => {
    const frameTag = {name: 'stem ', from: 0, to: 0, direction: 'forward'}
    expect(Parser.parseSlices(frameTag, 0, [])).toStrictEqual([])
  })

  test('Converts multiple Slices.', () => {
    const frameTag = {name: 'stem ', from: 0, to: 1, direction: 'forward'}
    const slices = [
      {
        name: 'stem ',
        color: '#00000000',
        keys: [
          {frame: 0, bounds: {x: 0, y: 1, w: 2, h: 3}},
          {frame: 1, bounds: {x: 4, y: 5, w: 6, h: 7}},
          {frame: 2, bounds: {x: 12, y: 13, w: 14, h: 15}}
        ]
      },
      {
        name: 'unrelated ',
        color: '#00000000',
        keys: [{frame: 0, bounds: {x: 0, y: 1, w: 2, h: 3}}]
      },
      {
        name: 'stem ',
        color: '#00000000',
        keys: [{frame: 1, bounds: {x: 0, y: 1, w: 2, h: 3}}]
      },
      {
        name: 'stem ',
        color: '#00000000',
        keys: [{frame: 0, bounds: {x: 8, y: 9, w: 10, h: 11}}]
      }
    ]
    expect(Parser.parseSlices(frameTag, 1, slices)).toStrictEqual([
      {x: 4, y: 5, w: 6, h: 7},
      {x: 0, y: 1, w: 2, h: 3},
      {x: 8, y: 9, w: 10, h: 11}
    ])
  })
})
