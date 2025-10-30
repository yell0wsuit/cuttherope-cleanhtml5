import * as GameSceneConstants from "@/gameScene/constants";
import Constants from "@/utils/Constants";
import KeyFrame from "@/visual/KeyFrame";
import PubSub from "@/utils/PubSub";
import RGBAColor from "@/core/RGBAColor";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import Timeline from "@/visual/Timeline";
import settings from "@/game/CTRSettings";

const GameSceneLifecycle = (Base) =>
    class extends Base {
        animateLevelRestart() {
            this.restartState = GameSceneConstants.RestartState.FADE_IN;
            this.dimTime = Constants.DIM_TIMEOUT;
        }

        isFadingIn() {
            return this.restartState === GameSceneConstants.RestartState.FADE_IN;
        }

        calculateScore() {
            this.timeBonus = Math.max(0, 30 - this.time) * 100;
            this.timeBonus /= 10;
            this.timeBonus *= 10;
            this.starBonus = 1000 * this.starsCollected;
            this.score = Math.ceil(this.timeBonus + this.starBonus);
        }

        gameWon() {
            this.dd.cancelAllDispatches();

            this.target.playTimeline(GameSceneConstants.CharAnimation.WIN);
            SoundMgr.playSound(ResourceId.SND_MONSTER_CHEWING);

            if (this.candyBubble) {
                this.popCandyBubble(false);
            }

            this.noCandy = true;

            this.candy.passTransformationsToChilds = true;
            this.candyMain.scaleX = this.candyMain.scaleY = 1;
            this.candyTop.scaleX = this.candyTop.scaleY = 1;

            const tl = new Timeline();
            tl.addKeyFrame(
                KeyFrame.makePos(this.candy.x, this.candy.y, KeyFrame.TransitionType.LINEAR, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    this.target.x,
                    this.target.y + 10,
                    KeyFrame.TransitionType.LINEAR,
                    0.1
                )
            );
            tl.addKeyFrame(KeyFrame.makeScale(0.71, 0.71, KeyFrame.TransitionType.LINEAR, 0));
            tl.addKeyFrame(KeyFrame.makeScale(0, 0, KeyFrame.TransitionType.LINEAR, 0.1));
            tl.addKeyFrame(
                KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.transparent.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    0.1
                )
            );
            this.candy.addTimelineWithID(tl, 0);
            this.candy.playTimeline(0);
            tl.onFinished = this.aniPool.timelineFinishedDelegate();
            this.aniPool.addChild(this.candy);

            this.calculateScore();
            this.releaseAllRopes(false);

            const onLevelWonAppCallback = () => {
                PubSub.publish(PubSub.ChannelId.LevelWon, {
                    stars: this.starsCollected,
                    time: this.time,
                    score: this.score,
                    fps: 1 / this.gameController.avgDelta,
                });
            };

            // the closing doors animation takes 850ms so we want it to
            // finish before the game level deactivates (and freezes)
            if (settings.showMenu) {
                this.dd.callObject(this, onLevelWonAppCallback, null, 1);
            }

            // stop the electro after 1.5 seconds
            this.dd.callObject(
                this,
                function () {
                    // stop the electro spikes sound from looping
                    SoundMgr.stopSound(ResourceId.SND_ELECTRIC);
                },
                null,
                1.5
            );

            // fire level won callback after 2 secs
            const onLevelWon = function () {
                this.gameController.onLevelWon.call(this.gameController);
            };
            this.dd.callObject(this, onLevelWon, null, 1.8);
        }

        gameLost() {
            this.dd.cancelAllDispatches();
            this.target.playTimeline(GameSceneConstants.CharAnimation.FAIL);
            SoundMgr.playSound(ResourceId.SND_MONSTER_SAD);

            // fire level lost callback after 1 sec
            const onLevelLost = function () {
                this.gameController.onLevelLost.call(this.gameController);
                PubSub.publish(PubSub.ChannelId.LevelLost, { time: this.time });
            };
            this.dd.callObject(this, onLevelLost, null, 1);
        }
    };

export default GameSceneLifecycle;
