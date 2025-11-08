import resolution from "@/resolution";
import type { GameScene } from "@/types/game-scene";

export function updateSpecial(this: GameScene, _delta: number): boolean {
    if (this.special !== 0 && this.special === 1) {
        if (
            !this.noCandy &&
            this.candyBubble != null &&
            this.candy.y < resolution.CANDY_BUBBLE_TUTORIAL_LIMIT_Y &&
            this.candy.x > resolution.CANDY_BUBBLE_TUTORIAL_LIMIT_X
        ) {
            this.special = 0;

            for (const tutorial of this.tutorials) {
                if (tutorial.special === 1) {
                    tutorial.playTimeline(0);
                }
            }

            for (const tutorialImage of this.tutorialImages) {
                if (tutorialImage.special === 1) {
                    tutorialImage.playTimeline(0);
                }
            }
        }
    }

    return true;
}
