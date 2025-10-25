import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";
import resolution from "@/resolution";
import Constants from "@/utils/Constants";
import Mover from "@/utils/Mover";
import * as GameSceneConstants from "@/gameScene/constants";

export function updateClickToCut(delta) {
    if (this.clickToCut && !this.ignoreTouches) {
        this.resetBungeeHighlight();

        // first see if there is a nearby bungee
        const cv = new Vector(0, 0);
        const pos = Vector.add(this.slastTouch, this.camera.pos);
        const grab = this.getNearestBungeeGrabByBezierPoints(cv, pos.x, pos.y);
        const b = grab ? grab.rope : null;
        if (b) {
            // now see if there is an active element that would override
            // bungee selection
            let activeElement = false;
            if (this.gravityButton) {
                const c = this.gravityButton.getChild(this.gravityButton.isOn() ? 1 : 0);
                if (c.isInTouchZone(pos.x, pos.y, true)) {
                    activeElement = true;
                }
            }

            if (
                this.candyBubble ||
                (this.twoParts != GameSceneConstants.PartsType.NONE &&
                    (this.candyBubbleL || this.candyBubbleR))
            ) {
                for (let i = 0, len = this.bubbles.length; i < len; i++) {
                    const s = this.bubbles[i];
                    const BUBBLE_RADIUS = resolution.BUBBLE_RADIUS;
                    const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
                    if (this.candyBubble) {
                        if (
                            Rectangle.pointInRect(
                                pos.x,
                                pos.y,
                                this.star.pos.x - BUBBLE_RADIUS,
                                this.star.pos.y - BUBBLE_RADIUS,
                                BUBBLE_DIAMETER,
                                BUBBLE_DIAMETER
                            )
                        ) {
                            activeElement = true;
                            break;
                        }
                    }

                    if (this.candyBubbleL) {
                        if (
                            Rectangle.pointInRect(
                                pos.x,
                                pos.y,
                                this.starL.pos.x - BUBBLE_RADIUS,
                                this.starL.pos.y - BUBBLE_RADIUS,
                                BUBBLE_DIAMETER,
                                BUBBLE_DIAMETER
                            )
                        ) {
                            activeElement = true;
                            break;
                        }
                    }

                    if (this.candyBubbleR) {
                        if (
                            Rectangle.pointInRect(
                                pos.x,
                                pos.y,
                                this.starR.pos.x - BUBBLE_RADIUS,
                                this.starR.pos.y - BUBBLE_RADIUS,
                                BUBBLE_DIAMETER,
                                BUBBLE_DIAMETER
                            )
                        ) {
                            activeElement = true;
                            break;
                        }
                    }
                }
            }

            for (let i = 0, len = this.spikes.length; i < len; i++) {
                const s = this.spikes[i];
                if (s.rotateButton && s.rotateButton.isInTouchZone(pos.x, pos.y, true)) {
                    activeElement = true;
                }
            }

            for (let i = 0, len = this.pumps.length; i < len; i++) {
                if (this.pumps[i].pointInObject(pos.x, pos.y)) {
                    activeElement = true;
                    break;
                }
            }

            for (let i = 0, len = this.rotatedCircles.length; i < len; i++) {
                const rc = this.rotatedCircles[i];
                if (rc.isLeftControllerActive() || rc.isRightControllerActive()) {
                    activeElement = true;
                    break;
                }

                if (
                    Vector.distance(pos.x, pos.y, rc.handle2.x, rc.handle2.y) <=
                        resolution.RC_CONTROLLER_RADIUS ||
                    Vector.distance(pos.x, pos.y, rc.handle2.x, rc.handle2.y) <=
                        resolution.RC_CONTROLLER_RADIUS
                ) {
                    activeElement = true;
                    break;
                }
            }

            for (let i = 0, len = this.bungees.length; i < len; i++) {
                const g = this.bungees[i];
                if (g.wheel) {
                    if (
                        Rectangle.pointInRect(
                            pos.x,
                            pos.y,
                            g.x - resolution.GRAB_WHEEL_RADIUS,
                            g.y - resolution.GRAB_WHEEL_RADIUS,
                            resolution.GRAB_WHEEL_RADIUS * 2,
                            resolution.GRAB_WHEEL_RADIUS * 2
                        )
                    ) {
                        activeElement = true;
                        break;
                    }
                }

                if (g.moveLength > 0) {
                    if (
                        Rectangle.pointInRect(
                            pos.x,
                            pos.y,
                            g.x - resolution.GRAB_MOVE_RADIUS,
                            g.y - resolution.GRAB_MOVE_RADIUS,
                            resolution.GRAB_MOVE_RADIUS * 2,
                            resolution.GRAB_MOVE_RADIUS * 2
                        ) ||
                        g.moverDragging !== Constants.UNDEFINED
                    ) {
                        activeElement = true;
                        break;
                    }
                }
            }

            if (!activeElement) {
                b.highlighted = true;
            }
        }
    }

    const moveResult = Mover.moveToTargetWithStatus(this.dimTime, 0, 1, delta);
    this.dimTime = moveResult.value;
    if (moveResult.reachedZero) {
        if (this.restartState === GameSceneConstants.RestartState.FADE_IN) {
            this.restartState = GameSceneConstants.RestartState.FADE_OUT;
            this.hide();
            this.show();
            this.dimTime = Constants.DIM_TIMEOUT;
        } else {
            this.restartState = Constants.UNDEFINED;
        }
    }
    }
