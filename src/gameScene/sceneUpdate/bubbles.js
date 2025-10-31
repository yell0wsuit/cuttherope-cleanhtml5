import Rectangle from "@/core/Rectangle";
import * as GameSceneConstants from "@/gameScene/constants";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import resolution from "@/resolution";

/**
 * @typedef {import("@/types/game-scene").GameScene} GameScene
 * @typedef {import("@/game/Bubble").default} Bubble
 * @typedef {import("@/visual/AnimationPool").default} AnimationPool
 * @typedef {import("@/game/CTRGameObject").default} GameObject
 * @typedef {import("@/physics/ConstrainedPoint").default} ConstrainedPoint
 */

/**
 * @param {GameScene} scene
 * @param {Bubble} b
 * @param {GameObject} candy
 * @param {Bubble | null} candyBubble
 * @param {AnimationPool} candyBubbleAnimation
 */
function isBubbleCapture(scene, b, candy, candyBubble, candyBubbleAnimation) {
    const bubbleSize = resolution.BUBBLE_SIZE;
    const bubbleSizeDouble = bubbleSize * 2;

    if (
        Rectangle.pointInRect(
            candy.x,
            candy.y,
            b.x - bubbleSize,
            b.y - bubbleSize,
            bubbleSizeDouble,
            bubbleSizeDouble
        )
    ) {
        if (candyBubble) {
            scene.popBubble(b.x, b.y);
        }
        candyBubbleAnimation.visible = true;

        SoundMgr.playSound(ResourceId.SND_BUBBLE);

        b.popped = true;
        b.removeChildWithID(0);

        scene.attachCandy();

        return true;
    }
    return false;
}

/**
 * @param {GameScene} scene
 * @param {boolean} isLeft
 */
function popCandyBubble(scene, isLeft) {
    if (scene.twoParts !== GameSceneConstants.PartsType.NONE) {
        if (isLeft) {
            /**
             * @type {Bubble | null}
             */
            scene.candyBubbleL = null;
            scene.candyBubbleAnimationL.visible = false;
            scene.popBubble(scene.candyL.x, scene.candyL.y);
        } else {
            /**
             * @type {Bubble | null}
             */
            scene.candyBubbleR = null;
            scene.candyBubbleAnimationR.visible = false;
            scene.popBubble(scene.candyR.x, scene.candyR.y);
        }
    } else {
        /**
         * @type {Bubble | null}
         */
        scene.candyBubble = null;
        scene.candyBubbleAnimation.visible = false;
        scene.popBubble(scene.candy.x, scene.candy.y);
    }
}

/**
 * @param {GameScene} scene
 * @param {number} x
 * @param {number} y
 */
function popBubble(scene, x, y) {
    scene.detachCandy();

    SoundMgr.playSound(ResourceId.SND_BUBBLE_BREAK);

    scene.bubbleDisappear.x = x;
    scene.bubbleDisappear.y = y;

    scene.bubbleDisappear.playTimeline(0);
    scene.aniPool.addChild(scene.bubbleDisappear);
}

/**
 * @param {GameScene} scene
 * @param {ConstrainedPoint} s
 * @param {number} tx
 * @param {number} ty
 */
function handleBubbleTouch(scene, s, tx, ty) {
    if (
        Rectangle.pointInRect(
            tx + scene.camera.pos.x,
            ty + scene.camera.pos.y,
            s.pos.x - resolution.BUBBLE_TOUCH_OFFSET,
            s.pos.y - resolution.BUBBLE_TOUCH_OFFSET,
            resolution.BUBBLE_TOUCH_SIZE,
            resolution.BUBBLE_TOUCH_SIZE
        )
    ) {
        scene.popCandyBubble(s === scene.starL);

        // Achievements.increment(AchievementId.BUBBLE_POPPER);
        // Achievements.increment(AchievementId.BUBBLE_MASTER);

        return true;
    }
    return false;
}

class GameSceneBubblesDelegate {
    /**
     * @param {GameScene} scene
     */
    constructor(scene) {
        /** @type {GameScene} */
        this.scene = scene;
    }

    /**
     * @param {Bubble} b
     * @param {GameObject} candy
     * @param {Bubble | null} candyBubble
     * @param {AnimationPool} candyBubbleAnimation
     */
    isBubbleCapture(b, candy, candyBubble, candyBubbleAnimation) {
        return isBubbleCapture(this.scene, b, candy, candyBubble, candyBubbleAnimation);
    }

    /**
     * @param {boolean} isLeft
     */
    popCandyBubble(isLeft) {
        return popCandyBubble(this.scene, isLeft);
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    popBubble(x, y) {
        return popBubble(this.scene, x, y);
    }

    /**
     * @param {ConstrainedPoint} s
     * @param {number} tx
     * @param {number} ty
     */
    handleBubbleTouch(s, tx, ty) {
        return handleBubbleTouch(this.scene, s, tx, ty);
    }
}

export default GameSceneBubblesDelegate;
