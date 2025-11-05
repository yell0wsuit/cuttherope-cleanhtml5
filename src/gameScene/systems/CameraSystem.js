import { updateCamera as runUpdateCamera } from "../sceneUpdate/camera";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").CameraSystemDependencies} CameraSystemDependencies */

const defaultDependencies = Object.freeze({
    /**
     * @param {import("../update").default} scene
     * @param {number} delta
     */
    updateCamera(scene, delta) {
        runUpdateCamera.call(scene, delta);
    },
});

class CameraSystem {
    /**
     * @param {GameSystemContext} context
     * @param {CameraSystemDependencies} [dependencies]
     */
    constructor(context, dependencies = /** @type {CameraSystemDependencies} */ (defaultDependencies)) {
        this.id = "camera";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} _sharedState
     */
    update(delta, _sharedState) {
        this.dependencies.updateCamera(this.context.scene, delta);
        return true;
    }
}

export default CameraSystem;
