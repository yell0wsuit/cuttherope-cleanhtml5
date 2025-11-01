import Constants from "@/utils/Constants";

/**
 * @typedef {import("@/types/game-scene").GameScene} GameScene
 */

/**
 * @param {GameScene} scene
 * @param {boolean} left
 */
function releaseAllRopes(scene, left) {
    for (let l = 0, len = scene.bungees.length; l < len; l++) {
        const g = scene.bungees[l];
        const b = g.rope;

        if (
            b &&
            (b.tail === scene.star ||
                (b.tail === scene.starL && left) ||
                (b.tail === scene.starR && !left))
        ) {
            if (b.cut === Constants.UNDEFINED) {
                b.setCut(b.parts.length - 2);
                scene.detachCandy();
            } else {
                b.hideTailParts = true;
            }

            if (g.hasSpider && g.spiderActive) {
                scene.spiderBusted(g);
            }
        }
    }
}

/**
 * @param {GameScene} scene
 */
function attachCandy(scene) {
    scene.attachCount += 1;
}

/**
 * @param {GameScene} scene
 */
function detachCandy(scene) {
    scene.attachCount -= 1;
    scene.juggleTimer = 0;
}

class GameSceneRopeManagementDelegate {
    /**
     * @param {GameScene} scene
     */
    constructor(scene) {
        /** @type {GameScene} */
        this.scene = scene;
    }

    /**
     * @param {boolean} left
     */
    releaseAllRopes(left) {
        return releaseAllRopes(this.scene, left);
    }

    attachCandy() {
        return attachCandy(this.scene);
    }

    detachCandy() {
        return detachCandy(this.scene);
    }
}

export default GameSceneRopeManagementDelegate;
