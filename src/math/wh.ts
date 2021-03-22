import {Int} from './int.js'

/** Width and height in pixels. */
export type WH<T> = {w: T; h: T}
export type WHInt = WH<Int>

export function WH<T>(w: T, h: T): WH<T> {
  return {w, h}
}

export function WHInt(w: Int | number, h: Int | number): WHInt {
  return WH(Int(w), Int(h))
}

export namespace WH {
  export function equals<T>(
    left: Readonly<WH<T>>,
    right: Readonly<WH<T>>
  ): boolean {
    return left.w === right.w && left.h === right.h
  }

  export function toString<T>({w, h}: Readonly<WH<T>>): string {
    return `WH {w: ${w}, h: ${h}}`
  }
}
