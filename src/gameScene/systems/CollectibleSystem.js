/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").CollectibleSystemDependencies} CollectibleSystemDependencies */
/** @typedef {import("../services/types").CandyService} CandyService */

const defaultDependencies = Object.freeze({
    /**
     * @param {CandyService} service
     * @param {number} delta
     */
    updateCollectibles(service, delta) {
        service.updateCollectibles(delta);
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
     * @returns {import("./types").SystemResult}
     */
    update(delta, _sharedState) {
        // CollectibleSystem always continues (returns true)
        this.dependencies.updateCollectibles(this.context.candy, delta);
        return { continue: true };
    }
}

export default CollectibleSystem;
