import GameObject from "@/visual/GameObject";
import Mover from "@/utils/Mover";
import SoundMgr from "@/game/CTRSoundMgr";
import Vector from "@/core/Vector";
import resolution from "@/resolution";
import * as GameSceneConstants from "@/gameScene/constants";
import ResourceId from "@/resources/ResourceId";

/**
 * @param {number} delta
 */
export function updateTargetState(delta) {
    let targetVector;
    if (!this.noCandy) {
        const MOUTH_OPEN_RADIUS = resolution.MOUTH_OPEN_RADIUS;
        if (!this.mouthOpen) {
            targetVector = new Vector(this.target.x, this.target.y);
            if (this.star.pos.distance(targetVector) < MOUTH_OPEN_RADIUS) {
                this.mouthOpen = true;
                this.target.playTimeline(GameSceneConstants.CharAnimation.MOUTH_OPEN);
                SoundMgr.playSound(ResourceId.SND_MONSTER_OPEN);
                this.mouthCloseTimer = GameSceneConstants.MOUTH_OPEN_TIME;
            }
        } else if (this.mouthCloseTimer > 0) {
            this.mouthCloseTimer = Mover.moveToTarget(this.mouthCloseTimer, 0, 1, delta);

            if (this.mouthCloseTimer <= 0) {
                targetVector = new Vector(this.target.x, this.target.y);
                if (this.star.pos.distance(targetVector) > MOUTH_OPEN_RADIUS) {
                    this.mouthOpen = false;
                    this.target.playTimeline(GameSceneConstants.CharAnimation.MOUTH_CLOSE);
                    SoundMgr.playSound(ResourceId.SND_MONSTER_CLOSE);

                    // this.tummyTeasers++;
                    // if (this.tummyTeasers === 10) {
                    //     Achievements.increment(AchievementId.TUMMY_TEASER);
                    // }
                } else {
                    this.mouthCloseTimer = GameSceneConstants.MOUTH_OPEN_TIME;
                }
            }
        }

        if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
            if (GameObject.intersect(this.candy, this.target)) {
                this.gameWon();
                return false;
            }
        }
    }

    const outOfScreen =
        this.twoParts === GameSceneConstants.PartsType.NONE &&
        this.pointOutOfScreen(this.star) &&
        !this.noCandy;
    const outOfScreenL =
        this.twoParts !== GameSceneConstants.PartsType.NONE &&
        this.pointOutOfScreen(this.starL) &&
        !this.noCandyL;
    const outOfScreenR =
        this.twoParts !== GameSceneConstants.PartsType.NONE &&
        this.pointOutOfScreen(this.starR) &&
        !this.noCandyR;

    if (outOfScreen || outOfScreenL || outOfScreenR) {
        if (outOfScreen) {
            this.noCandy = true;
        }
        if (outOfScreenL) {
            this.noCandyL = true;
        }
        if (outOfScreenR) {
            this.noCandyR = true;
        }

        if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
            // lost candy achievements
            // Achievements.increment(AchievementId.WEIGHT_LOSER);
            // Achievements.increment(AchievementId.CALORIE_MINIMIZER);

            if (
                this.twoParts !== GameSceneConstants.PartsType.NONE &&
                this.noCandyL &&
                this.noCandyR
            ) {
                return false;
            }
            this.gameLost();
            return false;
        }
    }

    return true;
}
