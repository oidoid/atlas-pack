import {Int} from './int.js'
import type {WH, WHInt} from './wh.js'
import type {XY, XYInt} from './xy.js'

/** Width and height at position x and y. */
export type Rect<T> = XY<T> & WH<T>
export type RInt = XYInt & WHInt

export function Rect<T>(x: T, y: T, w: T, h: T): Rect<T> {
  return {x, y, w, h}
}

export function RInt(
  x: Int | number,
  y: Int | number,
  w: Int | number,
  h: Int | number
): RInt {
  return Rect(Int(x), Int(y), Int(w), Int(h))
}

export namespace Rect {
  export function equals<T extends Readonly<Rect<T>>>(
    left: T,
    right: T
  ): boolean {
    return (
      left.x === right.x &&
      left.y === right.y &&
      left.w === right.w &&
      left.h === right.h
    )
  }
}
