/** @typedef {import("../systems/types").GameSystemContext} GameSystemContext */
/** @typedef {import("../systems/types").GameSystem} GameSystem */
/** @typedef {import("../systems/types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").GameObjectPlugin} GameObjectPlugin */

class GameObjectPluginManager {
    /**
     * @param {GameSystemContext} context
     */
    constructor(context) {
        this.context = context;
        /** @type {GameObjectPlugin[]} */
        this.plugins = [];
    }

    /**
     * @param {GameObjectPlugin} plugin
     * @returns {GameSystem[]}
     */
    register(plugin) {
        this.plugins.push(plugin);
        const systems = plugin.createSystems ? plugin.createSystems(this.context) : undefined;
        return Array.isArray(systems) ? systems : [];
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} sharedState
     */
    beforeUpdate(delta, sharedState) {
        for (const plugin of this.plugins) {
            plugin.onBeforeSystems?.(this.context, delta, sharedState);
        }
    }

    /**
     * @param {GameSystem} system
     * @param {boolean} continueProcessing
     * @param {number} delta
     * @param {GameSystemSharedState} sharedState
     */
    afterSystem(system, continueProcessing, delta, sharedState) {
        for (const plugin of this.plugins) {
            plugin.onAfterSystem?.(this.context, system, continueProcessing, delta, sharedState);
        }
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} sharedState
     */
    afterUpdate(delta, sharedState) {
        for (const plugin of this.plugins) {
            plugin.onAfterSystems?.(this.context, delta, sharedState);
        }
    }
}

export default GameObjectPluginManager;
