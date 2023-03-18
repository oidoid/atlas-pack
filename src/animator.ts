import { Cel, Film, Playback } from '@/atlas-pack'
import { NumUtil } from '@/ooz'
import { Immutable } from '../../ooz/src/types/immutable.ts'

/** Film playback state. */
export class Animator {
  /**
   * The currently loaded animation. Animators have no concept of a "next" film
   * if the loaded completes and rely on the caller to change films as wnated.
   */
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

  /** The active film cel. */
  cel(time: number): Cel {
    // Film length is greater than zero as enforced by parser.
    return this.#film.cels[this.index(time)]!
  }

  get film(): Film {
    return this.#film
  }

  /**
   * @internal
   * The active film cel index.
   */
  index(time: number): number {
    const timeIndex = Math.trunc((time - this.#start) / this.#film.period)

    if (this.played(time)) return endIndex[this.#film.direction](this.#film)

    // The film can loop. Compute the index from the period.
    return period[this.#film.direction](this.#film, timeIndex)
  }

  /** True if film has met its loop count. */
  played(time: number): boolean {
    const loops = (time - this.#start) / this.#film.duration
    return loops >= this.#film.loops
  }

  /**
   * Clear the start time (set the animation to the starting cel) and optionally
   * change the film.
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
  { [playback in Playback]: (film: Film, timeIndex: number) => number }
> = Immutable({
  Forward: (film, timeIndex) => timeIndex % film.cels.length,
  Reverse(film, timeIndex) {
    return (film.cels.length - 1) - (timeIndex % film.cels.length)
  },
  PingPong(film, timeIndex) {
    // The number of copies of the starting cel.
    const start = film.cels[0]!.duration / film.period
    // The number of copies of the ending cel.
    const end = film.cels[film.cels.length - 1]!.duration / film.period
    // This wrapping has to be contiguous. A piecewise gap cannot exist. If the
    // nonnegative values have a one-to-one mapping, the negative values cannot.
    // The reason is that the ending cels have to be skipped when doubling back.
    // The offset for negative wraps below accounts for that.
    const wrap = NumUtil.wrap(
      timeIndex,
      start + end - film.cels.length,
      film.cels.length,
    )
    return Math.abs(wrap < 0 ? (wrap - start + 1) : wrap)
  },
  PingPongReverse(film, timeIndex) {
    return this.PingPong(film, (film.cels.length - 1) - timeIndex)
  },
})

/** Ending indices when loop-limited. */
const endIndex: Readonly<
  { [playback in Playback]: (film: Film) => number }
> = Immutable({
  Forward: (film) => film.cels.length - 1,
  Reverse: () => 0,
  PingPong(film) {
    const start = film.cels[0]!.duration / film.period
    return Math.min(start, film.cels.length - 1)
  },
  PingPongReverse(film) {
    const end = film.cels[film.cels.length - 1]!.duration / film.period
    return Math.max(film.cels.length - (end + 1), 0)
  },
})
