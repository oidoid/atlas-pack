/**
 * The Atlas.Animation identifier for all Animations in the Atlas. IDs are used
 * to reference immutable image source properties, such as dimensions and
 * animation duration, from the Atlas. The tag convention used here is
 * <file stem>-<state>.
 */
export type AtlasID = typeof AtlasID[keyof typeof AtlasID]
export const AtlasID = <const>{
  FrogEat: 'frog-eat',
  FrogIdle: 'frog-idle',
  BackpackerWalkRight: 'backpacker-walkRight',
  BackpackerWalkDown: 'backpacker-walkDown',
  BackpackerWalkUp: 'backpacker-walkUp'
}
