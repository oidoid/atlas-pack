import {Aseprite, Animator, Atlas, Parser} from 'aseprite-atlas'
import {AtlasID} from './atlas-id'

interface Game {
  readonly window: Window
  readonly canvas: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D
  animator: Animator
  readonly atlas: Atlas
  readonly atlasImage: HTMLImageElement
}

function main(window: Window): void {
  console.log(
    `
aseprite-atlas ┌>°┐
            by │  │ddoid
               └──┘
    `.trim()
  )

  const [canvas] = window.document.getElementsByTagName('canvas')
  if (!canvas) throw new Error('Missing canvas.')

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Missing context')

  // Use nearest neighbor scaling.
  context.imageSmoothingEnabled = false

  Promise.all([
    loadJSON('atlas.json').then(Parser.parse),
    loadImage('atlas.png')
  ]).then(([atlas, atlasImage]) => {
    const game = {
      window,
      canvas,
      context,
      animator: {period: 0, exposure: 0},
      atlas,
      atlasImage
    }
    window.requestAnimationFrame(now => loop(game, now, now))
  })
}

/**
 * @arg then Fractional milliseconds.
 * @arg now Fractional milliseconds.
 */
function loop(game: Game, then: number, now: number): void {
  const milliseconds = now - then

  const animation = game.atlas.animations[AtlasID.BackpackerWalkRight]!
  game.animator = Animator.animate(
    game.animator.period,
    game.animator.exposure + milliseconds,
    animation
  )
  const index = Animator.index(game.animator.period, animation.cels)
  const cel = animation.cels[index]!
  const scaledSize = {w: animation.size.w * 16, h: animation.size.h * 16}

  game.context.clearRect(0, 0, game.canvas.width, game.canvas.height)
  game.context.drawImage(
    game.atlasImage,
    cel.position.x,
    cel.position.y,
    animation.size.w,
    animation.size.h,
    0,
    0,
    scaledSize.w,
    scaledSize.h
  )

  window.requestAnimationFrame(then => loop(game, now, then))
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
