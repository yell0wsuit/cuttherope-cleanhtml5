import { updateTargetState as runUpdateTargetState } from "../sceneUpdate/targetState";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").TargetSystemDependencies} TargetSystemDependencies */

const defaultDependencies = Object.freeze({
    /**
     * @param {import("../update").default} scene
     * @param {number} delta
     */
    updateTargetState(scene, delta) {
        return runUpdateTargetState.call(scene, delta);
    },
});

class TargetSystem {
    /**
     * @param {GameSystemContext} context
     * @param {TargetSystemDependencies} [dependencies]
     */
    constructor(context, dependencies = /** @type {TargetSystemDependencies} */ (defaultDependencies)) {
        this.id = "target";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} _sharedState
     */
    update(delta, _sharedState) {
        return this.dependencies.updateTargetState(this.context.scene, delta);
    }
}

export default TargetSystem;
