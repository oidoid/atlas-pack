import {Aseprite} from '../types/Aseprite'
import {Atlas} from '../types/Atlas'
import {Integer} from '../types/Integer'
import {Milliseconds} from '../types/Milliseconds'
import {NumberUtil} from '../utils/NumberUtil'

/** Record and update an Atlas.Animation's state. */
export interface Animator {
  /** Cel index oscillation state. This integer may fall outside of animation
      bounds depending on the animation interval selected by direction. This
      value should be carried over from each call unless the cel is manually
      set. Any integer in [0, length - 1] is always valid. */
  period: Integer

  /** Current cel exposure in milliseconds. When the fractional value meets or
      exceeds the cel exposure duration, the cel is advanced according to
      direction. This value should be carried over from each call with the
      current time step added, and zeroed on manual cel change. */
  exposure: Milliseconds
}

export namespace Animator {
  /** Apply the time since last frame was shown, possibly advancing the
      animation period. */
  export function animate(
    period: Integer,
    exposure: Milliseconds,
    animation: Atlas.Animation
  ): Animator {
    if (animation.cels.length < 1) return {period, exposure}

    // Avoid unnecessary iterations by skipping complete cycles.
    // animation.duration may be infinite but the modulo of any number and
    // infinity is that number.
    exposure = exposure % animation.duration
    while (
      exposure >= animation.cels[index(period, animation.cels)]!.duration
    ) {
      exposure -= animation.cels[index(period, animation.cels)]!.duration
      period = Period[animation.direction](period, animation.cels.length)
    }
    return {period, exposure}
  }

  /** @return The animation cel index. */
  export function index(period: Integer, cels: readonly Atlas.Cel[]): number {
    return Math.abs(period % cels.length)
  }
}

const Period: Readonly<Record<
  Aseprite.AnimationDirection,
  (period: Integer, len: number) => number
>> = Object.freeze({
  /** @arg period An integer in the domain [0, +∞). */
  [Aseprite.AnimationDirection.Forward](period) {
    return (period % Number.MAX_SAFE_INTEGER) + 1
  },

  /** @arg period An integer in the domain (-∞, len - 1]. */
  [Aseprite.AnimationDirection.Reverse](period, len) {
    return (period % Number.MIN_SAFE_INTEGER) - 1 + len
  },

  /** @arg period An integer in the domain [2 - len, len - 1]. */
  [Aseprite.AnimationDirection.PingPong](period, len) {
    return NumberUtil.wrap(period - 1, 2 - len, len)
  }
})
