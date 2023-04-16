# 🗺️ atlas-pack

atlas-pack is an Aseprite sprite sheet parser, animator, and toolset for the
browser and Deno. See [installation](#installation) and the
**[example](demo/index.ts)** to get started.

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
file as shown in the [API demo](https://atlas-pack.netlify.com).

Some or all embedded sprites may not be animated. For example, a common use case
for sprite sheets is drawing text:

![mem font sprite sheet.](https://raw.githubusercontent.com/oidoid/mem/main/dist/mem-prop-5x6-10x-sheet.png)

_Above: A complete font embedded in a single sprite sheet._

## Usage

### Overview

There are four steps in the workflow:

- **Design**: Aseprite pixeling as per usual. Draw, tag, and slice sprites
  across `*.aseprite` files as wanted.
- **Export**: Generate a sprite and data sheet using `aseprite-batch`. A single,
  big PNG sprite sheet containing all frames of animation from all input files
  as well as an associated JSON texture lookup file are output.
- **Pack**: Use `atlas-pack` to parse the sprite sheet JSON and generate an
  immutable sprite `Atlas` optimized for lookup and sharing.
- **Run**: Every distinct renderable object should then create its own
  `Animator` state. Finally, `Animator` is used to update and render the `Film`
  state sub-textures each frame.

Aseprite itself provides everything needed. However, the latter two steps
benefit from the tooling provided by atlas-pack:

- `aseprite-batch`: A thin wrapper around the Aseprite executable with the
  defaults expected by the `AtlasParser`.
- `atlas-pack`: Accepts a sprite sheet JSON file and outputs an immutable
  `Atlas` for efficient `Film` (animation) sub-texture lookup. Each sprite sheet
  has one `Atlas` object.
- `Animator`: The current playback state for a given `Film`. There are often
  multiple distinct `Animator`s associated with the same `Film`. A renderer
  should consult `Animator` states to determine the appropriate sub-texture
  regions to blit from the `Atlas` each loop.

See the [API demo source](demo/index.ts)!

### Pack the Sprite Sheet (CLI)

Given a list of Aseprite files, pack all images and animations into a single
sprite sheet:

```sh
deno \
  run \
    --allow-run \
    --import-map=https://deno.land/x/atlas_pack@v5.0.0/mods.json \
    https://deno.land/x/atlas_pack@v5.0.0/bin/aseprite-batch \
      --sheet atlas.png \
      --data atlas.json \
      *.aseprite |
deno \
  run \
    --allow-run \
    --import-map=https://deno.land/x/atlas_pack@v5.0.0/mods.json \
    https://deno.land/x/atlas_pack@v5.0.0/bin/atlas-pack > atlas.json
```

The output is a big image of sprites (`atlas.png`) and an
[`Atlas`](src/Atlas.ts) (`atlas.json`). These outputs should be regenerated any
time assets (Aseprite files) change, usually as part of a build step.

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

# Execute the tool (the same way as noted above).
```

If the tool executes without any errors, no need to worry about changing the
`PATH`.

</details>

### Parse and Render (JavaScript)

Once `atlas.json` and `atlas.png` are available, a program can parse
`atlas.json` to animate and render animations from `atlas.png`. A complete
example follows. Subsequent sections detail each step in the example.

#### Example

[See the API demo](https://atlas-pack.netlify.com) for a running example
rendered to a canvas.

## Features

atlas-pack adds little:

- A utility for playing Aseprite animations (forward, reverse, ping-pong, or
  ping-pong reverse). Mutable and immutable states are kept distinct.
- A sparser data structure that includes linking animation cels together in the
  same array and associating Aseprite slices with their cels. This can be useful
  for collision detection, for example.
- Cel ID to bounds look-up-table. This is useful
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

## Assumptions and Conventions

### Assumptions

The Aseprite CLI is flexible and can produce a many different formats. The
atlas-pack CLI and library expect an input generated by the options used in
[aseprite-batch](bin/aseprite-batch). Only the current version of Aseprite,
v1.3-beta21-x64, is tested.

### Conventions

Some wanted functionality is not modeled in the stock Aseprite format. This
section lists conventions used by atlas-pack. It's possible to forget to apply
these conventions, which can lead to bugs that atlas-pack cannot detect. To the
extent possible, consumers should add tests for conventions unique to their
code.

- A duration of 65 535 (hexadecimal ffff) is considered a special value by
  atlas-pack and parsed as 4 294 967 295 (hex ffff ffff). This value is only
  permitted in the last cel of a tagged animation but can appear in multiple
  tagged animations within the same Aseprite file.

## Development

Incomplete work is tracked under [to-do](docs/to-do.text).

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
