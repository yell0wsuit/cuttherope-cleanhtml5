import { updateBasics } from "./basics";
import { updateCamera } from "./camera";
import { updateBungees } from "./bungees";
import { updateCollectibles } from "./collectibles";
import { updateHazards } from "./hazards";
import { updateTargetState } from "./targetState";
import { updateSpecial } from "./special";
import { updateClickToCut } from "./clickToCut";

/**
 * @param {number} delta
 */
export function update(delta) {
    updateBasics.call(this, delta);
    updateCamera.call(this, delta);

    const numGrabs = updateBungees.call(this, delta);

    if (!updateCollectibles.call(this, delta)) {
        return;
    }

    if (!updateHazards.call(this, delta, numGrabs)) {
        return;
    }

    if (!updateTargetState.call(this, delta)) {
        return;
    }

    if (!updateSpecial.call(this, delta)) {
        return;
    }

    updateClickToCut.call(this, delta);
}
