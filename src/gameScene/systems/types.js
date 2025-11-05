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
 * Individual systems can attach and read arbitrary values.
 *
 * @typedef {Record<string, any>} GameSystemSharedState
 */

/**
 * @typedef {object} GameSystem
 * @property {string} id
 * @property {(delta: number, sharedState: GameSystemSharedState) => boolean} update
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
