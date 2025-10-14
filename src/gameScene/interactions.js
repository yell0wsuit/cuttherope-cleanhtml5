import resolution from "@/resolution";
import Vector from "@/core/Vector";
import Rectangle from "@/core/Rectangle";
import PumpDirt from "@/game/PumpDirt";
import ResourceMgr from "@/resources/ResourceMgr";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Alignment from "@/core/Alignment";
import MathHelper from "@/utils/MathHelper";
import ImageElement from "@/visual/ImageElement";
import Constants from "@/utils/Constants";
import Radians from "@/utils/Radians";

import {
    PartsType,
    RestartState,
    IMG_OBJ_SPIDER_busted,
    IMG_OBJ_SPIDER_stealing,
} from "./constants";
import { sharedState } from "./sharedState";

const interactionMethods = {
    handlePumpFlow(p, s, c, delta) {
        const powerRadius = resolution.PUMP_POWER_RADIUS;
        if (
            c.rectInObject(
                p.x - powerRadius,
                p.y - powerRadius,
                p.x + powerRadius,
                p.y + powerRadius
            )
        ) {
            const tn1 = new Vector(0, 0);
            const tn2 = new Vector(0, 0);
            const h = new Vector(c.x, c.y);

            tn1.x = p.x - p.bb.w / 2.0;
            tn2.x = p.x + p.bb.w / 2.0;
            tn1.y = tn2.y = p.y;

            if (p.angle != 0) {
                h.rotateAround(-p.angle, p.x, p.y);
            }

            if (
                h.y < tn1.y &&
                Rectangle.rectInRect(
                    h.x - c.bb.w / 2.0,
                    h.y - c.bb.h / 2.0,
                    h.x + c.bb.w / 2.0,
                    h.y + c.bb.h / 2.0,
                    tn1.x,
                    tn1.y - powerRadius,
                    tn2.x,
                    tn2.y
                )
            ) {
                const maxPower = powerRadius * 2.0;
                const power = (maxPower * (powerRadius - (tn1.y - h.y))) / powerRadius;
                const pumpForce = new Vector(0, -power);

                pumpForce.rotate(p.angle);
                s.applyImpulse(pumpForce, delta);
            }
        }
    },

    handleBounce(bouncer, star, delta) {
        if (bouncer.skip) {
            return;
        }

        const v = Vector.subtract(star.prevPos, star.pos);
        const spos = star.prevPos.copy();

        const angle = bouncer.angle;
        const x = bouncer.x;
        const y = bouncer.y;

        spos.rotateAround(-angle, x, y);

        const fromTop = spos.y < bouncer.y;
        const dir = fromTop ? -1 : 1;
        const a = v.getLength() * 40;
        const b = resolution.BOUNCER_MAX_MOVEMENT;
        const m = (a > b ? a : b) * dir;
        const v2 = Vector.forAngle(bouncer.angle);
        const impulse = Vector.perpendicular(v2);

        impulse.multiply(m);

        star.pos.rotateAround(-angle, x, y);
        star.prevPos.rotateAround(-angle, x, y);
        star.prevPos.y = star.pos.y;
        star.pos.rotateAround(angle, x, y);
        star.prevPos.rotateAround(angle, x, y);

        star.applyImpulse(impulse, delta);
        bouncer.playTimeline(0);

        SoundMgr.playSound(ResourceId.SND_BOUNCER);
    },

    operatePump(pump, delta) {
        pump.playTimeline(0);
        const soundId = MathHelper.randomRange(ResourceId.SND_PUMP_1, ResourceId.SND_PUMP_4);
        SoundMgr.playSound(soundId);

        const dirtTexture = ResourceMgr.getTexture(ResourceId.IMG_OBJ_PUMP);
        const b = new PumpDirt(5, dirtTexture, Radians.toDegrees(pump.angle) - 90);
        b.onFinished = this.aniPool.particlesFinishedDelegate();

        const v = new Vector(pump.x + resolution.PUMP_DIRT_OFFSET, pump.y);
        v.rotateAround(pump.angle - Math.PI / 2, pump.x, pump.y);
        b.x = v.x;
        b.y = v.y;

        b.startSystem(5);
        this.aniPool.addChild(b);

        if (!this.noCandy) {
            this.handlePumpFlow(pump, this.star, this.candy, delta);
        }

        if (this.twoParts !== PartsType.NONE) {
            if (!this.noCandyL) {
                this.handlePumpFlow(pump, this.starL, this.candyL, delta);
            }

            if (!this.noCandyR) {
                this.handlePumpFlow(pump, this.starR, this.candyR, delta);
            }
        }
    },

    cut(razor, v1, v2, immediate) {
        let cutCount = 0;
        for (let l = 0, len = this.bungees.length; l < len; l++) {
            const g = this.bungees[l];
            const b = g.rope;

            if (!b || b.cut !== Constants.UNDEFINED) {
                continue;
            }

            const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS;
            const GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2;
            for (let i = 0, iLimit = b.parts.length - 1; i < iLimit; i++) {
                const p1 = b.parts[i];
                const p2 = b.parts[i + 1];
                let cut = false;

                if (razor) {
                    if (p1.prevPos.x !== Constants.INT_MAX) {
                        const minX = MathHelper.minOf4(
                            p1.pos.x,
                            p1.prevPos.x,
                            p2.pos.x,
                            p2.prevPos.x
                        );
                        const minY = MathHelper.minOf4(
                            p1.pos.y,
                            p1.prevPos.y,
                            p2.pos.y,
                            p2.prevPos.y
                        );
                        const maxX = MathHelper.maxOf4(
                            p1.pos.x,
                            p1.prevPos.x,
                            p2.pos.x,
                            p2.prevPos.x
                        );
                        const maxY = MathHelper.maxOf4(
                            p1.pos.y,
                            p1.prevPos.y,
                            p2.pos.y,
                            p2.prevPos.y
                        );

                        cut = Rectangle.rectInRect(
                            minX,
                            minY,
                            maxX,
                            maxY,
                            razor.drawX,
                            razor.drawY,
                            razor.drawX + razor.width,
                            razor.drawY + razor.height
                        );
                    }
                } else if (
                    g.wheel &&
                    Rectangle.lineInRect(
                        v1.x,
                        v1.y,
                        v2.x,
                        v2.y,
                        g.x - GRAB_WHEEL_RADIUS,
                        g.y - GRAB_WHEEL_RADIUS,
                        GRAB_WHEEL_DIAMETER,
                        GRAB_WHEEL_DIAMETER
                    )
                ) {
                    cut = false;
                } else {
                    cut = MathHelper.lineInLine(
                        v1.x,
                        v1.y,
                        v2.x,
                        v2.y,
                        p1.pos.x,
                        p1.pos.y,
                        p2.pos.x,
                        p2.pos.y
                    );
                }

                if (cut) {
                    cutCount++;

                    if (g.hasSpider && g.spiderActive) {
                        this.spiderBusted(g);
                    }

                    SoundMgr.playSound(ResourceId.SND_ROPE_BLEAK_1 + b.relaxed);

                    b.setCut(i);
                    this.detachCandy();

                    if (immediate) {
                        b.cutTime = 0;
                        b.removePart(i);
                    }

                    return cutCount;
                }
            }
        }

        return cutCount;
    },

    spiderBusted(g) {
        SoundMgr.playSound(ResourceId.SND_SPIDER_FALL);
        g.hasSpider = false;
        const s = ImageElement.create(ResourceId.IMG_OBJ_SPIDER, IMG_OBJ_SPIDER_busted);
        s.doRestoreCutTransparency();
        const tl = new Timeline();

        if (this.gravityButton && !this.gravityNormal) {
            tl.addKeyFrame(KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0));
            tl.addKeyFrame(
                KeyFrame.makePos(
                    g.spider.x,
                    g.spider.y + 70,
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
            tl.addKeyFrame(KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0));
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

        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(s);
    },

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

        const s = ImageElement.create(ResourceId.IMG_OBJ_SPIDER, IMG_OBJ_SPIDER_stealing);
        s.doRestoreCutTransparency();
        this.candy.anchor = this.candy.parentAnchor = Alignment.CENTER;
        this.candy.x = 0;
        this.candy.y = -5;

        s.addChild(this.candy);
        const tl = new Timeline();
        if (this.gravityButton && !this.gravityNormal) {
            tl.addKeyFrame(KeyFrame.makePos(sg.spider.x, sg.spider.y - 10, KeyFrame.TransitionType.EASE_OUT, 0));
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
            tl.addKeyFrame(KeyFrame.makePos(sg.spider.x, sg.spider.y - 10, KeyFrame.TransitionType.EASE_OUT, 0));
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

        if (this.restartState !== RestartState.FADE_IN) {
            this.dd.callObject(this, this.gameLost, null, 2);
        }
    },

    popCandyBubble(isLeft) {
        if (this.twoParts !== PartsType.NONE) {
            if (isLeft) {
                this.candyBubbleL = null;
                this.candyBubbleAnimationL.visible = false;
                this.popBubble(this.candyL.x, this.candyL.y);
            } else {
                this.candyBubbleR = null;
                this.candyBubbleAnimationR.visible = false;
                this.popBubble(this.candyR.x, this.candyR.y);
            }
        } else {
            this.candyBubble = null;
            this.candyBubbleAnimation.visible = false;
            this.popBubble(this.candy.x, this.candy.y);
        }
    },

    popBubble(x, y) {
        this.detachCandy();

        SoundMgr.playSound(ResourceId.SND_BUBBLE_BREAK);

        const bubbleDisappear = sharedState.bubbleDisappear;
        if (bubbleDisappear) {
            bubbleDisappear.x = x;
            bubbleDisappear.y = y;

            bubbleDisappear.playTimeline(0);
            this.aniPool.addChild(bubbleDisappear);
        }
    },

    handleBubbleTouch(s, tx, ty) {
        if (
            Rectangle.pointInRect(
                tx + this.camera.pos.x,
                ty + this.camera.pos.y,
                s.pos.x - resolution.BUBBLE_TOUCH_OFFSET,
                s.pos.y - resolution.BUBBLE_TOUCH_OFFSET,
                resolution.BUBBLE_TOUCH_SIZE,
                resolution.BUBBLE_TOUCH_SIZE
            )
        ) {
            this.popCandyBubble(s === this.starL);

            return true;
        }
        return false;
    },

    resetBungeeHighlight() {
        for (let i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i];
            const bungee = grab.rope;
            if (!bungee || bungee.cut !== Constants.UNDEFINED) {
                continue;
            }
            bungee.highlighted = false;
        }
    },

    getNearestBungeeGrabByBezierPoints(s, tx, ty) {
        const SEARCH_RADIUS = resolution.CLICK_TO_CUT_SEARCH_RADIUS;
        let grab = null;
        let md = SEARCH_RADIUS;
        const tv = new Vector(tx, ty);

        for (let l = 0, numBungees = this.bungees.length; l < numBungees; l++) {
            const g = this.bungees[l];
            const b = g.rope;

            if (b) {
                for (let i = 0, numParts = b.drawPts.length; i < numParts; i++) {
                    const c1 = b.drawPts[i];
                    const d = c1.distance(tv);
                    if (d < SEARCH_RADIUS && d < md) {
                        md = d;
                        grab = g;
                        s.copyFrom(c1);
                    }
                }
            }
        }

        return grab;
    },

    getNearestBungeeSegmentByConstraints(s, g) {
        let SEARCH_RADIUS = Number.MAX_VALUE;
        let nb = null;
        let md = SEARCH_RADIUS;
        const sOrig = s.copy();
        const b = g.rope;

        if (!b || b.cut !== Constants.UNDEFINED) {
            return null;
        }

        const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS;
        const GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2;
        for (let i = 0, numParts = b.parts.length - 1; i < numParts; i++) {
            const p1 = b.parts[i];
            const d = p1.pos.distance(sOrig);
            if (d < md) {
                if (
                    !g.wheel ||
                    Rectangle.pointInRect(
                        p1.pos.x,
                        p1.pos.y,
                        g.x - GRAB_WHEEL_RADIUS,
                        g.y - GRAB_WHEEL_RADIUS,
                        GRAB_WHEEL_DIAMETER,
                        GRAB_WHEEL_DIAMETER
                    )
                ) {
                    md = d;
                    nb = b;
                    s.copyFrom(p1.pos);
                }
            }
        }

        return nb;
    },
};

export default interactionMethods;
