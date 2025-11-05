import { updateSpecial as runUpdateSpecial } from "../sceneUpdate/special";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").SpecialSystemDependencies} SpecialSystemDependencies */

const defaultDependencies = Object.freeze({
    /**
     * @param {import("../update").default} scene
     * @param {number} delta
     */
    updateSpecial(scene, delta) {
        return runUpdateSpecial.call(scene, delta);
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
        this.dependencies.updateSpecial(this.context.scene, delta);
        return { continue: true };
    }
}

export default SpecialSystem;
