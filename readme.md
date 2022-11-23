# 🗺️ atlas-pack

atlas-pack is an Aseprite sprite sheet parser, animator, and toolset for the
browser and Deno. See [installation](#installation) and the
**[minimal example](#minimal-example)** to get started.

## Installation

Add `https://deno.land/x/atlas_pack/mod.ts` to your import modules and reference
the `https://deno.land/x/atlas_pack/mods.json` import map.

See the [changelog](docs/changelog.md) for release notes.

## Sprite Sheets and Atlases

Sprite sheets, also known as atlases, maximize GPU texture mapping unit and bus
bandwidth performance by packing logical individual textures together into
larger texture compositions. These necessary efficiency gains increase
complexity as textures no longer map directly to distinct files but instead must
be looked up by coordinates.

The following example sprite sheet was generated from two files,
[frog.aseprite](demo/frog.aseprite) and
[backpacker.aseprite](demo/backpacker.aseprite), using
[`atlas-pack`](#generate-the-atlas-cli). The frog has a single eight-frame
animation and the backpacker has three animations, one nine-frame and two
eight-frames. All frames are embedded in a single, static sprite sheet PNG file.
Any animation can be rendered programmatically from this file, such as this one
of the backpacker walking right.

![An example sprite sheet generated from two separate .aseprite files (left) can be used to render any animation cycle or image it contains (right).](docs/sheet-to-render.gif)

_Above left: All animation frames are embedded into a single PNG. Above right:
Any sub-textures from the sheet can then be efficiently rendered._

Although this readme is constrained to use GIFs for animation, an atlas-pack
consumer would instead render all animations from the static sprite sheet PNG
file as shown in the [API demo](https://atlas-pack.netlify.com/demo).

Some or all embedded sprites may not be animated. For example, a common use case
for sprite sheets is drawing text:

![mem font sprite sheet.](https://raw.githubusercontent.com/oidoid/mem/main/dist/mem-prop-5x6-10x-sheet.png)

_Above: A complete font embedded in a single sprite sheet._

## Usage

### Overview

![The design, pack, and run workflow.](docs/workflow.png)

There are three steps in the workflow:

- **Design**: Aseprite pixeling as per usual. Draw, tag, and slice sprites
  across `*.aseprite` files as wanted.
- **Pack**: Concatenate all Aseprite rendered outputs using `atlas-pack` as part
  of a project's build process. A single, big PNG sprite sheet containing all
  frames of animation from all input files as well as an associated JSON texture
  lookup file are output.
- **Run**: Parse the sprite sheet JSON and generate an immutable sprite `Atlas`
  optimized for lookup and sharing. Every distinct renderable object should then
  create its own `Animator` state. Finally, `Animator` is used to update and
  render the `Film` state sub-textures each frame.

Aseprite itself provides everything needed. However, the latter two steps
benefit from the tooling provided by atlas-pack:

- `atlas-pack`: A thin wrapper around the Aseprite executable with the defaults
  expected by the `AtlasMetaParser`.
- `AtlasMetaParser`: Accepts a sprite sheet JSON file and outputs an immutable
  `AtlasMeta` for efficient `Film` (animation) sub-texture lookup. Each sprite
  sheet has one `AtlasMeta` object.
- `Animator`: The current playback state for a given `Film`. There are often
  multiple distinct `Animator`s associated with the same `Film`. A renderer
  should consult `Animator` states to determine the appropriate sub-texture
  regions to blit from the `Atlas` each loop.

See the [API demo source](demo/mod.ts)!

### Pack the Sprite Sheet (CLI)

Given a list of Aseprite files, pack all images and animations into a single
sprite sheet:

```sh
deno \
  run \
  --allow-run \
  https://deno.land/x/atlas_pack/bin/atlas-pack \
  --sheet atlas.png \
  --data atlas.json \
  *.aseprite
```

The output is a big image of sprites (`atlas.png`) and an
[`Aseprite.File`](src/Aseprite.ts) (`atlas.json`) which is ready for parsing.
These outputs should be regenerated any time assets (Aseprite files) change,
usually as part of a build step.

<details markdown>
<summary>💡 Troubleshooting…</summary>

The tool expects Aseprite and Node.js executables to be installed and in the
system environment `PATH`. If you get a command not found error, you probably
need to revise your `PATH` before running the tool. _Something_ like:

```bash
# Add the Aseprite and Node.js binary executable folders to the command path
# lookup environment variable. Linux, macOS, and Windows operating systems all
# have the notion of system paths that are searched whenever executing a command
# in the command line terminal, although the program locations and syntaxes may
# vary.
#
# In this example for Bash on Linux, any previously set locations are searched
# first. It's usually a good idea to preserve these locations. A delimiter, `:`
# separates the second path to search,
# `/Applications/Aseprite.app/Contents/MacOS` where we hope to find an
# executable named `aseprite`. A second delimiter follows, and finally a made up
# location to Deno binaries like `deno` for purposes of example.
export PATH="$PATH:/Applications/Aseprite.app/Contents/MacOS:/path/to/deno"

# Execute the tool (same as noted above).
deno \
  run \
  --allow-run \
  https://deno.land/x/atlas_pack/bin/atlas-pack \
  --sheet atlas.png \
  --data atlas.json \
  *.aseprite
```

If the tool executes without any errors, no need to worry about changing the
`PATH`.

</details>

### Parse and Render (JavaScript)

Once `atlas.json` and `atlas.png` are available, a program can parse
`atlas.json` to animate and render animations from `atlas.png`. A complete but
minimal example follows. Subsequent sections detail each step in the example.

#### Minimal Example

All together, parse the packed sprite sheet and play the frog's idle animation:

```js
import { Animator, AtlasMetaParser } from 'atlas_pack';
import asepriteJSON from './atlas.json' assert { type: 'json' };

const meta = AtlasMetaParser.parse(asepriteJSON);

const film = meta.filmByID['FrogIdle'];
const animator = Animator(film);

Animator.animate(animator, 16.667);
const { start, end } = Animator.cel(animator).bounds;
console.log(start.x, start.y, end.x, end.y);
```

`Animator.animate()` usually occurs within a loop.
[See the API demo](https://atlas-pack.netlify.com/demo) for a running example
rendered to a canvas.

The following sections only detail the above example.

##### Parsing

Parse the `Aseprite.File` into an `AtlasMeta`:

```js
import { AtlasMetaParser } from 'atlas-pack';
import asepriteJSON from './atlas.json' assert { type: 'json' };

// Parse the Aseprite.File (atlas.json) into an AtlasMeta.
const meta = AtlasMetaParser.parse(asepriteJSON);
```

##### Retrieve a Film from the Atlas

Animations are stateless and are retrieved by Aseprite tag:

```js
// Retrieve the Film tagged "FrogIdle".
const film = meta.filmByID['FrogIdle'];
```

##### Create an Animator and Animate It

```js
import { Animator } from 'atlas-pack';

// Create a mutable Animator state. Animators keep a record of the cel index
// oscillation period (which is used to derive the active index for the cels
// array) and its exposure timer (which is used to determine when the period
// should be advanced). Animators are just plain data.
const animator = Animator(animation);

// Animate by 1/60th of a second (~16.667 milliseconds). Depending on the cel
// duration specified in Aseprite, this may or may not advance the active cel.
// For a multi-cel forward animation where the first cel has a 10 millisecond
// duration, animator's state would be {animation, period: 1, exposure: 6.667}.
Animator.animate(animator, 16.667);
```

##### Render the Animation

Once the animation has been animated, the current cel should be shown each
render loop:

```js
// Print the location of the active cel within the sprite sheet PNG.
const cel = Animator.cel(animator);
const { start, end } = cel.bounds;
console.log(start.x, start.y, end.x, end.y);
```

## Features

atlas-pack adds little:

- A utility for playing Aseprite animations (forward, reverse, or ping-pong).
  Mutable and immutable states are kept distinct.
- A sparser data structure that includes linking animation cels together in the
  same array and associating Aseprite slices with their cels. This can be useful
  for collision detection, for example.
- Cel ID to bounds look-up-table. This is useful
- Support (by convention) for infinite durations. When a cel duration is set to
  65 535 (hexadecimal ffff) in the Aseprite GUI, it will be parsed in JavaScript
  as `Number.POSITIVE_INFINITY`.
- TypeScript typings for the Aseprite file format.
- Tests for parsing and playback.
- Open source.
- Easy to replace. If atlas-pack doesn't meet your needs, it should be easy to
  migrate to a solution that does.

You might not need it.

## Functionality Not Provided

atlas-pack performs light parsing to restructure the standard Aseprite format
into a more useful one for animation and slice association. Consumers will
likely need to provide additional code for creating and managing sprites,
collision detection, etc. It is hoped that by focusing on a small set of
responsibilities with a simple API, it will be easy to use (or not use) this
library.

Cel durations are allowed to be infinite. This means they are incompatible with
JSON (JSON5 supports infinite values). As an alternative, the parser can output
a JavaScript file instead.

## Assumptions and Conventions

### Assumptions

The Aseprite CLI is flexible and can produce a many different formats. The
atlas-pack library expects an input generated by the options used in
[atlas-pack](bin/atlas-pack). Only the current version of Aseprite,
v1.3-beta21-x64, is tested.

### Conventions

Some wanted functionality is not modeled in the stock Aseprite format. This
section lists conventions used by atlas-pack. It's possible to forget to apply
these conventions, which can lead to bugs that atlas-pack cannot detect. To the
extent possible, consumers should add tests for conventions unique to their code
or, even better, test that parsing succeeds. See
[the demo parsing test](demo/atlas.json.test.ts).

- A duration of 65 535 (hexadecimal ffff) is considered a special value by
  atlas-pack and parsed as `Number.POSITIVE_INFINITY`. This value is only
  permitted in the last cel of a tagged animation but can appear in multiple
  tagged animations within the same Aseprite file.
- Slices are associated to cels by AnimationID. This is error-prone for artists
  so consumers may wish to add tests to assure that all slices are associated to
  a cel tag.

## Development

Incomplete work is tracked under [todo](docs/to-do.text).

## License

© oidoid.

### AGPL-3.0-only

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.

```
╭>°╮┬┌─╮╭─╮┬┌─╮
│  │││ ││ │││ │
╰──╯┴└─╯╰─╯┴└─╯
```
