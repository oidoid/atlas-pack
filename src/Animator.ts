import { Cel, CelID, Film, InfiniteDuration, Playback } from '@/atlas-pack';
import { NumUtil, UnumberMillis } from '@/oidlib';

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
   * time.
   */
  start: UnumberMillis;
}

/**
 * Playback oscillation patterns:
 *
 * - Forward [0, +∞): start at the array beginning. Advance until the end and
 *   then rollover.
 * - Reverse (-∞, len): start at the array end. Reverse until the beginning and
 *   then rollover.
 * - Ping-pong (-len, len): start at the array beginning and double-back at each
 *   end.
 */
const period: Readonly<
  { [playback in Playback]: (timeIndex: number, len: number) => number }
> = Object.freeze({
  Forward: (timeIndex, len) => timeIndex % len,
  Reverse: (timeIndex, len) => (len - 1) - (timeIndex % len),
  PingPong: (timeIndex, len) => Math.abs(NumUtil.wrap(timeIndex, 2 - len, len)),
});

export namespace Animator {
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
    const timeIndex = Math.trunc((time - self.start) / self.film.period);

    // If the film is infinite and at or exceeded the end, return the final cel.
    const infinite = self.film.duration == InfiniteDuration;
    if (infinite && timeIndex >= (self.film.cels.length - 1)) {
      return self.film.cels.length - 1;
    }

    // The film can loop. Compute the index from the period.
    return period[self.film.direction](timeIndex, self.film.cels.length);
  }

  /**
   * Clear the start time (set the animation to the starting cel) and optionally
   * change the film. This is useful when changing films or resetting the active
   * film.
   */
  export function reset(
    self: Animator,
    start: UnumberMillis,
    film?: Film,
  ): void {
    self.film = film ?? self.film;
    self.start = start;
  }
}
