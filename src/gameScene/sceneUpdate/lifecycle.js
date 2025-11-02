import * as GameSceneConstants from "@/gameScene/constants";
import Constants from "@/utils/Constants";
import KeyFrame from "@/visual/KeyFrame";
import PubSub from "@/utils/PubSub";
import RGBAColor from "@/core/RGBAColor";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import Timeline from "@/visual/Timeline";
import settings from "@/game/CTRSettings";

/**
 * @typedef {import("@/types/game-scene").GameScene} GameScene
 */

/**
 * @param {GameScene} scene
 */
function animateLevelRestart(scene) {
    scene.restartState = GameSceneConstants.RestartState.FADE_IN;
    scene.dimTime = Constants.DIM_TIMEOUT;
    scene.stopActiveRocket();
}

/**
 * @param {GameScene} scene
 */
function isFadingIn(scene) {
    return scene.restartState === GameSceneConstants.RestartState.FADE_IN;
}

/**
 * @param {GameScene} scene
 */
function calculateScore(scene) {
    scene.timeBonus = Math.max(0, 30 - scene.time) * 100;
    scene.timeBonus /= 10;
    scene.timeBonus *= 10;
    scene.starBonus = 1000 * scene.starsCollected;
    scene.score = Math.ceil(scene.timeBonus + scene.starBonus);
}

/**
 * @param {GameScene} scene
 */
function gameWon(scene) {
    scene.dd.cancelAllDispatches();
    scene.stopActiveRocket();

    scene.target.playTimeline(GameSceneConstants.CharAnimation.WIN);
    SoundMgr.playSound(ResourceId.SND_MONSTER_CHEWING);

    if (scene.candyBubble) {
        scene.popCandyBubble(false);
    }

    scene.noCandy = true;

    scene.candy.passTransformationsToChilds = true;
    scene.candyMain.scaleX = scene.candyMain.scaleY = 1;
    scene.candyTop.scaleX = scene.candyTop.scaleY = 1;

    const tl = new Timeline();
    tl.addKeyFrame(
        KeyFrame.makePos(scene.candy.x, scene.candy.y, KeyFrame.TransitionType.LINEAR, 0)
    );
    tl.addKeyFrame(
        KeyFrame.makePos(
            scene.target.x,
            scene.target.y + 10,
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
    scene.candy.addTimelineWithID(tl, 0);
    scene.candy.playTimeline(0);
    tl.onFinished = scene.aniPool.timelineFinishedDelegate();
    scene.aniPool.addChild(scene.candy);

    scene.calculateScore();
    scene.releaseAllRopes(false);

    const onLevelWonAppCallback = () => {
        PubSub.publish(PubSub.ChannelId.LevelWon, {
            stars: scene.starsCollected,
            time: scene.time,
            score: scene.score,
            fps: 1 / scene.gameController.avgDelta,
        });
    };

    // the closing doors animation takes 850ms so we want it to
    // finish before the game level deactivates (and freezes)
    if (settings.showMenu) {
        scene.dd.callObject(scene, onLevelWonAppCallback, null, 1);
    }

    // stop the electro after 1.5 seconds
    scene.dd.callObject(
        scene,
        function () {
            // stop the electro spikes sound from looping
            SoundMgr.stopSound(ResourceId.SND_ELECTRIC);
        },
        null,
        1.5
    );

    // fire level won callback after 2 secs
    const onLevelWon = function () {
        scene.gameController.onLevelWon.call(scene.gameController);
    };
    scene.dd.callObject(scene, onLevelWon, null, 1.8);
}

/**
 * @param {GameScene} scene
 */
function gameLost(scene) {
    scene.dd.cancelAllDispatches();
    scene.stopActiveRocket();
    scene.target.playTimeline(GameSceneConstants.CharAnimation.FAIL);
    SoundMgr.playSound(ResourceId.SND_MONSTER_SAD);

    // fire level lost callback after 1 sec
    const onLevelLost = function () {
        scene.gameController.onLevelLost.call(scene.gameController);
        PubSub.publish(PubSub.ChannelId.LevelLost, { time: scene.time });
    };
    scene.dd.callObject(scene, onLevelLost, null, 1);
}

class GameSceneLifecycleDelegate {
    /**
     * @param {GameScene} scene
     */
    constructor(scene) {
        /** @type {GameScene} */
        this.scene = scene;
    }

    animateLevelRestart() {
        return animateLevelRestart(this.scene);
    }

    isFadingIn() {
        return isFadingIn(this.scene);
    }

    calculateScore() {
        return calculateScore(this.scene);
    }

    gameWon() {
        return gameWon(this.scene);
    }

    gameLost() {
        return gameLost(this.scene);
    }
}

export default GameSceneLifecycleDelegate;
