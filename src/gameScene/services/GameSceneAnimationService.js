import { updateCamera as runUpdateCamera } from "../sceneUpdate/camera";
import { updateClickToCut as runUpdateClickToCut } from "../sceneUpdate/clickToCut";

/** @typedef {import("../update").default} GameSceneUpdate */

class GameSceneAnimationService {
    /**
     * @param {GameSceneUpdate} scene
     */
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * @param {number} delta
     */
    updateCamera(delta) {
        runUpdateCamera.call(this.scene, delta);
    }

    /**
     * @param {number} delta
     */
    updateClickToCut(delta) {
        runUpdateClickToCut.call(this.scene, delta);
    }
}

export default GameSceneAnimationService;
