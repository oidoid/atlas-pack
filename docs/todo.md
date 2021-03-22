# To-do

- Add API documentation for at least the primary exports: `Aseprite`, `Parser`,
  `Animator`, `Atlas`, and `Animation`. The `Animator` documentation should
  probably include a usage example in a game loop-like scenario.
- Can a JSON format be supported? This would allow the parse step to happen at
  compilation instead of run time.
  - How should infinite be represented? Some kind of null or string hack that
    must use a special deserializer? Switch to JSON alternative?
- Add a more thorough demo. For example, a very small game showcasing a few
  things: different collisioning (including Aseprite GUI screenshots of slices),
  tiling, different animations, parsing and image loading, a mini sprite /
  entity system.
- Look at other examples of invariant libraries.
- Promote NPM skeleton to oidoid repo template.
- Consider parameterizing XY<T> and the other types. For example:

```ts
export interface XY<T> {
  x: T
  y: T
}

export type XYInt = XY<Int>

export function XYInt(x: number, y: number): XYInt {
  return {x: Int(x), y: Int(y)}
}
```

- Should I use `!= null` shorthand?
- Consolidate XY and WH types with old NE implementations and extract to new
  library.
- WH and XY are essentially the same thing. Maybe some differing methods. Can I
  use those new type string literal properties to map new property names from a
  single implementation?
- Be more consistent on naming: value / values to val / vals, XYI16, R16, etc.
