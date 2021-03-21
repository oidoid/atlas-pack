import type {Int} from './int.js'

/** Width and height in pixels. */
export type WH = {w: Int; h: Int}

export function WH(w: Int, h: Int): WH {
  return {w, h}
}
