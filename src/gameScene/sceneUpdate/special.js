import resolution from "@/resolution";

/** @typedef {import("@/types/game-scene").GameScene} GameScene */

/**
 * @param {GameScene} this
 * @param {number} delta
 */
export function updateSpecial(delta) {
    if (this.special !== 0) {
        if (this.special === 1) {
            if (
                !this.noCandy &&
                this.candyBubble != null &&
                this.candy.y < resolution.CANDY_BUBBLE_TUTORIAL_LIMIT_Y &&
                this.candy.x > resolution.CANDY_BUBBLE_TUTORIAL_LIMIT_X
            ) {
                this.special = 0;

                for (let i = 0, len = this.tutorials.length; i < len; i++) {
                    const t = this.tutorials[i];
                    if (t.special === 1) {
                        t.playTimeline(0);
                    }
                }

                for (let i = 0, len = this.tutorialImages.length; i < len; i++) {
                    const t = this.tutorialImages[i];
                    if (t.special === 1) {
                        t.playTimeline(0);
                    }
                }
            }
        }
    }

    return true;
}
