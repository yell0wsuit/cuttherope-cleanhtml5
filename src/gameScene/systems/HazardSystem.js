import { updateHazards as runUpdateHazards } from "../sceneUpdate/hazards";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystemSharedState} GameSystemSharedState */
/** @typedef {import("./types").HazardSystemDependencies} HazardSystemDependencies */

const defaultDependencies = Object.freeze({
    /**
     * @param {import("../update").default} scene
     * @param {number} delta
     * @param {number} numGrabs
     */
    updateHazards(scene, delta, numGrabs) {
        return runUpdateHazards.call(scene, delta, numGrabs);
    },
});

class HazardSystem {
    /**
     * @param {GameSystemContext} context
     * @param {HazardSystemDependencies} [dependencies]
     */
    constructor(
        context,
        dependencies = /** @type {HazardSystemDependencies} */ (defaultDependencies)
    ) {
        this.id = "hazards";
        this.context = context;
        this.dependencies = dependencies;
    }

    /**
     * @param {number} delta
     * @param {GameSystemSharedState} sharedState
     * @returns {import("./types").SystemResult}
     */
    update(delta, sharedState) {
        const numGrabs = sharedState.numGrabs ?? 0;
        const shouldContinue = this.dependencies.updateHazards(this.context.scene, delta, numGrabs);

        // updateHazards returns false when candy hits spike (game lost)
        return shouldContinue ? { continue: true } : { continue: false, reason: "game_lost" };
    }
}

export default HazardSystem;
