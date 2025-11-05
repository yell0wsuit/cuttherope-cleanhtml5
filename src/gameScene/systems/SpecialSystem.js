/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").SpecialSystemDependencies} SpecialSystemDependencies */
/** @typedef {import("../services/types").CandyService} CandyService */

const defaultDependencies = Object.freeze({
    /**
     * @param {CandyService} service
     * @param {number} delta
     */
    updateSpecial(service, delta) {
        service.updateSpecial(delta);
    },
});

class SpecialSystem {
    /**
     * @param {GameSystemContext} context
     * @param {SpecialSystemDependencies} [dependencies]
     */
    constructor(context, dependencies = /** @type {SpecialSystemDependencies} */ (defaultDependencies)) {
        this.id = "special";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} _sharedState
     * @returns {import("./types").SystemResult}
     */
    update(delta, _sharedState) {
        // SpecialSystem always continues (always returns true)
        this.dependencies.updateSpecial(this.context.candy, delta);
        return { continue: true };
    }
}

export default SpecialSystem;
