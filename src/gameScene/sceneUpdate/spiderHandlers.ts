import Alignment from "@/core/Alignment";
import ImageElement from "@/visual/ImageElement";
import KeyFrame from "@/visual/KeyFrame";
import MathHelper from "@/utils/MathHelper";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import Timeline from "@/visual/Timeline";
import * as GameSceneConstants from "@/gameScene/constants";
import resolution from "@/resolution";
import Constants from "@/utils/Constants";

/**
 * @typedef {import("@/types/game-scene").GameScene} GameScene
 * @typedef {import("@/game/Grab").default} Grab
 */

/**
 * @param {GameScene} scene
 * @param {Grab} g
 */
function spiderBusted(scene, g) {
    SoundMgr.playSound(ResourceId.SND_SPIDER_FALL);
    g.hasSpider = false;
    const s = ImageElement.create(
        ResourceId.IMG_OBJ_SPIDER,
        GameSceneConstants.IMG_OBJ_SPIDER_busted
    );
    s.doRestoreCutTransparency();
    const tl = new Timeline();
    if (scene.gravityButton && !scene.gravityNormal) {
        tl.addKeyFrame(
            KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makePos(
                g.spider.x,
                g.spider.y + 50,
                KeyFrame.TransitionType.EASE_OUT,
                0.3
            )
        );
        tl.addKeyFrame(
            KeyFrame.makePos(
                g.spider.x,
                g.spider.y - resolution.CANVAS_HEIGHT,
                KeyFrame.TransitionType.EASE_IN,
                1
            )
        );
    } else {
        tl.addKeyFrame(
            KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makePos(
                g.spider.x,
                g.spider.y - 50,
                KeyFrame.TransitionType.EASE_OUT,
                0.3
            )
        );
        tl.addKeyFrame(
            KeyFrame.makePos(
                g.spider.x,
                g.spider.y + resolution.CANVAS_HEIGHT,
                KeyFrame.TransitionType.EASE_IN,
                1
            )
        );
    }

    tl.addKeyFrame(KeyFrame.makeRotation(0, 0, 0));
    tl.addKeyFrame(KeyFrame.makeRotation(MathHelper.randomRange(-120, 120), 0, 1));
    s.addTimelineWithID(tl, 0);
    s.playTimeline(0);
    s.x = g.spider.x;
    s.y = g.spider.y;
    s.anchor = Alignment.CENTER;

    tl.onFinished = scene.aniPool.timelineFinishedDelegate();
    scene.aniPool.addChild(s);

    // spider achievements
    // Achievements.increment(AchievementId.SPIDER_BUSTER);
    // Achievements.increment(AchievementId.SPIDER_TAMER);
}

/**
 * @param {GameScene} scene
 * @param {Grab} sg
 */
function spiderWon(scene, sg) {
    SoundMgr.playSound(ResourceId.SND_SPIDER_WIN);

    for (let i = 0, count = scene.bungees.length; i < count; i++) {
        const g = scene.bungees[i];
        const b = g.rope;
        if (b && b.tail === scene.star) {
            if (b.cut !== Constants.UNDEFINED) {
                g.destroyRope();
            } else {
                b.setCut(b.parts.length - 2);
                scene.detachCandy();
                b.forceWhite = false;
            }

            if (g.hasSpider && g.spiderActive && sg !== g) {
                scene.spiderBusted(g);
            }
        }
    }

    sg.hasSpider = false;
    scene.spiderTookCandy = true;
    scene.noCandy = true;

    const s = ImageElement.create(
        ResourceId.IMG_OBJ_SPIDER,
        GameSceneConstants.IMG_OBJ_SPIDER_stealing
    );
    s.doRestoreCutTransparency();
    scene.candy.anchor = scene.candy.parentAnchor = Alignment.CENTER;
    scene.candy.x = 0;
    scene.candy.y = -5;

    s.addChild(scene.candy);
    const tl = new Timeline();
    if (scene.gravityButton && !scene.gravityNormal) {
        tl.addKeyFrame(
            KeyFrame.makePos(
                sg.spider.x,
                sg.spider.y - 10,
                KeyFrame.TransitionType.EASE_OUT,
                0
            )
        );
        tl.addKeyFrame(
            KeyFrame.makePos(
                sg.spider.x,
                sg.spider.y + 70,
                KeyFrame.TransitionType.EASE_OUT,
                0.3
            )
        );
        tl.addKeyFrame(
            KeyFrame.makePos(
                sg.spider.x,
                sg.spider.y - resolution.CANVAS_HEIGHT,
                KeyFrame.TransitionType.EASE_IN,
                1
            )
        );
    } else {
        tl.addKeyFrame(
            KeyFrame.makePos(
                sg.spider.x,
                sg.spider.y - 10,
                KeyFrame.TransitionType.EASE_OUT,
                0
            )
        );
        tl.addKeyFrame(
            KeyFrame.makePos(
                sg.spider.x,
                sg.spider.y - 70,
                KeyFrame.TransitionType.EASE_OUT,
                0.3
            )
        );
        tl.addKeyFrame(
            KeyFrame.makePos(
                sg.spider.x,
                sg.spider.y + resolution.CANVAS_HEIGHT,
                KeyFrame.TransitionType.EASE_IN,
                1
            )
        );
    }

    s.addTimelineWithID(tl, 0);
    s.playTimeline(0);
    s.x = sg.spider.x;
    s.y = sg.spider.y - 10;
    s.anchor = Alignment.CENTER;

    tl.onFinished = scene.aniPool.timelineFinishedDelegate();
    scene.aniPool.addChild(s);

    if (scene.restartState !== GameSceneConstants.RestartState.FADE_IN) {
        scene.dd.callObject(scene, scene.gameLost, null, 2);
    }

    // Achievements.increment(AchievementId.SPIDER_LOVER);
}

class GameSceneSpiderHandlersDelegate {
    /**
     * @param {GameScene} scene
     */
    constructor(scene) {
        /** @type {GameScene} */
        this.scene = scene;
    }

    /**
     * @param {Grab} grab
     */
    spiderBusted(grab) {
        return spiderBusted(this.scene, grab);
    }

    /**
     * @param {Grab} grab
     */
    spiderWon(grab) {
        return spiderWon(this.scene, grab);
    }
}

export default GameSceneSpiderHandlersDelegate;
