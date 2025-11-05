/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").InteractionSystemDependencies} InteractionSystemDependencies */
/** @typedef {import("../services/types").AnimationService} AnimationService */

const defaultDependencies = Object.freeze({
    /**
     * @param {AnimationService} service
     * @param {number} delta
     */
    updateClickToCut(service, delta) {
        service.updateClickToCut(delta);
    },
});

class InteractionSystem {
    /**
     * @param {GameSystemContext} context
     * @param {InteractionSystemDependencies} [dependencies]
     */
    constructor(
        context,
        dependencies = /** @type {InteractionSystemDependencies} */ (defaultDependencies)
    ) {
        this.id = "interaction";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} _sharedState
     * @returns {import("./types").SystemResult}
     */
    update(delta, _sharedState) {
        this.dependencies.updateClickToCut(this.context.animation, delta);
        return { continue: true };
    }
}

export default InteractionSystem;
