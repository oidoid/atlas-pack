import { Cel, Film, InfiniteDuration, Playback } from '@/atlas-pack'
import { NumUtil } from '@/ooz'

/** Film playback state. */
export class Animator {
  /** The currently loaded animation. */
  #film: Film

  /**
   * The time the film started playing. Playback position is relative this start
   * time.
   */
  #start: number

  constructor(film: Film, start: number = 0) {
    this.#film = film
    this.#start = start
  }

  /** @return The active film cel. */
  cel(time: number): Cel {
    // Film length is greater than zero as enforced by parser.
    return this.#film.cels[this.index(time)]!
  }

  get film(): Film {
    return this.#film
  }

  /**
   * @internal
   * @return The active film cel index.
   */
  index(time: number): number {
    const timeIndex = Math.trunc((time - this.#start) / this.#film.period)

    // If the film is infinite and at or exceeded the end, return the final cel.
    const infinite = this.#film.duration == InfiniteDuration
    const loops = timeIndex / this.#film.cels.length
    if (infinite && loops >= 1 || loops >= this.#film.loops) {
      return this.#film.cels.length - 1
    }

    // The film can loop. Compute the index from the period.
    return period[this.#film.direction](timeIndex, this.#film.cels.length)
  }

  /**
   * Clear the start time (set the animation to the starting cel) and optionally
   * change the film. This is useful to reset the active film or switch films.
   */
  reset(start: number, film?: Film): void {
    this.#film = film ?? this.#film
    this.#start = start
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
 * - Ping-pong reverse (-len, len): start at the array end and double-back at
 *   each end.
 */
const period: Readonly<
  { [playback in Playback]: (timeIndex: number, len: number) => number }
> = Object.freeze({
  Forward: (timeIndex, len) => timeIndex % len,
  Reverse: (timeIndex, len) => (len - 1) - (timeIndex % len),
  PingPong: (timeIndex, len) => Math.abs(NumUtil.wrap(timeIndex, 2 - len, len)),
  PingPongReverse: (timeIndex, len) =>
    Math.abs(NumUtil.wrap((len - 1) - timeIndex, 2 - len, len)),
})
