import {assert as assertTrue} from './assert.js'
import {NumberUtil} from './number-util.js'

/**
 * A "[safe integer]" `number` in
 * [`Number.MIN_SAFE_INTEGER`, `Number.MAX_SAFE_INTEGER`].
 *
 * [safe integer]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number
 */
export type Int = number & {[brand]: void}
declare const brand: unique symbol

export function Int(val: Int | number): Int {
  Int.assert(val)
  return val
}

export namespace Int {
  /** Attempt to truncate a number with saturation. */
  export function tryClamp(
    val: number,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER
  ): Int | undefined {
    return <Int | undefined>NumberUtil.tryClamp(Math.trunc(val), min, max)
  }

  export function is(val: Int | number): val is Int {
    return Number.isSafeInteger(val)
  }

  export function assert(val: Int | number): asserts val is Int {
    assertTrue(Int.is(val), `${val} is not an Int.`)
  }
}
