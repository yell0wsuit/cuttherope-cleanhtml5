import MathHelper from "@/utils/MathHelper";
import * as GameSceneConstants from "@/gameScene/constants";
import { IS_XMAS, IS_JANUARY } from "@/resources/ResData";

export const GameSceneCharacter = {
    onIdleOmNomKeyFrame: function (timeline, keyFrame, index) {
        if (index === 1) {
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
    },
    onPaddingtonIdleKeyFrame: function (timeline, keyFrame, index) {
        if (!IS_JANUARY) {
            return;
        }

        const lastIndex =
            GameSceneConstants.IMG_CHAR_ANIMATION_PADDINGTON_end -
            GameSceneConstants.IMG_CHAR_ANIMATION_PADDINGTON_start;

        if (index !== lastIndex) {
            this.hidePaddingtonFinalFrame();
            return;
        }

        if (index === lastIndex) {
            this.showPaddingtonFinalFrame();
            if (!this.pendingPaddingtonIdleTransition) {
                this.pendingPaddingtonIdleTransition = true;
                this.dd.callObject(this, this.playRegularIdleAfterPaddington, null, 0.05);
            }
        }
    },
    playRegularIdleAfterPaddington: function () {
        if (this.target) {
            this.target.playTimeline(GameSceneConstants.CharAnimation.IDLE);
        }
        this.pendingPaddingtonIdleTransition = false;
    },
    onRotatedCircleTimelineFinished: function (t) {
        const circleToRemove = t.element;
        circleToRemove.removeOnNextUpdate = true;
    },
};
