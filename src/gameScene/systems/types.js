/**
 * @typedef {import("../update").default} GameSceneUpdate
 */

/**
 * @typedef {object} GameSystemContext
 * @property {GameSceneUpdate} scene
 * @property {import("../plugins/GameObjectPluginManager").default} pluginManager
 */

/**
 * Shared mutable state object passed between systems during a frame update.
 *
 * @typedef {object} GameSystemSharedState
 * @property {number} [numGrabs] - Number of active bungee grabs, set by BungeeSystem, read by HazardSystem
 */

/**
 * Result indicating the system update loop should continue processing.
 * @typedef {object} SystemResultContinue
 * @property {true} continue
 */

/**
 * Result indicating the system update loop should halt.
 * @typedef {object} SystemResultStop
 * @property {false} continue
 * @property {'game_won' | 'game_lost'} reason - Why processing was halted
 */

/**
 * Discriminated union of possible system update results.
 * Use `result.continue` to check if processing should continue.
 * @typedef {SystemResultContinue | SystemResultStop} SystemResult
 */

/**
 * @typedef {object} GameSystem
 * @property {string} id
 * @property {(delta: number, sharedState: GameSystemSharedState) => SystemResult} update
 */

/**
 * @typedef {(scene: GameSceneUpdate, delta: number) => void} SceneVoidUpdate
 */

/**
 * @typedef {(scene: GameSceneUpdate, delta: number) => number} SceneNumberUpdate
 */

/**
 * @typedef {(scene: GameSceneUpdate, delta: number) => boolean} SceneBooleanUpdate
 */

/**
 * @typedef {(scene: GameSceneUpdate, delta: number, numGrabs: number) => boolean} SceneHazardUpdate
 */

/**
 * @typedef {object} PhysicsSystemDependencies
 * @property {SceneVoidUpdate} updateBasics
 */

/**
 * @typedef {object} CameraSystemDependencies
 * @property {SceneVoidUpdate} updateCamera
 */

/**
 * @typedef {object} BungeeSystemDependencies
 * @property {SceneNumberUpdate} updateBungees
 */

/**
 * @typedef {object} CollectibleSystemDependencies
 * @property {SceneBooleanUpdate} updateCollectibles
 */

/**
 * @typedef {object} HazardSystemDependencies
 * @property {SceneHazardUpdate} updateHazards
 */

/**
 * @typedef {object} TargetSystemDependencies
 * @property {SceneBooleanUpdate} updateTargetState
 */

/**
 * @typedef {object} SpecialSystemDependencies
 * @property {SceneBooleanUpdate} updateSpecial
 */

/**
 * @typedef {object} InteractionSystemDependencies
 * @property {SceneVoidUpdate} updateClickToCut
 */
