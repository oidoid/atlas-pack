import {Integer} from './Integer'
import {WH} from './WH'

/** Width and height at position x and y. */
export interface Rect extends WH {
  readonly x: Integer
  readonly y: Integer
}
