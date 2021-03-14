import type {WH} from './wh.js'
import type {XY} from './xy.js'

/** Width and height at position x and y. */
export interface Rect extends XY, WH {}
