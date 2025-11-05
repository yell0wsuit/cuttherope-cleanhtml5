import { updateClickToCut as runUpdateClickToCut } from "../sceneUpdate/clickToCut";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").InteractionSystemDependencies} InteractionSystemDependencies */

const defaultDependencies = Object.freeze({
    /**
     * @param {import("../update").default} scene
     * @param {number} delta
     */
    updateClickToCut(scene, delta) {
        runUpdateClickToCut.call(scene, delta);
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
        this.dependencies.updateClickToCut(this.context.scene, delta);
        return { continue: true };
    }
}

export default InteractionSystem;
