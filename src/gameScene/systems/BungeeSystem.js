import { updateBungees as runUpdateBungees } from "../sceneUpdate/bungees";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").BungeeSystemDependencies} BungeeSystemDependencies */

const defaultDependencies = Object.freeze({
    /**
     * @param {import("../update").default} scene
     * @param {number} delta
     */
    updateBungees(scene, delta) {
        return runUpdateBungees.call(scene, delta);
    },
});

class BungeeSystem {
    /**
     * @param {GameSystemContext} context
     * @param {BungeeSystemDependencies} [dependencies]
     */
    constructor(
        context,
        dependencies = /** @type {BungeeSystemDependencies} */ (defaultDependencies)
    ) {
        this.id = "bungees";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} sharedState
     * @returns {import("./types").SystemResult}
     */
    update(delta, sharedState) {
        const numGrabs = this.dependencies.updateBungees(this.context.scene, delta);
        sharedState.numGrabs = numGrabs;
        return { continue: true };
    }
}

export default BungeeSystem;
