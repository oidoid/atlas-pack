import {Aseprite} from '../types/Aseprite'
import {Atlas} from '../types/Atlas'
import {Integer} from '../types/Integer'
import {Milliseconds} from '../types/Milliseconds'
import {NumberUtil} from '../utils/NumberUtil'

/** Record and update an `Animation`'s state. */
export interface Animator {
  /**
   * `Cel` index oscillation state. This integer may fall outside of animation
   * bounds (even negative) depending on the animation interval selected by
   * direction. This value should be carried over from each call unless the
   * `Cel` is manually set. Any integer in [0, `Animation.cels.length`) is
   * always valid. Aseprite indices are u16s but a period can be negative.
   *
   * Every `Animation` is expected to have at least one `Cel`.
   */
  period: Integer

  /**
   * Current `Cel` exposure in milliseconds. When the fractional value meets or
   * exceeds the `Cel` exposure duration, the `Cel` is advanced according to
   * direction. This value should be carried over from each call with the
   * current time step added, and zeroed on manual `Cel` change.
   */
  exposure: Milliseconds
}

export namespace Animator {
  /**
   * Apply the time since last frame was shown, possibly advancing the
   * `Animation` period.
   */
  export function animate(
    period: Integer,
    exposure: Milliseconds,
    animation: Atlas.Animation
  ): Animator {
    // Avoid unnecessary iterations by skipping complete `Animation` cycles.
    // `animation.duration` may be infinite but the modulo of any number and
    // infinity is that number. Duration is positive.
    exposure = exposure % animation.duration
    while (
      exposure >= animation.cels[index(period, animation.cels)]!.duration
    ) {
      exposure -= animation.cels[index(period, animation.cels)]!.duration
      period = Period[animation.direction](period, animation.cels.length)
    }
    return {period, exposure}
  }

  /** @return The `Animation` `Cel` index. */
  export function index(period: Integer, cels: readonly Atlas.Cel[]): Integer {
    return Math.abs(period % cels.length)
  }
}

const Period: Readonly<
  Record<Aseprite.Direction, (period: Integer, len: number) => Integer>
> = Object.freeze({
  /** @arg period An integer in the domain [0, +∞). */
  [Aseprite.Direction.Forward](period) {
    return (period % Number.MAX_SAFE_INTEGER) + 1
  },

  /** @arg period An integer in the domain (-∞, len - 1]. */
  [Aseprite.Direction.Reverse](period, len) {
    return (period % Number.MIN_SAFE_INTEGER) - 1 + len
  },

  /** @arg period An integer in the domain [2 - len, len - 1]. */
  [Aseprite.Direction.PingPong](period, len) {
    return NumberUtil.wrap(period - 1, 2 - len, len)
  }
})
