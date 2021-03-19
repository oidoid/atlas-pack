# Changelog

Versions and bullets are arranged chronologically from latest to oldest.

## v4.0.0 (unreleased)

- \[API\]\[Animator\] Revise API; add reset()
- \[API\]\[Animator\] Add cel() helper
- \[build\] Drop explicit NPM silencing
- \[build\] Colocate tests
- \[build\] Remove Webpack and NPM workspaces
- \[build\] Upgrade all dependencies
- \[build\] Fix Jest config statement type
- \[docs\] Rename from oddoid to oidoid
- \[build\] Upgrade all dependencies
- \[int\]\[millis\] Rename Integer to Int and Milliseconds to Millis
- \[build\] Use shish-kebab-case for filenames
- \[build\] Enable NPM workspaces and composite projects
- \[build\] Upgrade all dependencies
- \[build\] Upgrade to Webpack v5.5.1
- \[build\] Upgrade to Webpack v5.5.0
- \[Direction\] Rename AnimationDirection to Direction
- \[Animator\] Assume all Animations have at least one Cel
- \[build\] Rebuild the demo assets with Aseprite v1.2.25

## v3.0.0

- \[docs\] Note power of two sprite sheet size issue
- \[enum\] Replace enums with objects and use PascalCasing
- \[test\] Collect Jest coverage
- \[build\] Upgrade all dependencies
  - Significant upgrade to TypeScript, Webpack, and other dependencies.
  - Source maps now output.
  - Name library as "AsepriteAtlas" for UMD usage.
  - Rename dist/main.js build product to index.js.
- \[docs\] add NPM keywords
- \[docs\] drop trailing URL slash
- \[dev\] \[build\] drop needless line continuation
- \[docs\] emphasize demo

## v2.0.9

- \[dev\] \[build\] upgrade dependencies
- \[dev\] \[build\] remove needless jest config param

## v2.0.8

- \[dev\] \[build\] push branch with tag when versioning

## v2.0.7

- \[dev\] \[docs\] revise examples
- \[dev\] \[build\] improve version scripts
- \[docs\] add todos

## v2.0.6

- \[dev\] \[demo\] \[build\] add type checking to demo
- \[docs\] \[NPM\] revise keywords

## v2.0.5

- \[dev\] drop ts-node dependency by moving to JavaScript Webpack configuration
- \[dev\] \[docs\] link to live demo and GitHub page

## v2.0.4

- \[update\] \[Atlas\] add image filename, format, and dimension properties
- \[dev\] \[typings\] move readonly specifiers to point of use
- \[dev\] \[typings\] expose supporting types
- \[dev\] \[docs\] add demo and demo tests
- \[dev\] \[build\] upgrade TypeScript from v3.6.3 to 3.6.4
- \[docs\] \[CLI\] fix outdated asepriteExportAtlas references and example
- \[dev\] \[VS Code\] ignore demo/node_modules and Aseprite spelling

## v2.0.3

- \[docs\] \[dev\] revise some JSDocs and export syntax

## v2.0.2

- \[docs\] revise description in readme

## v2.0.1

- \[fix\] \[CLI\] outdated asepriteExportAtlas references

## v2.0.0

- \[docs\] add JavaScript example and revise readme
- \[breaking\] \[CLI\] rename asepriteExportAtlas to aseprite-atlas-pack
- \[typings\] \[build\] move typing outputs up a level

## v1.0.0

- \[breaking\] \[CLI\] remove parser CLI support and add validation
- \[dev\] \[build\] transition from NPM prepublish script to prepublishOnly

## v0.0.3

- \[fix\] \[build\] \[typings\] include Aseprite and Atlas in exports

## v0.0.2

- \[fix\] \[build\] \[typings\] publish TypeScript definitions

## v0.0.1

- Initial release
