/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").BungeeSystemDependencies} BungeeSystemDependencies */
/** @typedef {import("../services/types").CandyService} CandyService */

const defaultDependencies = Object.freeze({
    /**
     * @param {CandyService} service
     * @param {number} delta
     */
    updateBungees(service, delta) {
        return service.updateBungees(delta);
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
        const numGrabs = this.dependencies.updateBungees(this.context.candy, delta);
        sharedState.numGrabs = numGrabs;
        return { continue: true };
    }
}

export default BungeeSystem;
