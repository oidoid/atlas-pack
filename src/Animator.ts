import { Cel, CelID, Film, Playback } from '@/atlas-pack';
import { I32, NumUtil, U16, UnumberMillis } from '@/oidlib';

export function Animator(film: Film): Animator {
  return { film, period: I32(0), exposure: UnumberMillis(0) };
}

/** Film playback state. */
export interface Animator {
  /** The currently loaded animation. */
  film: Film;

  /**
   * Cel index oscillation state used to derive active cel index.
   *
   * Any integer in [0, `Film.cels.length`) is always valid. Aseprite indices
   * are U16s but this period may fall outside of the film bounds (even
   * negative) depending on the `Film.direction` interval.
   *
   * Every Film is expected to have at least one `Cel` as validated by the
   * parser.
   *
   * The period advances when the current cel has met its exposure duration.
   *
   * All films start at period zero.
   */
  period: I32;

  /**
   * Current cel exposure in milliseconds. When the running exposure meets or
   * exceeds the cel exposure duration, the cel is advanced according to the
   * film direction.
   *
   * Any number in [0, `Film.duration`] is valid.
   */
  exposure: UnumberMillis;
}

export namespace Animator {
  /**
   * Clear the exposure time and set the animation to the starting cel. This is
   * useful when changing films or resetting the active film.
   */
  export function setFilm(self: Animator, film: Film = self.film): void {
    self.film = film;
    self.period = I32(0);
    self.exposure = UnumberMillis(0);
  }

  /**
   * Apply the time since last cel was shown, possibly advancing the cel.
   *
   * The worst case scenario is when exposure is `film.duration - 1` which would
   * iterate over every cel in the film. Since films are usually animated every
   * vblank, this is expected to be a rarity.
   *
   * @arg exposure The time delta since the last call to animate(). For example,
   *  in a 60 frames per second animation, this is often ~16.667 milliseconds.
   */
  export function animate(self: Animator, exposure: UnumberMillis): void {
    // Avoid unnecessary iterations by skipping complete playback cycles.
    self.exposure = UnumberMillis(
      (self.exposure + exposure) % self.film.duration,
    );

    // `duration` is greater than zero. Catch the current cel up to the current
    // pending exposure. If the active cell has an infinite duration, the total
    // film duration will be infinite and self.exposure will never meet it.
    for (
      let { duration } = cel(self);
      self.exposure >= duration;
      { duration } = cel(self)
    ) {
      // The current cel has has met or exceeded its exposure requirements.
      // Subtract the active cel's exposure, advance the cel, and continue.
      self.exposure = UnumberMillis(self.exposure - duration);
      self.period = nextPeriod[self.film.direction](
        self.period,
        self.film.cels.length,
      );
    }
  }

  /** @return The active film cel. */
  export function cel(self: Readonly<Animator>): Cel {
    // Film length is greater than zero as enforced by parser.
    return self.film.cels[index(self)]!;
  }

  /** @return The active film cel's ID. */
  export function celID(self: Readonly<Animator>): CelID {
    return cel(self).id;
  }

  /** @return The active film cel index. */
  export function index(self: Readonly<Animator>): U16 {
    return U16(Math.abs(self.period % self.film.cels.length));
  }
}

/** Given a period and film cel sequence size, advance to the next period. */
const nextPeriod: Readonly<
  Record<Playback, (period: I32, len: number) => I32>
> = Object.freeze({
  /** @arg period An integer in the domain [0, len - 1]. */
  Forward(period) {
    // to-do: I32.addMod().
    return I32((period % I32.max) + 1);
  },

  /** @arg period An integer in the domain (-∞, len - 1]. */
  Reverse(period, len) {
    // to-do: I32.addMod().
    return I32((period % I32.min) - 1 + len);
  },

  /** @arg period An integer in the domain [2 - len, len - 1]. */
  PingPong(period, len) {
    return I32(NumUtil.wrap(period - 1, 2 - len, len));
  },
});
