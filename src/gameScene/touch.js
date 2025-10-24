import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
import * as GameSceneConstants from "@/gameScene/constants";
import Camera2D from "@/visual/Camera2D";
import Rectangle from "@/core/Rectangle";
import MathHelper from "@/utils/MathHelper";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Gravity from "@/physics/Gravity";
import resolution from "@/resolution";
import GravityButton from "@/game/GravityButton";
import PubSub from "@/utils/PubSub";
import FingerCut from "@/game/FingerCut";
import RGBAColor from "@/core/RGBAColor";
import EarthImage from "@/game/EarthImage";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Radians from "@/utils/Radians";

export const GameSceneTouch = {
    touchDown: function (x, y, touchIndex) {
        if (this.ignoreTouches) {
            if (this.camera.type === Camera2D.SpeedType.PIXELS) {
                this.fastenCamera = true;
            }
            return true;
        }

        if (touchIndex >= Constants.MAX_TOUCHES) {
            return true;
        }

        this.overOmNom = false;

        if (this.gravityButton) {
            const childIndex = this.gravityButton.isOn() ? 1 : 0,
                child = this.gravityButton.getChild(childIndex);
            if (child.isInTouchZone(x + this.camera.pos.x, y + this.camera.pos.y, true)) {
                this.gravityTouchDown = touchIndex;
                return true;
            }
        }

        if (this.candyBubble) {
            if (this.handleBubbleTouch(this.star, x, y)) {
                return true;
            }
        }

        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            if (this.candyBubbleL) {
                if (this.handleBubbleTouch(this.starL, x, y)) {
                    return true;
                }
            }
            if (this.candyBubbleR) {
                if (this.handleBubbleTouch(this.starR, x, y)) {
                    return true;
                }
            }
        }

        const touch = new Vector(x, y);
        if (!this.dragging[touchIndex]) {
            this.dragging[touchIndex] = true;
            this.startPos[touchIndex].copyFrom(touch);
            this.prevStartPos[touchIndex].copyFrom(touch);
        }

        let i, len;
        const cameraPos = this.camera.pos,
            cameraAdjustedX = x + cameraPos.x,
            cameraAdjustedY = y + cameraPos.y;

        // handle rotating spikes
        for (i = 0, len = this.spikes.length; i < len; i++) {
            const spike = this.spikes[i];
            if (
                spike.rotateButton &&
                spike.touchIndex === Constants.UNDEFINED &&
                spike.rotateButton.onTouchDown(cameraAdjustedX, cameraAdjustedY)
            ) {
                spike.touchIndex = touchIndex;
                return true;
            }
        }

        // handle pump touches
        for (i = 0, len = this.pumps.length; i < len; i++) {
            const pump = this.pumps[i];
            if (pump.pointInObject(cameraAdjustedX, cameraAdjustedY)) {
                pump.touchTimer = GameSceneConstants.PUMP_TIMEOUT;
                pump.touch = touchIndex;
                return true;
            }
        }

        let activeCircle = null,
            hasCircleInside = false,
            intersectsAnotherCircle = false;
        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            const r = this.rotatedCircles[i],
                d1 = Vector.distance(cameraAdjustedX, cameraAdjustedY, r.handle1.x, r.handle1.y),
                d2 = Vector.distance(cameraAdjustedX, cameraAdjustedY, r.handle2.x, r.handle2.y);
            if (
                (d1 < resolution.RC_CONTROLLER_RADIUS && !r.hasOneHandle()) ||
                d2 < resolution.RC_CONTROLLER_RADIUS
            ) {
                //check for overlapping
                for (let j = i + 1; j < len; j++) {
                    const r2 = this.rotatedCircles[j],
                        d3 = Vector.distance(r2.x, r2.y, r.x, r.y);

                    if (d3 + r2.sizeInPixels <= r.sizeInPixels) {
                        hasCircleInside = true;
                    }

                    if (d3 <= r.sizeInPixels + r2.sizeInPixels) intersectsAnotherCircle = true;
                }

                r.lastTouch.x = cameraAdjustedX;
                r.lastTouch.y = cameraAdjustedY;
                r.operating = touchIndex;

                if (d1 < resolution.RC_CONTROLLER_RADIUS) {
                    r.setIsLeftControllerActive(true);
                }
                if (d2 < resolution.RC_CONTROLLER_RADIUS) {
                    r.setIsRightControllerActive(true);
                }

                activeCircle = r;

                break;
            }
        }

        // circle fading
        const activeCircleIndex = this.rotatedCircles.indexOf(activeCircle);
        if (
            activeCircleIndex != this.rotatedCircles.length - 1 &&
            intersectsAnotherCircle &&
            !hasCircleInside
        ) {
            const fadeIn = new Timeline();
            fadeIn.addKeyFrame(
                KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0)
            );
            fadeIn.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.solidOpaque.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    0.2
                )
            );

            const fadeOut = new Timeline();
            fadeOut.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.solidOpaque.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    0.2
                )
            );
            fadeOut.onFinished = this.onRotatedCircleTimelineFinished.bind(this);

            const fadingOutCircle = activeCircle.copy();
            fadingOutCircle.addTimeline(fadeOut);
            fadingOutCircle.playTimeline(0);

            activeCircle.addTimeline(fadeIn);
            activeCircle.playTimeline(0);

            this.rotatedCircles[activeCircleIndex] = fadingOutCircle;
            this.rotatedCircles.push(activeCircle);
            activeCircle = null;
        }

        const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS,
            GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2,
            GRAB_MOVE_RADIUS = resolution.GRAB_MOVE_RADIUS,
            GRAB_MOVE_DIAMETER = GRAB_MOVE_RADIUS * 2;
        for (i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i];
            if (grab.wheel) {
                if (
                    Rectangle.pointInRect(
                        cameraAdjustedX,
                        cameraAdjustedY,
                        grab.x - GRAB_WHEEL_RADIUS,
                        grab.y - GRAB_WHEEL_RADIUS,
                        GRAB_WHEEL_DIAMETER,
                        GRAB_WHEEL_DIAMETER
                    )
                ) {
                    grab.handleWheelTouch(cameraAdjustedX, cameraAdjustedY);
                    grab.wheelOperating = touchIndex;
                }
            }

            if (grab.moveLength > 0) {
                if (
                    Rectangle.pointInRect(
                        cameraAdjustedX,
                        cameraAdjustedY,
                        grab.x - GRAB_MOVE_RADIUS,
                        grab.y - GRAB_MOVE_RADIUS,
                        GRAB_MOVE_DIAMETER,
                        GRAB_MOVE_DIAMETER
                    )
                ) {
                    grab.moverDragging = touchIndex;
                    return true;
                }
            }
        }

        if (this.clickToCut) {
            const cutPos = Vector.newZero(),
                grab = this.getNearestBungeeGrabByBezierPoints(
                    cutPos,
                    cameraAdjustedX,
                    cameraAdjustedY
                ),
                bungee = grab ? grab.rope : null;
            if (bungee && bungee.highlighted) {
                if (this.getNearestBungeeSegmentByConstraints(cutPos, grab)) {
                    this.cut(null, cutPos, cutPos, false);
                }
            }
        }

        // easter egg check must be last to avoid affecting other elements
        if (this.target.pointInDrawQuad(x, y)) {
            this.overOmNom = true;
        }

        return true;
    },
    doubleClick: function (x, y, touchIndex) {
        if (this.ignoreTouches) {
            return true;
        }

        return true;
    },
    touchUp: function (x, y, touchIndex) {
        if (this.ignoreTouches) {
            return true;
        }

        this.dragging[touchIndex] = false;

        // see if the user clicked on OmNom
        if (this.overOmNom && this.target.pointInDrawQuad(x, y)) {
            this.overOmNom = false;
            PubSub.publish(PubSub.ChannelId.OmNomClicked);
            return;
        } else {
            this.overOmNom = false;
        }

        let i, len;
        const cameraPos = this.camera.pos,
            cameraAdjustedX = x + cameraPos.x,
            cameraAdjustedY = y + cameraPos.y;

        // drawings
        for (i = 0, len = this.drawings.length; i < len; i++) {
            const drawing = this.drawings[i];
            if (drawing.pointInObject(cameraAdjustedX, cameraAdjustedY)) {
                drawing.showDrawing();

                // remove the drawing
                this.drawings.splice(i, 1);
                break;
            }
        }

        if (this.gravityButton && this.gravityTouchDown === touchIndex) {
            const childIndex = this.gravityButton.isOn() ? 1 : 0,
                child = this.gravityButton.getChild(childIndex);
            if (child.isInTouchZone(x + this.camera.pos.x, y + this.camera.pos.y, true)) {
                this.gravityButton.toggle();
                this.onButtonPressed(GravityButton.DefaultId);
            }
            this.gravityTouchDown = Constants.UNDEFINED;
        }

        for (i = 0, len = this.spikes.length; i < len; i++) {
            const spike = this.spikes[i];
            if (spike.rotateButton && spike.touchIndex === touchIndex) {
                spike.touchIndex = Constants.UNDEFINED;
                if (spike.rotateButton.onTouchUp(x + this.camera.pos.x, y + this.camera.pos.y)) {
                    return true;
                }
            }
        }

        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            const r = this.rotatedCircles[i];
            if (r.operating === touchIndex) {
                r.operating = Constants.UNDEFINED;
                r.soundPlaying = Constants.UNDEFINED;
                r.setIsLeftControllerActive(false);
                r.setIsRightControllerActive(false);
            }
        }

        for (i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i];
            if (grab.wheel && grab.wheelOperating === touchIndex) {
                grab.wheelOperating = Constants.UNDEFINED;
            }

            if (grab.moveLength > 0 && grab.moverDragging === touchIndex) {
                grab.moverDragging = Constants.UNDEFINED;
            }
        }

        return true;
    },
    touchMove: function (x, y, touchIndex) {
        if (this.ignoreTouches) {
            return true;
        }

        if (touchIndex >= Constants.MAX_TOUCHES) {
            return true;
        }

        const touch = new Vector(x, y);
        let i, len;
        if (this.startPos[touchIndex].distance(touch) > 10) {
            for (i = 0, len = this.pumps.length; i < len; i++) {
                const pump = this.pumps[i];

                // cancel pump touch if we moved
                if (pump.touch === touchIndex && pump.touchTimer !== 0) {
                    pump.touchTimer = 0;
                }
            }
        }

        this.slastTouch.copyFrom(touch);

        const cameraAdjustedTouch = new Vector(x + this.camera.pos.x, y + this.camera.pos.y);

        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            const r = this.rotatedCircles[i];
            if (r.operating === touchIndex) {
                const c = new Vector(r.x, r.y);
                if (c.distance(cameraAdjustedTouch) < r.sizeInPixels / 10) {
                    r.lastTouch.copyFrom(cameraAdjustedTouch);
                }

                const m1 = Vector.subtract(r.lastTouch, c),
                    m2 = Vector.subtract(cameraAdjustedTouch, c);
                let a = m2.normalizedAngle() - m1.normalizedAngle();

                if (a > Math.PI) {
                    a = a - 2 * Math.PI;
                } else if (a < -Math.PI) {
                    a = a + 2 * Math.PI;
                }

                r.handle1.rotateAround(a, r.x, r.y);
                r.handle2.rotateAround(a, r.x, r.y);
                r.rotation += Radians.toDegrees(a);

                let soundToPlay = a > 0 ? ResourceId.SND_SCRATCH_IN : ResourceId.SND_SCRATCH_OUT;

                if (Math.abs(a) < 0.07) soundToPlay = Constants.UNDEFINED;

                if (r.soundPlaying != soundToPlay && soundToPlay != Constants.UNDEFINED) {
                    SoundMgr.playSound(soundToPlay);
                    r.soundPlaying = soundToPlay;
                }

                for (i = 0, len = this.bungees.length; i < len; i++) {
                    const g = this.bungees[i],
                        gn = new Vector(g.x, g.y);
                    if (gn.distance(c) <= r.sizeInPixels + 5 * this.PM) {
                        gn.rotateAround(a, r.x, r.y);
                        g.x = gn.x;
                        g.y = gn.y;
                        if (g.rope) {
                            g.rope.bungeeAnchor.pos.copyFrom(gn);
                            g.rope.bungeeAnchor.pin.copyFrom(gn);
                        }
                    }
                }

                for (i = 0, len = this.pumps.length; i < len; i++) {
                    const g = this.pumps[i],
                        gn = new Vector(g.x, g.y);
                    if (gn.distance(c) <= r.sizeInPixels + 5 * this.PM) {
                        gn.rotateAround(a, r.x, r.y);
                        g.x = gn.x;
                        g.y = gn.y;
                        g.rotation += Radians.toDegrees(a);
                        g.updateRotation();
                    }
                }

                for (i = 0, len = this.bubbles.length; i < len; i++) {
                    const g = this.bubbles[i],
                        gn = new Vector(g.x, g.y);
                    if (
                        gn.distance(c) <= r.sizeInPixels + 10 * this.PM &&
                        g !== this.candyBubble &&
                        g !== this.candyBubbleR &&
                        g !== this.candyBubbleL
                    ) {
                        gn.rotateAround(a, r.x, r.y);
                        g.x = gn.x;
                        g.y = gn.y;
                    }
                }

                if (
                    Rectangle.pointInRect(
                        this.target.x,
                        this.target.y,
                        r.x - r.size,
                        r.y - r.size,
                        2 * r.size,
                        2 * r.size
                    )
                ) {
                    const gn = new Vector(this.target.x, this.target.y);
                    gn.rotateAround(a, r.x, r.y);
                    this.target.x = gn.x;
                    this.target.y = gn.y;
                }

                r.lastTouch.copyFrom(cameraAdjustedTouch);

                return true;
            }
        }

        for (i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i];
            if (!grab) {
                continue;
            }

            if (grab.wheel && grab.wheelOperating === touchIndex) {
                grab.handleWheelRotate(cameraAdjustedTouch);
                return true;
            }

            if (grab.moveLength > 0 && grab.moverDragging === touchIndex) {
                if (grab.moveVertical) {
                    grab.y = MathHelper.fitToBoundaries(
                        cameraAdjustedTouch.y,
                        grab.minMoveValue,
                        grab.maxMoveValue
                    );
                } else {
                    grab.x = MathHelper.fitToBoundaries(
                        cameraAdjustedTouch.x,
                        grab.minMoveValue,
                        grab.maxMoveValue
                    );
                }

                if (grab.rope) {
                    const ba = grab.rope.bungeeAnchor;
                    ba.pos.x = ba.pin.x = grab.x;
                    ba.pos.y = ba.pin.y = grab.y;
                }

                return true;
            }
        }

        if (this.dragging[touchIndex]) {
            const fc = new FingerCut(
                Vector.add(this.startPos[touchIndex], this.camera.pos),
                Vector.add(touch, this.camera.pos),
                5, // start size
                5, // end size
                RGBAColor.white.copy()
            );
            const currentCuts = this.fingerCuts[touchIndex];
            let ropeCuts = 0;

            currentCuts.push(fc);
            for (i = 0, len = currentCuts.length; i < len; i++) {
                const fcc = currentCuts[i];
                ropeCuts += this.cut(null, fcc.start, fcc.end, false);
            }

            if (ropeCuts > 0) {
                this.freezeCamera = false;

                if (this.ropesCutAtOnce > 0 && this.ropesAtOnceTimer > 0) {
                    this.ropesCutAtOnce += ropeCuts;
                } else {
                    this.ropesCutAtOnce = ropeCuts;
                }
                this.ropesAtOnceTimer = GameSceneConstants.ROPE_CUT_AT_ONCE_TIMEOUT;

                // rope cut achievements
                // Achievements.increment(AchievementId.ROPE_CUTTER);
                // Achievements.increment(AchievementId.ROPE_CUTTER_MANIAC);
                // Achievements.increment(AchievementId.ULTIMATE_ROPE_CUTTER);

                // // concurrent cut rope achievements
                // if (this.ropesCutAtOnce >= 5) {
                //     Achievements.increment(AchievementId.MASTER_FINGER);
                // } else if (this.ropesCutAtOnce >= 3) {
                //     Achievements.increment(AchievementId.QUICK_FINGER);
                // }
            }

            this.prevStartPos[touchIndex].copyFrom(this.startPos[touchIndex]);
            this.startPos[touchIndex].copyFrom(touch);
        }

        return true;
    },
    touchDragged: function (x, y, touchIndex) {
        if (touchIndex > Constants.MAX_TOUCHES) {
            return false;
        }

        this.slastTouch.x = x;
        this.slastTouch.y = y;
        return true;
    },
    onButtonPressed: function (n) {
        Gravity.toggle();
        this.gravityNormal = Gravity.isNormal();
        SoundMgr.playSound(
            this.gravityNormal ? ResourceId.SND_GRAVITY_OFF : ResourceId.SND_GRAVITY_ON
        );

        for (let i = 0, len = this.earthAnims.length; i < len; i++) {
            const earthImage = this.earthAnims[i];
            if (Gravity.isNormal()) {
                earthImage.playTimeline(EarthImage.TimelineId.NORMAL);
            } else {
                earthImage.playTimeline(EarthImage.TimelineId.UPSIDE_DOWN);
            }
        }
    },
    rotateAllSpikesWithId: function (sid) {
        for (let i = 0, len = this.spikes.length; i < len; i++) {
            if (this.spikes[i].getToggled() === sid) {
                this.spikes[i].rotateSpikes();
            }
        }
    },
};
