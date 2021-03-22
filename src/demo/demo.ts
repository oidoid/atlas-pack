import {
  Animator,
  Aseprite,
  Atlas,
  Parser
} from '../aseprite-atlas/aseprite-atlas.js'
import {AtlasID} from './atlas-id.js'

type Game = {
  readonly window: Window
  readonly canvas: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D
  animator: Animator
  readonly atlas: Atlas<AtlasID>
  readonly atlasImage: HTMLImageElement
}

function main(window: Window): void {
  console.log(
    `
aseprite-atlas ┌>°┐
            by │  │idoid
               └──┘
    `.trim()
  )

  const [canvas] = window.document.getElementsByTagName('canvas')
  if (!canvas) throw Error('Canvas missing.')

  const context = canvas.getContext('2d')
  if (!context) throw Error('Context missing.')

  // Use nearest neighbor scaling.
  context.imageSmoothingEnabled = false

  Promise.all([
    loadJSON('atlas.json').then(json => Parser.parse(json, AtlasID.values)),
    loadImage('atlas.png')
  ]).then(([atlas, atlasImage]) => {
    const animation = atlas.animations['backpacker-walkRight']!
    const game = {
      window,
      canvas,
      context,
      animator: Animator(animation),
      atlas,
      atlasImage
    }
    window.requestAnimationFrame(now => loop(game, now, now))
  })
}

function loop(game: Game, then: number, now: number): void {
  const millis = now - then

  game.context.clearRect(0, 0, game.canvas.width, game.canvas.height)

  Animator.animate(game.animator, millis)

  const cel = Animator.cel(game.animator)
  const src = <const>[cel.bounds.x, cel.bounds.y, cel.bounds.w, cel.bounds.h]
  const dst = <const>[0, 0, cel.bounds.w * 16, cel.bounds.h * 16]
  game.context.drawImage(game.atlasImage, ...src, ...dst)

  game.window.requestAnimationFrame(then => loop(game, now, then))
}

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(image)
    image.src = uri
  })
}

function loadJSON(uri: string): Promise<Aseprite.File> {
  return fetch(uri).then(response => response.json())
}

main(window)
