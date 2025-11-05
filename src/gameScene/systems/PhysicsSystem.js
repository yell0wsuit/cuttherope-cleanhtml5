import { updateBasics as runUpdateBasics } from "../sceneUpdate/basics";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").PhysicsSystemDependencies} PhysicsSystemDependencies */

const defaultDependencies = Object.freeze({
    /**
     * @param {import("../update").default} scene
     * @param {number} delta
     */
    updateBasics(scene, delta) {
        runUpdateBasics.call(scene, delta);
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
        this.dependencies.updateBasics(this.context.scene, delta);
        return { continue: true };
    }
}

export default PhysicsSystem;
