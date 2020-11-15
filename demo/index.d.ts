import AsepriteAtlas from 'aseprite-atlas'

// This takes the place of re-exporting each export:
//
//   export {Animator} from 'aseprite-atlas'
//   export {Parser} from 'aseprite-atlas'
//   ...
export = AsepriteAtlas

// Everything in this module is under a variable that matches the
// `webpack.Configuration.output.library` name.
export as namespace AsepriteAtlas
