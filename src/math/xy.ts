import {Int} from './int.js'

export type XY<T> = {x: T; y: T}
export type XYInt = XY<Int>

export function XY<T>(x: T, y: T): XY<T> {
  return {x, y}
}

export function XYInt(x: Int | number, y: Int | number): XYInt {
  return XY(Int(x), Int(y))
}
