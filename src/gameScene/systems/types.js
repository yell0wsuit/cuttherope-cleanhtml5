/** @typedef {import("../services/types").PhysicsService} PhysicsService */
/** @typedef {import("../services/types").CandyService} CandyService */
/** @typedef {import("../services/types").AnimationService} AnimationService */
/** @typedef {import("../services/types").TargetUpdateResult} TargetUpdateResult */

/**
 * @typedef {object} GameSystemContext
 * @property {PhysicsService} physics
 * @property {CandyService} candy
 * @property {AnimationService} animation
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
 * @typedef {object} PhysicsSystemDependencies
 * @property {(service: PhysicsService, delta: number) => void} updateBasics
 */

/**
 * @typedef {object} CameraSystemDependencies
 * @property {(service: AnimationService, delta: number) => void} updateCamera
 */

/**
 * @typedef {object} BungeeSystemDependencies
 * @property {(service: CandyService, delta: number) => number} updateBungees
 */

/**
 * @typedef {object} CollectibleSystemDependencies
 * @property {(service: CandyService, delta: number) => void} updateCollectibles
 */

/**
 * @typedef {object} HazardSystemDependencies
 * @property {(service: CandyService, delta: number, numGrabs: number) => boolean} updateHazards
 */

/**
 * @typedef {object} TargetSystemDependencies
 * @property {(service: CandyService, delta: number) => TargetUpdateResult} updateTargetState
 */

/**
 * @typedef {object} SpecialSystemDependencies
 * @property {(service: CandyService, delta: number) => void} updateSpecial
 */

/**
 * @typedef {object} InteractionSystemDependencies
 * @property {(service: AnimationService, delta: number) => void} updateClickToCut
 */
