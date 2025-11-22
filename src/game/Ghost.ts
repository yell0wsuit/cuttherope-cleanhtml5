import Alignment from "@/core/Alignment";
import Vector from "@/core/Vector";
import KeyFrame from "@/visual/KeyFrame";
import Timeline from "@/visual/Timeline";
import BaseElement from "@/visual/BaseElement";
import ImageElement from "@/visual/ImageElement";
import Grab from "@/game/Grab";
import Bungee from "@/game/Bungee";
import Bouncer from "@/game/Bouncer";
import GhostBubble from "@/game/GhostBubble";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import * as GameSceneConstants from "@/gameScene/constants";
import resolution from "@/resolution";
import Constants from "@/utils/Constants";
import RGBAColor from "@/core/RGBAColor";
import type ConstrainedPoint from "@/physics/ConstrainedPoint";
import type GameSceneInit from "@/gameScene/init";

const GHOST_TOUCH_RADIUS = 80;
const DEFAULT_BOUNCER_WIDTH = 1;
const DEFAULT_GHOST_STATE = 1;

class Ghost extends BaseElement {
    ghostState: number;
    bubble: GhostBubble | null;
    grab: Grab | null;
    bouncer: Bouncer | null;
    cyclingEnabled: boolean;
    grabRadius: number;
    candyBreak: boolean;
    possibleStatesMask: number;
    bouncerAngle: number;
    ghostImage: BaseElement;
    ghostImageBody: ImageElement;
    ghostImageFace: ImageElement;
    private readonly scene: GameSceneInit;

    constructor(
        position: Vector,
        possibleStateMask: number,
        grabRadius: number,
        bouncerAngle: number,
        scene: GameSceneInit
    ) {
        super();
        this.scene = scene;
        this.possibleStatesMask = possibleStateMask | DEFAULT_GHOST_STATE;
        this.ghostState = DEFAULT_GHOST_STATE;
        this.bouncerAngle = bouncerAngle;
        this.grabRadius = grabRadius;
        this.bubble = null;
        this.grab = null;
        this.bouncer = null;
        this.cyclingEnabled = true;
        this.candyBreak = false;

        this.x = position.x;
        this.y = position.y;

        this.ghostImage = new BaseElement();
        this.addChild(this.ghostImage);

        this.ghostImageBody = ImageElement.create(
            ResourceId.IMG_OBJ_GHOST,
            GameSceneConstants.IMG_OBJ_GHOST_body
        );
        this.ghostImageBody.anchor = this.ghostImageBody.parentAnchor = Alignment.CENTER;
        this.ghostImageBody.x = this.x;
        this.ghostImageBody.y = this.y;

        this.ghostImageFace = ImageElement.create(
            ResourceId.IMG_OBJ_GHOST,
            GameSceneConstants.IMG_OBJ_GHOST_face
        );
        this.ghostImageFace.anchor = this.ghostImageFace.parentAnchor = Alignment.CENTER;
        this.ghostImageFace.x = this.x;
        this.ghostImageFace.y = this.y;

        this.ghostImage.addChild(this.ghostImageFace);
        this.ghostImage.addChild(this.ghostImageBody);

        this.addFloatTimeline(this.ghostImageFace, 2, 0.5);
        this.addFloatTimeline(this.ghostImageBody, 3, 0.6);
    }

    updateGhost(delta: number): void {
        if (
            this.grab &&
            this.grab.rope &&
            this.grab.rope.cut !== Constants.UNDEFINED &&
            this.grab.rope.cutTime === 0
        ) {
            this.removeFromSceneArray(this.scene.bungees, this.grab);
            this.grab = null;
        }

        super.update(delta);
    }

    resetToNextState(): void {
        let state = this.ghostState;
        do {
            state = state === 8 ? DEFAULT_GHOST_STATE : state << 1;
        } while ((state & this.possibleStatesMask) === 0 && state !== this.ghostState);

        if ((state & this.possibleStatesMask) === 0) {
            state = DEFAULT_GHOST_STATE;
        }
        this.resetToState(state);
    }

