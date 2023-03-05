import { Animator, AtlasMeta, Cel } from '@/atlas-pack'
import { assertNonNull } from '@/ooz'
import { XY } from '../../ooz/src/2d/xy/xy.ts'
import atlasJSON from './atlas.json' assert { type: 'json' }
import { FilmID } from './film-id.ts'

interface Demo {
  readonly window: Window
  readonly canvas: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D
  readonly backpacker: Animator
  readonly frog: Animator
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
  const atlasMeta = AtlasMeta.fromJSON<FilmID>(atlasJSON)
  const time = performance.now()
  const demo = {
    window,
    canvas,
    context,
    backpacker: new Animator(atlasMeta.filmByID['backpacker-WalkRight'], time),
    frog: new Animator(atlasMeta.filmByID['frog-EatLoop'], time),
    atlas,
    atlasMeta,
  }
  window.requestAnimationFrame((time) => loop(demo, time))
}

function loop(demo: Demo, time: number): void {
  demo.context.clearRect(0, 0, demo.canvas.width, demo.canvas.height)

  draw(demo, demo.backpacker.cel(time), { x: 0, y: 0 })
  draw(demo, demo.frog.cel(time), { x: 0, y: 128 })

  demo.window.requestAnimationFrame((time) => loop(demo, time))
}

function draw(demo: Demo, cel: Readonly<Cel>, xy: Readonly<XY<number>>): void {
  const scale = 16
  const { bounds } = cel
  const atlasSource = [bounds.x, bounds.y, bounds.w, bounds.h] as const
  const canvasDest = [xy.x, xy.y, bounds.w * scale, bounds.h * scale] as const
  demo.context.drawImage(demo.atlas, ...atlasSource, ...canvasDest)
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
