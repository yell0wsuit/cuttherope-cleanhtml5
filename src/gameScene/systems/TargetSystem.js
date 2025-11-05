/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").TargetSystemDependencies} TargetSystemDependencies */
/** @typedef {import("../services/types").TargetUpdateResult} TargetUpdateResult */
/** @typedef {import("../services/types").CandyService} CandyService */

const defaultDependencies = Object.freeze({
    /**
     * @param {CandyService} service
     * @param {number} delta
     * @returns {TargetUpdateResult}
     */
    updateTargetState(service, delta) {
        return service.updateTargetState(delta);
    },
});

class TargetSystem {
    /**
     * @param {GameSystemContext} context
     * @param {TargetSystemDependencies} [dependencies]
     */
    constructor(
        context,
        dependencies = /** @type {TargetSystemDependencies} */ (defaultDependencies)
    ) {
        this.id = "target";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} _sharedState
     * @returns {import("./types").SystemResult}
     */
    update(delta, _sharedState) {
        const result = this.dependencies.updateTargetState(this.context.candy, delta);

        if (!result.continue) {
            return { continue: false, reason: result.reason };
        }

        return { continue: true };
    }
}

export default TargetSystem;
