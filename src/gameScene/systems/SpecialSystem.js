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
     */
    update(delta, _sharedState) {
        return this.dependencies.updateSpecial(this.context.scene, delta);
    }
}

export default SpecialSystem;
