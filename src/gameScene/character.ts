import MathHelper from "@/utils/MathHelper";
import * as GameSceneConstants from "@/gameScene/constants";
import { IS_XMAS, IS_JANUARY } from "@/resources/ResData";
import type Timeline from "@/visual/Timeline";
import GameSceneLoaders from "./loaders";

class GameSceneCharacter extends GameSceneLoaders {
    onIdleOmNomKeyFrame(_timeline: Timeline, _trackType: number, keyFrameIndex: number): void {
        if (keyFrameIndex === 1) {
            // om-nom blink
            this.blinkTimer--;
            if (this.blinkTimer === 0) {
                this.blink.visible = true;
                this.blink.playTimeline(0);
                this.blinkTimer = GameSceneConstants.BLINK_SKIP;
            }

            // om-nom idle action
            this.idlesTimer--;
            if (this.idlesTimer === 0) {
                if (MathHelper.randomRange(0, 1) === 1) {
                    IS_XMAS
                        ? this.target.playTimeline(GameSceneConstants.CharAnimation.IDLEXMAS)
                        : this.target.playTimeline(GameSceneConstants.CharAnimation.IDLE2);
                } else {
                    IS_XMAS
                        ? this.target.playTimeline(GameSceneConstants.CharAnimation.IDLE2XMAS)
                        : this.target.playTimeline(GameSceneConstants.CharAnimation.IDLE3);
                }
                this.idlesTimer = MathHelper.randomRange(5, 20);
            }
        }
    }

    onPaddingtonIdleKeyFrame(
        _timeline: Timeline,
        _trackType: number,
        keyFrameIndex: number
    ): void {
        if (!IS_JANUARY) {
            return;
        }

        const lastIndex =
            GameSceneConstants.IMG_CHAR_ANIMATION_PADDINGTON_end -
            GameSceneConstants.IMG_CHAR_ANIMATION_PADDINGTON_start;

        if (keyFrameIndex !== lastIndex) {
            this.hidePaddingtonFinalFrame();
            return;
        }

        if (keyFrameIndex === lastIndex) {
            this.showPaddingtonFinalFrame();
            if (!this.pendingPaddingtonIdleTransition) {
                this.pendingPaddingtonIdleTransition = true;
                this.dd.callObject(this, this.playRegularIdleAfterPaddington, null, 0.05);
            }
        }
    }

    playRegularIdleAfterPaddington(): void {
        if (this.target) {
            this.target.playTimeline(GameSceneConstants.CharAnimation.IDLE);
        }
        this.pendingPaddingtonIdleTransition = false;
    }

    onRotatedCircleTimelineFinished(t: Timeline): void {
        const circleToRemove = t.element as { removeOnNextUpdate?: boolean } | null;
        if (circleToRemove) {
            circleToRemove.removeOnNextUpdate = true;
        }
    }
}

export default GameSceneCharacter;
