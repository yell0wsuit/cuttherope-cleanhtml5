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

const GameSceneSpiderHandlers = (Base) =>
    class extends Base {
    /**
     * @param {Grab} g
     */
    spiderBusted(g) {
        SoundMgr.playSound(ResourceId.SND_SPIDER_FALL);
        g.hasSpider = false;
        const s = ImageElement.create(
            ResourceId.IMG_OBJ_SPIDER,
            GameSceneConstants.IMG_OBJ_SPIDER_busted
        );
        s.doRestoreCutTransparency();
        const tl = new Timeline();
        if (this.gravityButton && !this.gravityNormal) {
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y + 50, KeyFrame.TransitionType.EASE_OUT, 0.3)
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
                KeyFrame.makePos(g.spider.x, g.spider.y - 50, KeyFrame.TransitionType.EASE_OUT, 0.3)
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

        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(s);

        // spider achievements
        // Achievements.increment(AchievementId.SPIDER_BUSTER);
        // Achievements.increment(AchievementId.SPIDER_TAMER);
    }

    /**
     * @param {Grab} sg
     */
    spiderWon(sg) {
        SoundMgr.playSound(ResourceId.SND_SPIDER_WIN);

        for (let i = 0, count = this.bungees.length; i < count; i++) {
            const g = this.bungees[i];
            const b = g.rope;
            if (b && b.tail === this.star) {
                if (b.cut !== Constants.UNDEFINED) {
                    g.destroyRope();
                } else {
                    b.setCut(b.parts.length - 2);
                    this.detachCandy();
                    b.forceWhite = false;
                }

                if (g.hasSpider && g.spiderActive && sg !== g) {
                    this.spiderBusted(g);
                }
            }
        }

        sg.hasSpider = false;
        this.spiderTookCandy = true;
        this.noCandy = true;

        const s = ImageElement.create(
            ResourceId.IMG_OBJ_SPIDER,
            GameSceneConstants.IMG_OBJ_SPIDER_stealing
        );
        s.doRestoreCutTransparency();
        this.candy.anchor = this.candy.parentAnchor = Alignment.CENTER;
        this.candy.x = 0;
        this.candy.y = -5;

        s.addChild(this.candy);
        const tl = new Timeline();
        if (this.gravityButton && !this.gravityNormal) {
            tl.addKeyFrame(
                KeyFrame.makePos(sg.spider.x, sg.spider.y - 10, KeyFrame.TransitionType.EASE_OUT, 0)
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
                KeyFrame.makePos(sg.spider.x, sg.spider.y - 10, KeyFrame.TransitionType.EASE_OUT, 0)
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

        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(s);

        if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
            this.dd.callObject(this, this.gameLost, null, 2);
        }

        // Achievements.increment(AchievementId.SPIDER_LOVER);
    }
    };

export default GameSceneSpiderHandlers;
