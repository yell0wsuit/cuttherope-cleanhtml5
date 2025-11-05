/** @typedef {import("../systems/types").GameSystemContext} GameSystemContext */
/** @typedef {import("../systems/types").GameSystem} GameSystem */
/** @typedef {import("../systems/types").GameSystemSharedState} GameSystemSharedState */

/**
 * Describes an extension point for introducing new game object behaviour.
 *
 * @typedef {object} GameObjectPlugin
 * @property {(context: GameSystemContext) => GameSystem[] | void=} createSystems
 * @property {(context: GameSystemContext, delta: number, sharedState: GameSystemSharedState) => void=} onBeforeSystems
 * @property {(
 *     context: GameSystemContext,
 *     system: GameSystem,
 *     continueProcessing: boolean,
 *     delta: number,
 *     sharedState: GameSystemSharedState
 * ) => void=} onAfterSystem
 * @property {(context: GameSystemContext, delta: number, sharedState: GameSystemSharedState) => void=} onAfterSystems
 */
