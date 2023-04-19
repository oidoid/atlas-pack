import { Animator, Atlas, Cel } from '@/atlas-pack'
import atlasJSON from './atlas.json' assert { type: 'json' }
import { FilmID } from './film-id.ts'

interface Demo {
  readonly window: Window
  readonly canvas: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D
  readonly backpacker: Animator
  readonly frog: Animator
  readonly sheet: HTMLImageElement
  readonly atlas: Atlas<FilmID>
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
  if (canvas == null) throw Error('Canvas missing.')

  const context = canvas.getContext('2d')
  if (context == null) throw Error('Context missing.')

  // Use nearest neighbor scaling.
  context.imageSmoothingEnabled = false

  const atlas = Atlas.fromJSON<FilmID>(atlasJSON)
  const time = performance.now()
  const demo = {
    window,
    canvas,
    context,
    backpacker: new Animator(atlas.filmByID['backpacker--WalkRight'], time),
    frog: new Animator(atlas.filmByID['frog--EatLoop'], time),
    sheet: await loadImage('atlas.png'),
    atlas,
  }
  window.requestAnimationFrame((time) => loop(demo, time))
}

function loop(demo: Demo, time: number): void {
  demo.context.clearRect(0, 0, demo.canvas.width, demo.canvas.height)

  draw(demo, demo.backpacker.cel(time), 0, 0)
  draw(demo, demo.frog.cel(time), 0, 128)

  demo.window.requestAnimationFrame((time) => loop(demo, time))
}

function draw(demo: Demo, cel: Readonly<Cel>, x: number, y: number): void {
  const scale = 16
  const { bounds } = cel
  const atlasSource = [bounds.x, bounds.y, bounds.w, bounds.h] as const
  const canvasDest = [x, y, bounds.w * scale, bounds.h * scale] as const
  demo.context.drawImage(demo.sheet, ...atlasSource, ...canvasDest)
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
