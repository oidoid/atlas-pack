import { Animator, AtlasMeta } from '@/atlas-pack'
import { assertNonNull } from '@/ooz'
import atlasJSON from './atlas.json' assert { type: 'json' }
import { FilmID } from './film-id.ts'

interface Demo {
  readonly window: Window
  readonly canvas: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D
  readonly animator: Animator
  readonly atlas: HTMLImageElement
  readonly atlasMeta: AtlasMeta<FilmID>
}

async function main(window: Window): Promise<void> {
  console.log(
    `
atlas-pack ┌>°┐
        by │  │idoid
           └──┘
    `.trim(),
  )

  const canvas = window.document.getElementsByTagName('canvas').item(0)
  assertNonNull(canvas, 'Canvas missing.')

  const context = canvas.getContext('2d')
  assertNonNull(context, 'Context missing.')

  // Use nearest neighbor scaling.
  context.imageSmoothingEnabled = false

  const atlas = await loadImage('atlas.png')
  const atlasMeta = atlasJSON as unknown as AtlasMeta<FilmID>
  const film = atlasMeta.filmByID.BackpackerWalkRight
  const demo = {
    window,
    canvas,
    context,
    animator: new Animator(film),
    atlas,
    atlasMeta,
  }
  window.requestAnimationFrame((now) => loop(demo, now, now))
}

function loop(demo: Demo, _then: number, now: number): void {
  demo.context.clearRect(0, 0, demo.canvas.width, demo.canvas.height)

  const scale = 16
  const { bounds } = demo.animator.cel(now)
  const atlasSource = [bounds.x, bounds.y, bounds.w, bounds.h] as const
  const canvasDestination = [0, 0, bounds.w * scale, bounds.h * scale] as const
  demo.context.drawImage(demo.atlas, ...atlasSource, ...canvasDestination)

  demo.window.requestAnimationFrame((then) => loop(demo, now, then))
}

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(image)
    image.src = uri
  })
}

await main(window)
