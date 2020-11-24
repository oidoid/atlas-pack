const [canvas] = document.getElementsByTagName('canvas')
if (!canvas) throw new Error('Missing canvas.')

const context = canvas.getContext('2d')
if (!context) throw new Error('Missing context')

// Use nearest neighbor scaling.
context.imageSmoothingEnabled = false

/** @type {AsepriteAtlas.Animator} */
let animator = {period: 0, exposure: 0}

/**
 * @arg {AsepriteAtlas.Aseprite.File} asepriteJSON
 * @arg {HTMLImageElement} atlasImage
 */
const onLoaded = (asepriteJSON, atlasImage) => {
  const atlas = AsepriteAtlas.Parser.parse(asepriteJSON)
  window.requestAnimationFrame(now => loop(atlas, atlasImage, now, now))
}

/**
 * @arg {AsepriteAtlas.Atlas} atlas
 * @arg {HTMLImageElement} atlasImage
 * @arg {number} then Fractional milliseconds.
 * @arg {number} now Fractional milliseconds.
 */
const loop = (atlas, atlasImage, then, now) => {
  const milliseconds = now - then

  const animation = /** @type {AsepriteAtlas.Atlas.Animation} */ (atlas
    .animations['backpacker-walkRight'])
  animator = AsepriteAtlas.Animator.animate(
    animator.period,
    animator.exposure + milliseconds,
    animation
  )
  const index = AsepriteAtlas.Animator.index(animator.period, animation.cels)
  const cel = /** @type {AsepriteAtlas.Atlas.Cel} */ (animation.cels[index])
  const scaledSize = {w: animation.size.w * 4, h: animation.size.h * 4}

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(
    atlasImage,
    cel.position.x,
    cel.position.y,
    animation.size.w,
    animation.size.h,
    0,
    0,
    scaledSize.w,
    scaledSize.h
  )

  window.requestAnimationFrame(then => loop(atlas, atlasImage, now, then))
}

/**
 * @arg {string} uri
 * @return {Promise<HTMLImageElement>}
 */
const loadImage = uri => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(image)
    image.src = uri
  })
}

/**
 * @arg {string} uri
 * @return {Promise<AsepriteAtlas.Aseprite.File>}
 */
const loadJSON = uri => fetch(uri).then(response => response.json())

Promise.all([
  loadJSON('/demo/atlas.json'),
  loadImage('/demo/atlas.png')
]).then(([json, image]) => onLoaded(json, image))

console.log(
  `
aseprite-atlas ┌>°┐
            by │  │ddoid
               └──┘
  `.trim()
)
