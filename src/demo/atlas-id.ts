/**
 * The Atlas.Animation identifier for all Animations in the Atlas. IDs are used
 * to reference immutable image source properties, such as dimensions and
 * animation duration, from the Atlas. The tag convention used here is
 * <file stem>-<state>.
 */
export type AtlasID = Parameters<typeof AtlasID.values['has']>[0]

export namespace AtlasID {
  export const values = Object.freeze(
    new Set(<const>[
      'frog-eat',
      'frog-idle',
      'backpacker-walkRight',
      'backpacker-walkDown',
      'backpacker-walkUp'
    ])
  )
}
