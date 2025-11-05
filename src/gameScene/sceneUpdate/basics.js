import * as GameSceneConstants from "@/gameScene/constants";
import Constants from "@/utils/Constants";
import Mover from "@/utils/Mover";
import BaseElement from "@/visual/BaseElement";

/** @typedef {import("@/types/game-scene").GameScene} GameScene */

/**
 * @param {GameScene} this
 * @param {number} delta
 */
export function updateBasics(delta) {
    let moveResult;
    for (let i = 0, len = this.drawings.length; i < len; i++) {
        this.drawings[i].update(delta);
    }

    // Call parent class's update method
    BaseElement.prototype.update.call(this, delta);
    this.dd.update(delta);

    if (this.pollenDrawer) {
        this.pollenDrawer.update(delta);
    }

    for (let i = 0; i < Constants.MAX_TOUCHES; i++) {
        const cuts = this.fingerCuts[i];
        let numCuts = cuts.length;
        let k = 0;

        while (k < numCuts) {
            const fc = cuts[k];
            moveResult = Mover.moveToTargetWithStatus(fc.color.a, 0, 10, delta);
            fc.color.a = moveResult.value;
            if (moveResult.reachedZero) {
                cuts.splice(k, 1);
                numCuts--;
            } else {
                k++;
            }
        }
    }

    for (let i = 0, len = this.earthAnims.length; i < len; i++) {
        this.earthAnims[i].update(delta);
    }

    this.ropesAtOnceTimer = Mover.moveToTarget(this.ropesAtOnceTimer, 0, 1, delta);

    if (this.attachCount === 0) {
        this.juggleTimer += delta;

        // has it been 30 secs since the candy was attached?
        if (this.juggleTimer > GameSceneConstants.CANDY_JUGGLER_TIME) {
            //Achievements.increment(AchievementId.CANDY_JUGGLER);
            // reset the timer
            this.juggleTimer = 0;
        }
    }
}
