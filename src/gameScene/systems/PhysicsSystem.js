/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").PhysicsSystemDependencies} PhysicsSystemDependencies */
/** @typedef {import("../services/types").PhysicsService} PhysicsService */

const defaultDependencies = Object.freeze({
    /**
     * @param {PhysicsService} service
     * @param {number} delta
     */
    updateBasics(service, delta) {
        service.updateBasics(delta);
    },
});

class PhysicsSystem {
    /**
     * @param {GameSystemContext} context
     * @param {PhysicsSystemDependencies} [dependencies]
     */
    constructor(context, dependencies = /** @type {PhysicsSystemDependencies} */ (defaultDependencies)) {
        this.id = "physics";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} _sharedState
     * @returns {import("./types").SystemResult}
     */
    update(delta, _sharedState) {
        this.dependencies.updateBasics(this.context.physics, delta);
        return { continue: true };
    }
}

export default PhysicsSystem;
