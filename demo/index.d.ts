import * as asepriteAtlas from 'aseprite-atlas'

declare global {
  // https://github.com/Microsoft/TypeScript/issues/4336
  export {Animator} from asepriteAtlas
  export {Parser} from asepriteAtlas
  export {Aseprite} from asepriteAtlas
  export {Atlas} from asepriteAtlas
  export {Integer} from asepriteAtlas
  export {Milliseconds} from asepriteAtlas
  export {Rect} from asepriteAtlas
  export {WH} from asepriteAtlas
  export {XY} from asepriteAtlas
}
