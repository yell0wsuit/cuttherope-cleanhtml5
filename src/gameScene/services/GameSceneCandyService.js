import { updateBungees as runUpdateBungees } from "../sceneUpdate/bungees";
import { updateCollectibles as runUpdateCollectibles } from "../sceneUpdate/collectibles";
import { updateHazards as runUpdateHazards } from "../sceneUpdate/hazards";
import { updateTargetState as runUpdateTargetState } from "../sceneUpdate/targetState";
import { updateSpecial as runUpdateSpecial } from "../sceneUpdate/special";
import * as GameSceneConstants from "../constants";

/** @typedef {import("../update").default} GameSceneUpdate */

class GameSceneCandyService {
    /**
     * @param {GameSceneUpdate} scene
     */
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * @param {number} delta
     * @returns {number}
     */
    updateBungees(delta) {
        return runUpdateBungees.call(this.scene, delta);
    }

    /**
     * @param {number} delta
     */
    updateCollectibles(delta) {
        runUpdateCollectibles.call(this.scene, delta);
    }

    /**
     * @param {number} delta
     * @param {number} numGrabs
     * @returns {boolean}
     */
    updateHazards(delta, numGrabs) {
        return runUpdateHazards.call(this.scene, delta, numGrabs);
    }

    /**
     * @param {number} delta
     * @returns {import("./types").TargetUpdateResult}
     */
    updateTargetState(delta) {
        const shouldContinue = runUpdateTargetState.call(this.scene, delta);
        if (shouldContinue) {
            return { continue: true };
        }

        const won =
            this.scene.target.currentTimelineIndex === GameSceneConstants.CharAnimation.WIN;
        return { continue: false, reason: won ? "game_won" : "game_lost" };
    }

    /**
     * @param {number} delta
     */
    updateSpecial(delta) {
        runUpdateSpecial.call(this.scene, delta);
    }
}

export default GameSceneCandyService;
