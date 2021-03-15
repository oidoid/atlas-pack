import type {Int} from './int.js'

/** Cartesian coordinates in pixels with a top-left origin. */
export interface XY {
  x: Int
  y: Int
}

export function XY(x: Int, y: Int): XY {
  return {x, y}
}