    resetToState(newState: number): void {
        const allowedState =
            newState === DEFAULT_GHOST_STATE || (newState & this.possibleStatesMask) !== 0;
        if (!allowedState) {
            return;
        }

        this.clearMorphObjects();
        this.ghostState = newState;

        const morphTimeline = new Timeline();
        morphTimeline.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        morphTimeline.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0.36)
        );

        switch (newState) {
            case DEFAULT_GHOST_STATE:
                this.ghostImage.playTimeline(0);
                break;
            case 2: {
                const ghostBubble = new GhostBubble().initAt(this.x, this.y);
                ghostBubble.addTimeline(morphTimeline);
                ghostBubble.playTimeline(0);
                this.scene.bubbles.push(ghostBubble);
                this.bubble = ghostBubble;
                break;
            }
            case 4: {
                const grab = new Grab();
                grab.x = this.x;
                grab.y = this.y;
                grab.wheel = false;
                grab.spider = null;
                grab.setRadius(this.grabRadius);

                if (this.grabRadius === -1) {
                    const anchor = this.getGhostRopeAnchor();
                    if (anchor) {
                        const ropeLength = Math.max(
                            Vector.distance(this.x, this.y, anchor.pos.x, anchor.pos.y),
                            resolution.BUNGEE_REST_LEN
                        );
                        const rope = new Bungee(
                            null,
                            this.x,
                            this.y,
                            anchor,
                            anchor.pos.x,
                            anchor.pos.y,
                            ropeLength
                        );
                        rope.bungeeAnchor.pin.copyFrom(rope.bungeeAnchor.pos);
                        grab.setRope(rope);
                    }
                }

                this.scene.bungees.push(grab);
                this.grab = grab;
                grab.addTimeline(morphTimeline);
                grab.playTimeline(0);
                break;
            }
            case 8: {
                const bouncer = new Bouncer(
                    this.x,
                    this.y,
                    DEFAULT_BOUNCER_WIDTH,
                    this.bouncerAngle
                );
                bouncer.addTimeline(morphTimeline);
                bouncer.playTimeline(0);
                this.scene.bouncers.push(bouncer);
                this.bouncer = bouncer;
                break;
            }
            default:
                break;
        }

        SoundMgr.playSound(ResourceId.SND_GHOST_PUFF);
    }

    override onTouchDown(tx: number, ty: number): boolean {
        const distance = Vector.distance(tx, ty, this.x, this.y);
        if (this.cyclingEnabled && !this.candyBreak && distance < GHOST_TOUCH_RADIUS) {
            this.resetToNextState();
            return true;
        }
        return false;
    }

    private clearMorphObjects() {
        if (this.bubble) {
            this.removeFromSceneArray(this.scene.bubbles, this.bubble);
            this.bubble = null;
        }

        if (this.grab) {
            this.grab.destroyRope();
            this.removeFromSceneArray(this.scene.bungees, this.grab);
            this.grab = null;
        }

        if (this.bouncer) {
            this.removeFromSceneArray(this.scene.bouncers, this.bouncer);
            this.bouncer = null;
        }
    }

    private removeFromSceneArray<T>(collection: T[], target: T | null): void {
        if (!target) {
            return;
        }

        const index = collection.indexOf(target);
        if (index !== -1) {
            collection.splice(index, 1);
        }
    }

    private addFloatTimeline(element: BaseElement, offset: number, duration: number) {
        const float = new Timeline();
        float.loopType = Timeline.LoopType.REPLAY;
        float.addKeyFrame(
            KeyFrame.makePos(
                element.x,
                element.y - offset,
                KeyFrame.TransitionType.EASE_OUT,
                duration
            )
        );
        float.addKeyFrame(
            KeyFrame.makePos(
                element.x,
                element.y + offset,
                KeyFrame.TransitionType.EASE_IN,
                duration
            )
        );
        element.addTimeline(float);
        element.playTimeline(0);
    }

    private getGhostRopeAnchor(): ConstrainedPoint | null {
        if (this.scene.twoParts === GameSceneConstants.PartsType.NONE) {
            return !this.scene.noCandy && this.scene.star
                ? this.scene.star
                : (this.scene.star ?? this.scene.starL ?? this.scene.starR);
        }

        let best: ConstrainedPoint | null = null;
        let bestDistance = Number.MAX_VALUE;

        const consider = (candidate: ConstrainedPoint | null, candyMissing: boolean) => {
            if (!candidate || candyMissing) {
                return;
            }

            const distance = Vector.distance(this.x, this.y, candidate.pos.x, candidate.pos.y);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = candidate;
            }
        };

        consider(this.scene.starL, this.scene.noCandyL);
        consider(this.scene.starR, this.scene.noCandyR);

        return best
            ? best
            : !this.scene.noCandy && this.scene.star
              ? this.scene.star
              : (this.scene.star ?? this.scene.starL ?? this.scene.starR);
    }
}

export default Ghost;
