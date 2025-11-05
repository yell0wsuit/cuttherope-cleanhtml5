/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").CameraSystemDependencies} CameraSystemDependencies */
/** @typedef {import("../services/types").AnimationService} AnimationService */

const defaultDependencies = Object.freeze({
    /**
     * @param {AnimationService} service
     * @param {number} delta
     */
    updateCamera(service, delta) {
        service.updateCamera(delta);
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
     * @returns {import("./types").SystemResult}
     */
    update(delta, _sharedState) {
        this.dependencies.updateCamera(this.context.animation, delta);
        return { continue: true };
    }
}

export default CameraSystem;
