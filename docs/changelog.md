# Changelog

Versions and bullets are arranged chronologically from latest to oldest.

## v8.0.0

- \[API\] Drop namespaces and remove int typing.

## v7.1.0

- \[API\] Add Animator.played().

## v7.0.0

- \[API\] Support Aseprite vAseprite 1.3-rc1-x64

## v6.0.0

- \[API\] Class-ify XY and Box; add AtlasMeta.fromJSON().

## v5.0.0

- \[API\] Refactor Animator as a class
- \[API\] Rename some Animator APIs
- \[API\] Remove Animator.celID(), index(), played() and advanced()
- \[fix\] Infinite duration check for reverse
- \[API\] Use film terminology over animation.
- \[API\] Use integers for duration for plain JSON compatibility.
- \[API\] Make cel lookup constant time.

## v4.0.2

- \[doc\] Degrade Markdown for Deno registry

## v4.0.1

- \[fix\] Fix atlas-pack executable

## v4.0.0

- Migrate to Deno
- \[build\]\[API\] Extract math to matoid repo
- \[API\]\[Cel\] Move position into bounds
- \[API\]\[Int\] Check integers at runtime
- \[API\]\[Parser\]\[Atlas\] Validate Atlas ID members
- \[build\]\[API\] Extract math to sub-project and rename lib to aseprite-atlas
- \[API\]\[Animator\] Revise API; add reset()
- \[API\]\[Animator\] Add cel() helper
- \[build\] Drop explicit NPM silencing
- \[build\] Colocate tests
- \[build\] Remove Webpack and NPM workspaces
- \[build\] Upgrade all dependencies
- \[build\] Fix Jest config statement type
- \[doc] Rename from oddoid to oidoid
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

- \[doc] Note power of two sprite sheet size issue
- \[enum\] Replace enums with objects and use PascalCasing
- \[test\] Collect Jest coverage
- \[build\] Upgrade all dependencies
  - Significant upgrade to TypeScript, Webpack, and other dependencies.
  - Source maps now output.
  - Name library as "AsepriteAtlas" for UMD usage.
  - Rename dist/main.js build product to index.js.
- \[doc] add NPM keywords
- \[doc] drop trailing URL slash
- \[dev\] \[build\] drop needless line continuation
- \[doc] emphasize demo

## v2.0.9

- \[dev\] \[build\] upgrade dependencies
- \[dev\] \[build\] remove needless jest config param

## v2.0.8

- \[dev\] \[build\] push branch with tag when versioning

## v2.0.7

- \[dev\] \[doc] revise examples
- \[dev\] \[build\] improve version scripts
- \[doc] add todos

## v2.0.6

- \[dev\] \[demo\] \[build\] add type checking to demo
- \[doc] \[NPM\] revise keywords

## v2.0.5

- \[dev\] drop ts-node dependency by moving to JavaScript Webpack configuration
- \[dev\] \[doc] link to live demo and GitHub page

## v2.0.4

- \[update\] \[Atlas\] add image filename, format, and dimension properties
- \[dev\] \[typings\] move readonly specifiers to point of use
- \[dev\] \[typings\] expose supporting types
- \[dev\] \[doc] add demo and demo tests
- \[dev\] \[build\] upgrade TypeScript from v3.6.3 to 3.6.4
- \[doc] \[CLI\] fix outdated asepriteExportAtlas references and example
- \[dev\] \[VS Code\] ignore demo/node_modules and Aseprite spelling

## v2.0.3

- \[doc] \[dev\] revise some JSDocs and export syntax

## v2.0.2

- \[doc] revise description in readme

## v2.0.1

- \[fix\] \[CLI\] outdated asepriteExportAtlas references

## v2.0.0

- \[doc] add JavaScript example and revise readme
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
