# To-do

- Add API documentation for at least the primary exports: `Aseprite`, `Parser`,
  `Animator`, `Atlas`, and `Animation`. The `Animator` documentation should
  probably include a usage example in a game loop-like scenario.
- Can a JSON format be supported? This would allow the parse step to happen at
  compilation instead of run time.
  - How should infinite be represented?
- Add a more thorough demo. For example, a very small game showcasing a few
  things: different collisioning (including Aseprite GUI screenshots of slices),
  tiling, different animations, parsing and image loading, a mini sprite
  / entity system.
- Improve the demo build system. It doesn't automatically rebuild its
  dependencies. Maybe switch demo to Webpack and use webpack-dev-server. Related
  work in the npm-workspaces branch.
