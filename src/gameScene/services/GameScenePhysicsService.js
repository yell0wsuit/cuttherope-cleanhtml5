import { updateBasics as runUpdateBasics } from "../sceneUpdate/basics";

/** @typedef {import("../update").default} GameSceneUpdate */

class GameScenePhysicsService {
    /**
     * @param {GameSceneUpdate} scene
     */
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * @param {number} delta
     */
    updateBasics(delta) {
        runUpdateBasics.call(this.scene, delta);
    }
}

export default GameScenePhysicsService;
