import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";
import resolution from "@/resolution";
import Constants from "@/utils/Constants";
import Mover from "@/utils/Mover";
import * as GameSceneConstants from "@/gameScene/constants";
import type { GameScene } from "@/types/game-scene";
import type GenericButton from "@/visual/GenericButton";

type SceneGrab = GameScene["bungees"][number];
type SceneBungee = NonNullable<SceneGrab["rope"]>;

type ClickToCutScene = Omit<GameScene, "restartState"> & {
    clickToCut: boolean;
    slastTouch: Vector;
    resetBungeeHighlight(): void;
    getNearestBungeeGrabByBezierPoints(s: Vector, tx: number, ty: number): SceneGrab | null;
    restartState: number;
};

export function updateClickToCut(this: ClickToCutScene, delta: number): void {
    if (this.clickToCut && !this.ignoreTouches) {
        this.resetBungeeHighlight();

        // first see if there is a nearby bungee
        const cv = new Vector(0, 0);
        const pos = Vector.add(this.slastTouch, this.camera.pos);
        const grab = this.getNearestBungeeGrabByBezierPoints(cv, pos.x, pos.y);
        const b: SceneBungee | null = grab ? grab.rope : null;
        if (b) {
            // now see if there is an active element that would override
            // bungee selection
            let activeElement = false;
            if (this.gravityButton) {
                const childIndex = this.gravityButton.isOn() ? 1 : 0;
                const c = this.gravityButton.getChild(childIndex) as GenericButton | undefined;
                if (c?.isInTouchZone(pos.x, pos.y, true)) {
                    activeElement = true;
                }
            }

            if (
                this.candyBubble ||
                (this.twoParts != GameSceneConstants.PartsType.NONE &&
                    (this.candyBubbleL || this.candyBubbleR))
            ) {
                for (const bubble of this.bubbles) {
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

            for (const spike of this.spikes) {
                if (spike.rotateButton && spike.rotateButton.isInTouchZone(pos.x, pos.y, true)) {
                    activeElement = true;
                }
            }

            for (const pump of this.pumps) {
                if (pump.pointInObject(pos.x, pos.y)) {
                    activeElement = true;
                    break;
                }
            }

            for (const rc of this.rotatedCircles) {
                if (rc.isLeftControllerActive() || rc.isRightControllerActive()) {
                    activeElement = true;
                    break;
                }

                const handle = rc.handle2;
                if (handle) {
                    const distance = Vector.distance(pos.x, pos.y, handle.x, handle.y);
                    if (distance <= resolution.RC_CONTROLLER_RADIUS) {
                        activeElement = true;
                        break;
                    }
                }
            }

            for (const grab of this.bungees) {
                if (grab.wheel) {
                    if (
                        Rectangle.pointInRect(
                            pos.x,
                            pos.y,
                            grab.x - resolution.GRAB_WHEEL_RADIUS,
                            grab.y - resolution.GRAB_WHEEL_RADIUS,
                            resolution.GRAB_WHEEL_RADIUS * 2,
                            resolution.GRAB_WHEEL_RADIUS * 2
                        )
                    ) {
                        activeElement = true;
                        break;
                    }
                }

                if (grab.moveLength > 0) {
                    if (
                        Rectangle.pointInRect(
                            pos.x,
                            pos.y,
                            grab.x - resolution.GRAB_MOVE_RADIUS,
                            grab.y - resolution.GRAB_MOVE_RADIUS,
                            resolution.GRAB_MOVE_RADIUS * 2,
                            resolution.GRAB_MOVE_RADIUS * 2
                        ) ||
                        grab.moverDragging !== Constants.UNDEFINED
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
