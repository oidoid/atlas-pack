import { Cel, CelID, Film, InfiniteDuration, Playback } from '@/atlas-pack';
import { NumUtil, UnumberMillis } from '@/oidlib';

/** Film playback state. */
export class Animator {
  /** The currently loaded animation. */
  #film: Film;

  /**
   * The time the film started playing. Playback position is relative this start
   * time.
   */
  #start: UnumberMillis;

  get film(): Film {
    return this.#film;
  }

  constructor(film: Film, start: UnumberMillis = UnumberMillis(0)) {
    this.#film = film;
    this.#start = start;
  }

  /** @return The active film cel. */
  cel(time: UnumberMillis): Cel {
    // Film length is greater than zero as enforced by parser.
    return this.#film.cels[this.index(time)]!;
  }

  /** @return The active film cel's ID. */
  celID(time: UnumberMillis): CelID {
    return this.cel(time).id;
  }

  /** @return The active film cel index. */
  index(time: UnumberMillis): number {
    const timeIndex = Math.trunc((time - this.#start) / this.#film.period);

    // If the film is infinite and at or exceeded the end, return the final cel.
    const infinite = this.#film.duration == InfiniteDuration;
    if (infinite && timeIndex >= (this.#film.cels.length - 1)) {
      return this.#film.cels.length - 1;
    }

    // The film can loop. Compute the index from the period.
    return period[this.#film.direction](timeIndex, this.#film.cels.length);
  }

  /**
   * Clear the start time (set the animation to the starting cel) and optionally
   * change the film. This is useful when changing films or resetting the active
   * film.
   */
  reset(start: UnumberMillis, film?: Film): void {
    this.#film = film ?? this.#film;
    this.#start = start;
  }
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
