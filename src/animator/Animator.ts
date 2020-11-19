import {Aseprite} from '../types/Aseprite'
import {Atlas} from '../types/Atlas'
import {Integer} from '../types/Integer'
import {Milliseconds} from '../types/Milliseconds'
import {NumberUtil} from '../utils/NumberUtil'

/** Record and update an Atlas.Animation's state. */
export class Animator {
  /** The animation to animate. */
  private _animation: Atlas.Animation

  /** Cel index oscillation state. This integer may fall outside of animation
      bounds depending on the animation interval selected by direction. This
      value should be carried over from each call unless the cel is manually
      set. Any integer in [0, length - 1] is always valid. */
  private _period: Integer

  /** Current cel exposure in milliseconds. When the fractional value meets or
      exceeds the cel's exposure duration, the cel is advanced according to
      direction. This value should be carried over from each call with the
      current time step added, and zeroed on manual cel change. */
  private _exposure: Milliseconds

  constructor(
    animation: Atlas.Animation,
    period: Integer = 0,
    exposure: Milliseconds = 0
  ) {
    this._animation = animation
    this._period = period
    this._exposure = exposure
  }

  get animation(): Atlas.Animation {
    return this._animation
  }

  get period(): Integer {
    return this._period
  }

  /** @return The animation cel index. */
  index(): number {
    return Math.abs(this.period % this.animation.cels.length)
  }

  /** The cel being exposed. */
  cel(): Atlas.Cel {
    return this.animation.cels[this.index()]
  }

  /** The exposure duration in milliseconds of the current cel. */
  get exposure(): Milliseconds {
    return this._exposure
  }

  /** Apply the time since last frame was shown, possibly advancing the
      animation period. */
  animate(time: Milliseconds): void {
    // Avoid unnecessary iterations by skipping complete cycles.
    // animation.duration may be infinite but the modulo of any number and
    // infinity is that number.
    this._exposure = (this.exposure + time) % this.animation.duration
    while (this.exposure >= this.cel().duration) this.advance()
  }

  /** @return The animation cel index. */
  reset(): void {
    this._period = 0
    this._exposure = 0
  }

  private advance(): void {
    this._exposure = Math.max(this._exposure - this.cel().duration, 0)
    this._period = Period[this.animation.direction](
      this.period,
      this.animation.cels.length
    )
  }
}

const Period: Readonly<
  Record<Aseprite.AnimationDirection, (period: Integer, len: number) => number>
> = Object.freeze({
  /** @arg period An integer in the domain [0, +∞). */
  [Aseprite.AnimationDirection.FORWARD](period) {
    return (period % Number.MAX_SAFE_INTEGER) + 1
  },

  /** @arg period An integer in the domain (-∞, len - 1]. */
  [Aseprite.AnimationDirection.REVERSE](period, len) {
    return (period % Number.MIN_SAFE_INTEGER) - 1 + len
  },

  /** @arg period An integer in the domain [2 - len, len - 1]. */
  [Aseprite.AnimationDirection.PING_PONG](period, len) {
    return NumberUtil.wrap(period - 1, 2 - len, len)
  }
})
