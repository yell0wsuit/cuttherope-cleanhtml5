import { updateCollectibles as runUpdateCollectibles } from "../sceneUpdate/collectibles";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").CollectibleSystemDependencies} CollectibleSystemDependencies */

const defaultDependencies = Object.freeze({
    /**
     * @param {import("../update").default} scene
     * @param {number} delta
     */
    updateCollectibles(scene, delta) {
        return runUpdateCollectibles.call(scene, delta);
    },
});

class CollectibleSystem {
    /**
     * @param {GameSystemContext} context
     * @param {CollectibleSystemDependencies} [dependencies]
     */
    constructor(
        context,
        dependencies = /** @type {CollectibleSystemDependencies} */ (defaultDependencies)
    ) {
        this.id = "collectibles";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} _sharedState
     */
    update(delta, _sharedState) {
        return this.dependencies.updateCollectibles(this.context.scene, delta);
    }
}

export default CollectibleSystem;
