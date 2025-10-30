import Rectangle from "@/core/Rectangle";
import * as GameSceneConstants from "@/gameScene/constants";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import resolution from "@/resolution";

class GameSceneBubbles {
    /**
     * @param {Bubble} b
     * @param {GameObject} candy
     * @param {Bubble | null} candyBubble
     * @param {AnimationPool} candyBubbleAnimation
     */
    isBubbleCapture(b, candy, candyBubble, candyBubbleAnimation) {
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
                this.popBubble(b.x, b.y);
            }
            candyBubbleAnimation.visible = true;

            console.log(candyBubbleAnimation);

            SoundMgr.playSound(ResourceId.SND_BUBBLE);

            b.popped = true;
            b.removeChildWithID(0);

            this.attachCandy();

            return true;
        }
        return false;
    }

    /**
     * @param {boolean} isLeft
     */
    popCandyBubble(isLeft) {
        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            if (isLeft) {
                /**
                 * @type {Bubble | null}
                 */
                this.candyBubbleL = null;
                this.candyBubbleAnimationL.visible = false;
                this.popBubble(this.candyL.x, this.candyL.y);
            } else {
                /**
                 * @type {Bubble | null}
                 */
                this.candyBubbleR = null;
                this.candyBubbleAnimationR.visible = false;
                this.popBubble(this.candyR.x, this.candyR.y);
            }
        } else {
            /**
             * @type {Bubble | null}
             */
            this.candyBubble = null;
            this.candyBubbleAnimation.visible = false;
            this.popBubble(this.candy.x, this.candy.y);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    popBubble(x, y) {
        this.detachCandy();

        SoundMgr.playSound(ResourceId.SND_BUBBLE_BREAK);

        this.bubbleDisappear.x = x;
        this.bubbleDisappear.y = y;

        this.bubbleDisappear.playTimeline(0);
        this.aniPool.addChild(this.bubbleDisappear);
    }

    /**
     * @param {ConstrainedPoint} s
     * @param {number} tx
     * @param {number} ty
     */
    handleBubbleTouch(s, tx, ty) {
        console.log(s);
        if (
            Rectangle.pointInRect(
                tx + this.camera.pos.x,
                ty + this.camera.pos.y,
                s.pos.x - resolution.BUBBLE_TOUCH_OFFSET,
                s.pos.y - resolution.BUBBLE_TOUCH_OFFSET,
                resolution.BUBBLE_TOUCH_SIZE,
                resolution.BUBBLE_TOUCH_SIZE
            )
        ) {
            this.popCandyBubble(s === this.starL);

            // Achievements.increment(AchievementId.BUBBLE_POPPER);
            // Achievements.increment(AchievementId.BUBBLE_MASTER);

            return true;
        }
        return false;
    }
}

export default GameSceneBubbles;
