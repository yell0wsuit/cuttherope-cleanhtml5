import GameSceneDrawDelegate from "./sceneUpdate/draw";
import GameSceneBubblesDelegate from "./sceneUpdate/bubbles";
import GameSceneTeleportDelegate from "./sceneUpdate/teleport";
import GameSceneLifecycleDelegate from "./sceneUpdate/lifecycle";
import GameSceneRopeManagementDelegate from "./sceneUpdate/ropeManagement";
import GameScenePumpUtilsDelegate from "./sceneUpdate/pumpUtils";
import GameSceneBounceUtilsDelegate from "./sceneUpdate/bounceUtils";
import GameSceneCutDelegate from "./sceneUpdate/cut";
import GameSceneSpiderHandlersDelegate from "./sceneUpdate/spiderHandlers";
import GameSceneSelectionDelegate from "./sceneUpdate/selection";
import GameObjectPluginManager from "./plugins/GameObjectPluginManager";
import { createCoreSystems } from "./systems";
import GameSceneCharacter from "./character";
import GameScenePhysicsService from "./services/GameScenePhysicsService";
import GameSceneCandyService from "./services/GameSceneCandyService";
import GameSceneAnimationService from "./services/GameSceneAnimationService";

/**
 * @template {Record<string, (...args: any[]) => any>} T
 * @param {GameSceneUpdate} scene
 * @param {T} delegate
 * @param {(keyof T & string)[]} methods
 */
const bindDelegate = (scene, delegate, methods) => {
    for (const method of methods) {
        scene[method] = /** @type {any} */ (delegate[method]).bind(delegate);
    }
};

/** @typedef {import("./plugins/types").GameObjectPlugin} GameObjectPlugin */
/** @typedef {import("./systems/types").GameSystem} GameSystem */
/** @typedef {import("./systems/types").GameSystemContext} GameSystemContext */
/** @typedef {import("./systems/types").GameSystemSharedState} GameSystemSharedState */

/**
 * @typedef {object} GameSceneUpdateOptions
 * @property {GameObjectPlugin[]} [plugins]
 * @property {GameSystem[]} [systems]
 */

class GameSceneUpdate extends GameSceneCharacter {
    /**
     * @param {GameSceneUpdateOptions} [options]
     */
    constructor(options = {}) {
        super();

        this.drawDelegate = new GameSceneDrawDelegate(this);
        bindDelegate(this, this.drawDelegate, ["draw"]);

        this.bubblesDelegate = new GameSceneBubblesDelegate(this);
        bindDelegate(this, this.bubblesDelegate, [
            "isBubbleCapture",
            "popCandyBubble",
            "popBubble",
            "handleBubbleTouch",
        ]);

        this.teleportDelegate = new GameSceneTeleportDelegate(this);
        bindDelegate(this, this.teleportDelegate, ["teleport"]);

        this.lifecycleDelegate = new GameSceneLifecycleDelegate(this);
        bindDelegate(this, this.lifecycleDelegate, [
            "animateLevelRestart",
            "isFadingIn",
            "calculateScore",
            "gameWon",
            "gameLost",
        ]);

        this.ropeManagementDelegate = new GameSceneRopeManagementDelegate(this);
        bindDelegate(this, this.ropeManagementDelegate, [
            "releaseAllRopes",
            "attachCandy",
            "detachCandy",
        ]);

        this.pumpUtilsDelegate = new GameScenePumpUtilsDelegate(this);
        bindDelegate(this, this.pumpUtilsDelegate, ["handlePumpFlow", "operatePump"]);

        this.bounceUtilsDelegate = new GameSceneBounceUtilsDelegate(this);
        bindDelegate(this, this.bounceUtilsDelegate, ["handleBounce"]);

        this.cutDelegate = new GameSceneCutDelegate(this);
        bindDelegate(this, this.cutDelegate, ["cut"]);

        this.spiderHandlersDelegate = new GameSceneSpiderHandlersDelegate(this);
        bindDelegate(this, this.spiderHandlersDelegate, ["spiderBusted", "spiderWon"]);

        this.selectionDelegate = new GameSceneSelectionDelegate(this);
        bindDelegate(this, this.selectionDelegate, [
            "resetBungeeHighlight",
            "getNearestBungeeGrabByBezierPoints",
            "getNearestBungeeSegmentByConstraints",
        ]);

        const { plugins = [], systems } = options;

        this.physicsService = new GameScenePhysicsService(this);
        this.candyService = new GameSceneCandyService(this);
        this.animationService = new GameSceneAnimationService(this);

        /** @type {GameSystemContext} */
        const systemContext = {
            physics: this.physicsService,
            candy: this.candyService,
            animation: this.animationService,
            // Placeholder, assigned after plugin manager instantiation
            pluginManager: /** @type {any} */ (null),
        };

        /**
         * Coordinates lifecycle hooks for scene plugins.
         * @type {GameObjectPluginManager}
         */
        this.pluginManager = new GameObjectPluginManager(systemContext);
        systemContext.pluginManager = this.pluginManager;

        /**
         * Shared context for core and plugin systems.
         * @type {GameSystemContext}
         */
        this.systemContext = systemContext;

        /**
         * Ordered list of systems executed every frame.
         * @type {GameSystem[]}
         */
        this.systems = systems ? [...systems] : createCoreSystems(this.systemContext);

        for (const plugin of plugins) {
            this.registerPlugin(plugin);
        }
    }

    /**
     * Registers a plugin and appends any systems it exposes.
     *
     * @param {GameObjectPlugin} plugin
     */
    registerPlugin(plugin) {
        const newSystems = this.pluginManager.register(plugin);
        if (newSystems.length > 0) {
            this.systems.push(...newSystems);
        }
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        /** @type {GameSystemSharedState} */
        const sharedState = {};

        this.pluginManager.beforeUpdate(delta, sharedState);

        for (const system of this.systems) {
            const result = system.update(delta, sharedState);
            this.pluginManager.afterSystem(system, result.continue, delta, sharedState);

            if (!result.continue) {
                // System halted execution due to game state change (won/lost)
                if (import.meta.env.DEV) {
                    console.log(`[GameScene] System "${system.id}" halted: ${result.reason}`);
                }
                break;
            }
        }

        this.pluginManager.afterUpdate(delta, sharedState);
    }
}

export default GameSceneUpdate;
