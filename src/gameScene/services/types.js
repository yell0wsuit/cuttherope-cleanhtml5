/**
 * Provides physics operations used by the game loop.
 * @typedef {object} PhysicsService
 * @property {(delta: number) => void} updateBasics
 */

/**
 * Describes the outcome of updating the candy target state.
 * @typedef {object} TargetUpdateResult
 * @property {boolean} continue
 * @property {"game_won" | "game_lost"} [reason]
 */

/**
 * Provides candy-related state management utilities.
 * @typedef {object} CandyService
 * @property {(delta: number) => number} updateBungees
 * @property {(delta: number) => void} updateCollectibles
 * @property {(delta: number, numGrabs: number) => boolean} updateHazards
 * @property {(delta: number) => TargetUpdateResult} updateTargetState
 * @property {(delta: number) => void} updateSpecial
 */

/**
 * Provides animation helpers used by the game systems.
 * @typedef {object} AnimationService
 * @property {(delta: number) => void} updateCamera
 * @property {(delta: number) => void} updateClickToCut
 */
