import { Cel, CelID, Playback } from '@/atlas-pack';
import { NumUtil, UnumberMillis } from '@/oidlib';
import { Film, InfiniteDuration } from './Film.ts';

export function Animator(
  film: Film,
  start: UnumberMillis = UnumberMillis(0),
): Animator {
  return { film, start };
}

/** Film playback state. */
export interface Animator {
  /** The currently loaded animation. */
  film: Film;

  /**
   * The time the film started playing. Playback position is relative this start
   * time. There are no guards on passing future or past times.
   */
  start: UnumberMillis;
}

export namespace Animator {
  /**
   * Clear the start time (set the animation to the starting cel) and optionally
   * change the film. This is useful when changing films or resetting the active
   * film.
   */
  export function setFilm(
    self: Animator,
    start: UnumberMillis,
    film?: Film,
  ): void {
    self.film = film ?? self.film;
    self.start = start;
  }

  /** @return The active film cel. */
  export function cel(self: Readonly<Animator>, time: UnumberMillis): Cel {
    // Film length is greater than zero as enforced by parser.
    return self.film.cels[index(self, time)]!;
  }

  /** @return The active film cel's ID. */
  export function celID(self: Readonly<Animator>, time: UnumberMillis): CelID {
    return cel(self, time).id;
  }

  /** @return The active film cel index. */
  export function index(self: Readonly<Animator>, time: UnumberMillis): number {
    const periodIndex = Math.trunc((time - self.start) / self.film.period);

    // If the film is infinite and at or exceeded one iteration, show the final
    // cel.
    const infinite = self.film.duration == InfiniteDuration;
    if (infinite && periodIndex >= (self.film.cels.length - 1)) {
      return self.film.cels.length - 1;
    }

    return celIndex[self.film.direction](periodIndex, self.film.cels.length);
  }
}

/**
 * Playback oscillation patterns:
 *
 * - Forward: start at the beginning. Always advance until the end and then
 *   rollover.
 * - Reverse: start at the end. Always reverse until the beginning and then
 *   rollover.
 * - Ping-pong: start at the beginning and double-back at the end.
 */
const celIndex: Readonly<
  Record<Playback, (period: number, len: number) => number>
> = Object.freeze({
  Forward(period, len) {
    return period % len;
  },

  Reverse(period, len) {
    return (len - 1) - (period % len);
  },

  PingPong(period, len) {
    return Math.abs(NumUtil.wrap(period, 2 - len, len)) % len;
  },
});
