const [canvas] = document.getElementsByTagName('canvas')
if (!canvas) throw new Error('Missing canvas.')

const context = canvas.getContext('2d')
if (!context) throw new Error('Missing context')

// Use nearest neighbor scaling.
context.imageSmoothingEnabled = false

/** @type {Animator} */
let animator = {period: 0, exposure: 0}

/** @arg {Aseprite.File} asepriteJSON
    @arg {HTMLImageElement} atlasImage */
function onLoaded(asepriteJSON, atlasImage) {
  const atlas = Parser.parse(asepriteJSON)
  window.requestAnimationFrame(now => loop(atlas, atlasImage, now, now))
}

/** @arg {Atlas} atlas
    @arg {HTMLImageElement} atlasImage
    @arg {number} then Fractional milliseconds.
    @arg {number} now Fractional milliseconds. */
function loop(atlas, atlasImage, then, now) {
  const milliseconds = now - then

  const animation = atlas.animations['backpacker-walkRight']
  animator = Animator.animate(
    animator.period,
    animator.exposure + milliseconds,
    animation
  )
  const index = Animator.index(animator.period, animation.cels)
  const cel = animation.cels[index]
  const scaledSize = {w: animation.size.w * 10, h: animation.size.h * 10}

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

/** @arg {string} uri
    @return {Promise<HTMLImageElement>} */
function loadImage(uri) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(image)
    image.src = uri
  })
}

/** @arg {string} uri
    @return {Promise<JSON>} */
function loadJSON(uri) {
  return fetch(uri).then(rsp => rsp.json())
}

Promise.all([
  loadJSON('/demo/atlas.json'),
  loadImage('/demo/atlas.png')
]).then(([json, image]) => onLoaded(json, image))
