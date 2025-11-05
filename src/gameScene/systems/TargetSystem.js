import { updateTargetState as runUpdateTargetState } from "../sceneUpdate/targetState";
import * as GameSceneConstants from "../constants";

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
    constructor(
        context,
        dependencies = /** @type {TargetSystemDependencies} */ (defaultDependencies)
    ) {
        this.id = "target";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} _sharedState
     * @returns {import("./types").SystemResult}
     */
    update(delta, _sharedState) {
        const shouldContinue = this.dependencies.updateTargetState(this.context.scene, delta);

        if (!shouldContinue) {
            // updateTargetState returns false when:
            // 1. Candy reaches target (line 46: gameWon called, returns false)
            // 2. Candy goes off screen (lines 88-89: gameLost called, returns false)
            // gameWon() sets target animation to WIN, gameLost() doesn't
            const scene = this.context.scene;
            const won = scene.target.currentTimelineIndex === GameSceneConstants.CharAnimation.WIN;
            return { continue: false, reason: won ? "game_won" : "game_lost" };
        }

        return { continue: true };
    }
}

export default TargetSystem;
