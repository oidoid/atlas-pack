import {assert} from './assert.js'

/** @internal */
export namespace NumberUtil {
  /**
   * @arg min An integer < max
   * @arg max An integer > min
   * @return A value wrapped to the domain [min, max).
   */
  export function wrap(val: number, min: number, max: number): number {
    if (min === max) return min
    assert(max > min, `max=${max} < min=${min}.`)
    const range = max - min // range ∈ [0, +∞).
    const x = (val - min) % range // Subtract min and wrap to x ∈ (-range, range).
    const y = x + range // Translate to y ∈ (0, 2 * range).
    const z = y % range // Wrap to z ∈ [0, range).
    return z + min // Add min to return ∈ [min, max).
  }

  export function tryClamp(
    val: number,
    min: number,
    max: number
  ): number | undefined {
    assert(max >= min, `max=${max} < min=${min}.`)
    return Number.isNaN(val) ? undefined : Math.min(Math.max(val, min), max)
  }

  type Interval =
    | 'inclusive'
    | 'exclusive'
    | 'inclusive-exclusive'
    | 'exclusive-inclusive'

  export function assertDomain(
    val: number,
    min: number,
    max: number,
    range: Interval
  ): void {
    assert(
      inDomain(val, min, max, range),
      `${val} not in ${formatInterval(min, max, range)}.`
    )
  }

  export function inDomain(
    val: number,
    min: number,
    max: number,
    interval: Interval
  ): boolean {
    return domainTest[interval](val, min, max)
  }

  function formatInterval(
    min: number,
    max: number,
    interval: Interval
  ): string {
    const {start, end} = intervalBrackets[interval]
    return `${start}${min}, ${max}${end}`
  }

  const intervalBrackets = <const>{
    inclusive: {start: '[', end: ']'},
    exclusive: {start: '(', end: ')'},
    'inclusive-exclusive': {start: '[', end: ')'},
    'exclusive-inclusive': {start: '(', end: ']'}
  }

  const domainTest: Readonly<
    Record<Interval, (val: number, min: number, max: number) => boolean>
  > = {
    inclusive: (val, min, max) => val >= min && val <= max,
    exclusive: (val, min, max) => val > min && val < max,
    'inclusive-exclusive': (val, min, max) => val >= min && val < max,
    'exclusive-inclusive': (val, min, max) => val > min && val <= max
  }
}
