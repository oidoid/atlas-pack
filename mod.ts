// import { I32, JSONObject, UnumberMillis } from '../oidlib/mod.ts';
// import { Cel, CelID } from './src/Anim.ts';
// import { Animator } from './src/Animator.ts';
// import { Aseprite } from './src/Aseprite.ts';
// import { AtlasMeta } from './src/AtlasMeta.ts';
// import { AtlasMetaParser } from './src/AtlasMetaParser.ts';

export * from './src/Anim.ts';
export * from './src/Animator.ts';
export * from './src/Aseprite.ts';
export * from './src/AtlasMeta.ts';
export * from './src/AtlasMetaParser.ts';

// export namespace AtlasPack {
//   /**
//    * @arg ids If defined, the returned Atlas is validated to have the same
//    *  membership as the AnimationID set. If undefined, the caller may wish to use a
//    *  string type for AnimationID and perform their own Atlas.animations look-up
//    *  checks.
//    */
//   export function parse<AnimationID extends Aseprite.Tag>(
//     file: Aseprite.File | JSONObject,
//     ids?: ReadonlySet<AnimationID> | undefined,
//   ): AtlasMeta<AnimationID> {
//     return AtlasMetaParser.parse(file, ids);
//   }

//   /**
//    * Apply the time since last frame was shown, possibly advancing the
//    * `Anim` period. The worst case scenario is when `exposure` is
//    * `animation.duration - 1` which would iterate over every `Cel` in the
//    * `Anim`. Since `Anim`s are usually animated every frame, this
//    * is expected to be a rarity.
//    *
//    * @arg exposure The time delta since the last call to animate(). For example,
//    *  in a 60 frames per second animation, this is often ~16.667 milliseconds.
//    */
//   export function animate(
//     animator: Animator,
//     exposure: UnumberMillis | number,
//   ): void {
//     return Animator.animate(animator, UnumberMillis(exposure));
//   }

//   /**
//    * Clear the exposure time and set the animation to the starting cel. This is
//    * useful when changing animations.
//    */
//   export function resetAnimation(animator: Animator): void {
//     return Animator.reset(animator);
//   }

//   /** Change the animation cel and reset the exposure. */
//   export function setAnimation(animator: Animator, period: I32 | number): void {
//     return Animator.set(animator, I32(period));
//   }

//   /** @return The `Anim` `Cel` for period. */
//   export function animationCel(animator: Readonly<Animator>): Cel {
//     return Animator.cel(animator);
//   }

//   /** @return The `Anim` `CelID` for period. */
//   export function animatorCelID(animator: Readonly<Animator>): CelID {
//     return Animator.celID(animator);
//   }

//   /** @return The `Anim` `Cel` index for period. */
//   export function animatorIndex(animator: Readonly<Animator>): number {
//     return Animator.index(animator);
//   }
// }
