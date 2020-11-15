- Consider bundling the demo and using NPM workspaces or a Webpack-based
  solution for dependency management.
- How can the typings be more general to allow any CLI options?
- Given sufficiently generic typings, migrate upstream to either DefinitelyTyped
  or Aseprite itself.
- Can any of these changes to the format be migrated upstream to Aseprite?
- Elaborate on tradeoffs of class vs data-centric approach.
  - For example, classes need to be inflated and data can just be used.
  - Classes can provide encapsulation, manage their own data, and the API is a
    little nicer, I think.
  - Classes can use g/setters for data API compatibility.
- Can a JSON format be supported? This would allow the parse step to happen at
  compilation instead of run time.
  - How should infinite be represented?
- Add a more thorough demo. For example, a very small game showcasing a few
  things: different collisioning (including Aseprite GUI screenshots of slices),
  tiling, different animations, parsing and image loading, a mini sprite
  / entity system.
- What to do about Rust typings? Is it possible to go from Rust to Wasm to TSD?
