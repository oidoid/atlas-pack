import { Anim, Cel, CelID, Playback } from '@/atlas-pack';
import { I32, NumUtil, UnumberMillis } from '@/oidlib';

export function Animator(animation: Anim): Animator {
  return { animation, period: I32(0), exposure: UnumberMillis(0) };
}

/** Record and update `Anim` playback state. */
export interface Animator {
  /**
   * The current animation cycle offset, used to track oscillation state and
   * calculate index. The animation may be changed after construction but use
   * `reset()` which will also clear the period and duration.
   */
  animation: Anim;

  /**
   * `Cel` index oscillation state. This integer may fall outside of animation
   * bounds (even negative) depending on the animation interval selected by
   * direction. This value should be carried over from each call unless the
   * `Cel` is manually set. Any integer in [0, `Anim.cels.length`) is
   * always valid. Aseprite indices are u16s but a period can be negative.
   *
   * Every `Anim` is expected to have at least one `Cel` as validated by
   * the parser.
   */
  period: I32;

  /**
   * Current `Cel` exposure in milliseconds. When the fractional value meets or
   * exceeds the `Cel` exposure duration, the `Cel` is advanced according to
   * direction. This value should be carried over from each call with the
   * current time step added, and zeroed on manual `Cel` change. Any number in
   * [0, ∞) is valid.
   */
  exposure: UnumberMillis;
}

export namespace Animator {
  /**
   * Clear the exposure time and set the animation to the starting cel. This is
   * useful when changing animations.
   */
  export function reset(
    self: Animator,
    animation: Anim = self.animation,
  ): void {
    self.animation = animation;
    self.period = I32(0);
    self.exposure = UnumberMillis(0);
  }

  /** Change the animation cel and reset the exposure. */
  export function set(self: Animator, period: I32): void {
    self.period = period;
    self.exposure = UnumberMillis(0);
  }

  /**
   * Apply the time since last frame was shown, possibly advancing the
   * `Anim` period. The worst case scenario is when `exposure` is
   * `animation.duration - 1` which would iterate over every `Cel` in the
   * `Anim`. Since `Anim`s are usually animated every frame, this
   * is expected to be a rarity.
   *
   * @arg exposure The time delta since the last call to animate(). For example,
   *  in a 60 frames per second animation, this is often ~16.667 milliseconds.
   */
  export function animate(self: Animator, exposure: UnumberMillis): void {
    // Avoid unnecessary iterations by skipping complete `Anim` cycles.
    // `animation.duration` may be infinite but the modulo of any number and
    // infinity is that number. Duration is positive.
    self.exposure = UnumberMillis(
      (self.exposure + exposure) % self.animation.duration,
    );
    for (
      let { duration } = cel(self);
      self.exposure >= duration;
      { duration } = cel(self)
    ) {
      self.exposure = UnumberMillis(self.exposure - duration);
      self.period = nextPeriod[self.animation.direction](
        self.period,
        self.animation.cels.length,
      );
    }
  }

  // isEnd() true if last cel and finite duration has passed

  /** @return The `Anim` `Cel` for period. */
  export function cel(self: Readonly<Animator>): Cel {
    // Anim length is greater than zero as enforced by parser.
    return self.animation.cels[index(self)]!;
  }

  /** @return The `Anim` `CelID` for period. */
  export function celID(self: Readonly<Animator>): CelID {
    return cel(self).id;
  }

  /** @return The `Anim` `Cel` index for period. */
  export function index(self: Readonly<Animator>): number {
    return Math.abs(self.period % self.animation.cels.length);
  }
}

/** Given a period and `Anim` size, advance to the next period. */
const nextPeriod: Readonly<
  Record<Playback, (period: I32, len: number) => I32>
> = Object.freeze({
  /** @arg period An integer in the domain [0, len - 1]. */
  Forward(period) {
    return I32((period % I32.max) + 1);
    // return I32.mod(period + 1);
  },

  /** @arg period An integer in the domain (-∞, len - 1]. */
  Reverse(period, len) {
    return I32((period % I32.min) - 1 + len);
    // return I32.mod(period - 1 + len);
  },

  /** @arg period An integer in the domain [2 - len, len - 1]. */
  PingPong(period, len) {
    return I32(NumUtil.wrap(period - 1, 2 - len, len));
  },
});
