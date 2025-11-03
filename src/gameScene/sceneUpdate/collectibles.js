import Animation from "@/visual/Animation";
import Alignment from "@/core/Alignment";
import Bungee from "@/game/Bungee";
import Camera2D from "@/visual/Camera2D";
import ConstraintType from "@/physics/ConstraintType";
import * as GameSceneConstants from "@/gameScene/constants";
import GameObject from "@/visual/GameObject";
import Mover from "@/utils/Mover";
import SoundMgr from "@/game/CTRSoundMgr";
import Timeline from "@/visual/Timeline";
import Vector from "@/core/Vector";
import ResourceId from "@/resources/ResourceId";

/** @typedef {import("@/types/game-scene").GameScene} GameScene */

/**
 * @param {GameScene} this
 * @param {number} delta
 * @returns {boolean}
 */
export function updateCollectibles(delta) {
    let moveResult;
    if (!this.noCandy) {
        this.candy.update(delta);
        this.star.update(delta * this.ropePhysicsSpeed);
    }

    if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
        const ropeDelta = delta * this.ropePhysicsSpeed;
        this.candyL.update(delta);
        this.starL.update(ropeDelta);
        this.candyR.update(delta);
        this.starR.update(ropeDelta);
        if (this.twoParts === GameSceneConstants.PartsType.DISTANCE) {
            for (let i = 0; i < Bungee.BUNGEE_RELAXION_TIMES; i++) {
                this.starL.satisfyConstraints();
                this.starR.satisfyConstraints();
            }
        }
        if (this.partsDist > 0) {
            moveResult = Mover.moveToTargetWithStatus(this.partsDist, 0, 200, delta);
            this.partsDist = moveResult.value;
            if (moveResult.reachedZero) {
                SoundMgr.playSound(ResourceId.SND_CANDY_LINK);
                this.twoParts = GameSceneConstants.PartsType.NONE;
                this.noCandy = false;
                this.noCandyL = true;
                this.noCandyR = true;

                //Achievements.increment(AchievementId.ROMANTIC_SOUL);

                if (this.candyBubbleL || this.candyBubbleR) {
                    this.candyBubble = this.candyBubbleL ? this.candyBubbleL : this.candyBubbleR;
                    this.candyBubbleAnimation.visible = true;
                }

                this.lastCandyRotateDelta = 0;
                this.lastCandyRotateDeltaL = 0;
                this.lastCandyRotateDeltaR = 0;

                this.star.pos.x = this.starL.pos.x;
                this.star.pos.y = this.starL.pos.y;
                this.candy.x = this.star.pos.x;
                this.candy.y = this.star.pos.y;
                this.candy.calculateTopLeft();

                const lv = Vector.subtract(this.starL.pos, this.starL.prevPos);
                const rv = Vector.subtract(this.starR.pos, this.starR.prevPos);
                const sv = new Vector((lv.x + rv.x) / 2, (lv.y + rv.y) / 2);
                this.star.prevPos.copyFrom(this.star.pos);
                this.star.prevPos.subtract(sv);

                for (let i = 0, count = this.bungees.length; i < count; i++) {
                    const g = this.bungees[i];
                    const b = g.rope;
                    if (
                        b &&
                        b.cut !== b.parts.length - 3 &&
                        (b.tail === this.starL || b.tail === this.starR)
                    ) {
                        const prev = b.parts[b.parts.length - 2];
                        const heroRestLen = b.tail.restLength(prev);
                        this.star.addConstraint(prev, heroRestLen, ConstraintType.DISTANCE);
                        b.tail = this.star;
                        b.parts[b.parts.length - 1] = this.star;
                        b.initialCandleAngle = 0;
                        b.chosenOne = false;
                    }
                }

                const transform = new Animation();
                transform.initTextureWithId(this.candyResourceId);
                transform.doRestoreCutTransparency();
                transform.x = this.candy.x;
                transform.y = this.candy.y;
                transform.anchor = Alignment.CENTER;
                const a = transform.addAnimationDelay(
                    0.05,
                    Timeline.LoopType.NO_LOOP,
                    GameSceneConstants.IMG_OBJ_CANDY_01_part_fx_start,
                    GameSceneConstants.IMG_OBJ_CANDY_01_part_fx_end
                );
                transform.getTimeline(a).onFinished = this.aniPool.timelineFinishedDelegate();
                transform.playTimeline(0);
                this.aniPool.addChild(transform);
            } else {
                this.starL.changeRestLength(this.starR, this.partsDist);
                this.starR.changeRestLength(this.starL, this.partsDist);
            }
        }

        if (
            !this.noCandyL &&
            !this.noCandyR &&
            this.twoParts === GameSceneConstants.PartsType.SEPARATE &&
            GameObject.intersect(this.candyL, this.candyR)
        ) {
            this.twoParts = GameSceneConstants.PartsType.DISTANCE;
            this.partsDist = this.starL.pos.distance(this.starR.pos);
            this.starL.addConstraint(this.starR, this.partsDist, ConstraintType.NOT_MORE_THAN);
            this.starR.addConstraint(this.starL, this.partsDist, ConstraintType.NOT_MORE_THAN);
        }
    }

    this.target.update(delta);

    if (this.camera.type !== Camera2D.SpeedType.PIXELS || !this.ignoreTouches) {
        for (let i = 0, len = this.stars.length; i < len; i++) {
            const s = this.stars[i];
            if (!s) continue;
            s.update(delta);

            if (s.timeout > 0 && s.time === 0) {
                s.getTimeline(1).onFinished = this.aniPool.timelineFinishedDelegate();
                this.aniPool.addChild(s);
                this.stars.splice(i, 1);
                s.timedAnim.playTimeline(1);
                s.playTimeline(1);
                break;
            } else {
                let hits = false;
                if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                    hits =
                        (GameObject.intersect(this.candyL, s) && !this.noCandyL) ||
                        (GameObject.intersect(this.candyR, s) && !this.noCandyR);
                } else {
                    hits = GameObject.intersect(this.candy, s) && !this.noCandy;
                }

                if (hits) {
                    this.candyBlink.playTimeline(GameSceneConstants.CandyBlink.STAR);
                    this.starsCollected++;
                    this.hudStars[this.starsCollected - 1].playTimeline(0);

                    const starDisappear = this.starDisappearPool[i];
                    starDisappear.x = s.x;
                    starDisappear.y = s.y;

                    starDisappear.playTimeline(0);
                    this.aniPool.addChild(starDisappear);

                    this.stars[i] = null;
                    SoundMgr.playSound(ResourceId.SND_STAR_1 + this.starsCollected - 1);

                    if (
                        this.target.currentTimelineIndex === GameSceneConstants.CharAnimation.IDLE
                    ) {
                        this.target.playTimeline(GameSceneConstants.CharAnimation.EXCITED);
                    }

                    break;
                }
            }
        }
    }

    for (let i = 0, len = this.bubbles.length; i < len; i++) {
        const b = this.bubbles[i];
        b.update(delta);

        // Don't capture candy in bubble if rocket is flying
        const rocketFlying = this.activeRocket && this.activeRocket.state === 2; // State.FLY = 2

        if (!b.popped && !rocketFlying) {
            if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                if (
                    !this.noCandyL &&
                    this.isBubbleCapture(
                        b,
                        this.candyL,
                        this.candyBubbleL,
                        this.candyBubbleAnimationL
                    )
                ) {
                    this.candyBubbleL = b;
                    break;
                }

                if (
                    !this.noCandyR &&
                    this.isBubbleCapture(
                        b,
                        this.candyR,
                        this.candyBubbleR,
                        this.candyBubbleAnimationR
                    )
                ) {
                    this.candyBubbleR = b;
                    break;
                }
            } else if (
                !this.noCandy &&
                this.isBubbleCapture(b, this.candy, this.candyBubble, this.candyBubbleAnimation)
            ) {
                this.candyBubble = b;
                break;
            }
        }

        if (!b.withoutShadow) {
            const numRotatedCircles = this.rotatedCircles.length;
            for (let j = 0; j < numRotatedCircles; j++) {
                const rc = this.rotatedCircles[j];
                const distanceToCircle = Vector.distance(b.x, b.y, rc.x, rc.y);
                if (distanceToCircle < rc.sizeInPixels) {
                    b.withoutShadow = true;
                }
            }
        }
    }

    // tutorial text
    for (let i = 0, len = this.tutorials.length; i < len; i++) {
        const t = this.tutorials[i];
        t.update(delta);
    }

    // tutorial images
    for (let i = 0, len = this.tutorialImages.length; i < len; i++) {
        const t = this.tutorialImages[i];
        t.update(delta);
    }

    return true;
}
