import CTRGameObject from "@/game/CTRGameObject";
import Alignment from "@/core/Alignment";
import ImageElement from "@/visual/ImageElement";
import ResourceId from "@/resources/ResourceId";
import RGBAColor from "@/core/RGBAColor";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import SoundMgr from "@/game/CTRSoundMgr";
import MathHelper from "@/utils/MathHelper";
import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
import GhostBubble from "@/game/GhostBubble";
import GhostGrab from "@/game/GhostGrab";
import GhostBouncer from "@/game/GhostBouncer";
import GhostMorphingParticles from "@/game/GhostMorphingParticles";
const GhostState = {
    BODY: 1,
    BUBBLE: 2,
    GRAB: 4,
    BOUNCER: 8,
};
const GhostTimeline = {
    FADE_IN: 0,
    FADE_OUT: 1,
};
const IMG_OBJ_GHOST_BODY = 0;
const IMG_OBJ_GHOST_FACE = 2;
const GHOST_BUBBLE_FRAME_START = 1;
const GHOST_BUBBLE_FRAME_END = 3;
const GHOST_BUBBLE_BASE_FRAME = 0;
const GHOST_TOUCH_RADIUS = 40;
const GHOST_PARTICLE_COUNT = GhostMorphingParticles.PARTICLE_COUNT;
function removeFromCollection(collection, item) {
    if (!collection) {
        return;
    }
    const index = collection.indexOf(item);
    if (index >= 0) {
        collection.splice(index, 1);
    }
}
const Ghost = CTRGameObject.extend({
    initWithConfig: function (
        position,
        possibleStateMask,
        grabRadius,
        bouncerAngle,
        bubbles,
        bungees,
        bouncers,
        pixelMultiplier
    ) {
        this.anchor = Alignment.CENTER;
        this.x = position.x;
        this.y = position.y;
        this.pixelMultiplier = pixelMultiplier || 1;
        this.possibleStatesMask = possibleStateMask | GhostState.BODY;
        this.ghostState = GhostState.BODY;
        this.grabRadius = grabRadius;
        this.bouncerAngle = bouncerAngle;
        this.gsBubbles = bubbles;
        this.gsBungees = bungees;
        this.gsBouncers = bouncers;
        this.cyclingEnabled = true;
        this.candyBreak = false;
        this.bubble = null;
        this.grab = null;
        this.bouncer = null;
        this.pendingFadeOuts = [];
        this.imageContainer = new CTRGameObject();
        this.imageContainer.anchor = Alignment.CENTER;
        this.imageContainer.parentAnchor = Alignment.CENTER;
        this.addChild(this.imageContainer);
        this.body = ImageElement.create(ResourceId.IMG_OBJ_GHOST, IMG_OBJ_GHOST_BODY);
        this.body.anchor = this.body.parentAnchor = Alignment.CENTER;
        this.body.doRestoreCutTransparency();
        this.imageContainer.addChild(this.body);
        this.face = ImageElement.create(ResourceId.IMG_OBJ_GHOST, IMG_OBJ_GHOST_FACE);
        this.face.anchor = this.face.parentAnchor = Alignment.CENTER;
        this.face.doRestoreCutTransparency();
        this.imageContainer.addChild(this.face);
        this.morphingBubbles = new GhostMorphingParticles();
        this.morphingBubbles.x = this.x;
        this.morphingBubbles.y = this.y;
        this.addChild(this.morphingBubbles);
        this.setupTimelines();
        return this;
    },
    setupTimelines: function () {
        const fadeIn = new Timeline();
        fadeIn.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        fadeIn.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0.36)
        );
        this.imageContainer.addTimelineWithID(fadeIn, GhostTimeline.FADE_IN);
        const fadeOut = new Timeline();
        fadeOut.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        fadeOut.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.16)
        );
        this.imageContainer.addTimelineWithID(fadeOut, GhostTimeline.FADE_OUT);
        this.imageContainer.playTimeline(GhostTimeline.FADE_IN);
        const bobBody = new Timeline();
        bobBody.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.IMMEDIATE, 0));
        bobBody.addKeyFrame(KeyFrame.makePos(0, -3, KeyFrame.TransitionType.EASE_OUT, 0.38));
        bobBody.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.EASE_IN, 0.38));
        bobBody.addKeyFrame(KeyFrame.makePos(0, 3, KeyFrame.TransitionType.EASE_OUT, 0.38));
        bobBody.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.EASE_IN, 0.38));
        bobBody.loopType = Timeline.LoopType.REPLAY;
        this.body.addTimelineWithID(bobBody, 0);
        this.body.playTimeline(0);
        const bobFace = new Timeline();
        bobFace.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.IMMEDIATE, 0));
        bobFace.addKeyFrame(KeyFrame.makePos(0, -2, KeyFrame.TransitionType.EASE_OUT, 0.38));
        bobFace.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.EASE_IN, 0.38));
        bobFace.addKeyFrame(KeyFrame.makePos(0, 2, KeyFrame.TransitionType.EASE_OUT, 0.38));
        bobFace.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.EASE_IN, 0.38));
        bobFace.loopType = Timeline.LoopType.REPLAY;
        this.face.addTimelineWithID(bobFace, 0);
        this.face.playTimeline(0);
    },
    createFadeTimeline: function () {
        const timeline = new Timeline();
        timeline.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        timeline.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.16)
        );
        return timeline;
    },
    fadeOutElement: function (element, collection, onBeforeFade, onCleanup) {
        if (!element) {
            return;
        }
        if (element.currentTimelineIndex === GhostTimeline.FADE_OUT) {
            this.trackFadeOutElement(element, collection, onCleanup);
            return;
        }
        if (onBeforeFade) {
            onBeforeFade(element);
        }
        const timeline = this.createFadeTimeline();
        element.addTimelineWithID(timeline, GhostTimeline.FADE_OUT);
        element.playTimeline(GhostTimeline.FADE_OUT);
        this.trackFadeOutElement(element, collection, onCleanup);
    },
    trackFadeOutElement: function (element, collection, onCleanup) {
        if (!this.pendingFadeOuts) {
            this.pendingFadeOuts = [];
        }
        const alreadyTracked = this.pendingFadeOuts.some((entry) => entry.element === element);
        if (!alreadyTracked) {
            this.pendingFadeOuts.push({ element, collection, onCleanup });
        }
    },
    spawnBubble: function () {
        const bubbleFrame = MathHelper.randomRange(
            GHOST_BUBBLE_FRAME_START,
            GHOST_BUBBLE_FRAME_END
        );
        const bubble = new GhostBubble(this.x, this.y, bubbleFrame);
        const bubbleShell = ImageElement.create(
            ResourceId.IMG_OBJ_BUBBLE_ATTACHED,
            GHOST_BUBBLE_BASE_FRAME
        );
        bubbleShell.anchor = bubbleShell.parentAnchor = Alignment.CENTER;
        bubbleShell.doRestoreCutTransparency();
        bubble.addChild(bubbleShell);

        this.gsBubbles.push(bubble);
        this.bubble = bubble;
        this.imageContainer.playTimeline(GhostTimeline.FADE_OUT);
    },
    removeBubble: function () {
        if (!this.bubble) {
            return;
        }
        const bubble = this.bubble;
        this.fadeOutElement(
            bubble,
            this.gsBubbles,
            (b) => {
                b.popped = true;
            },
            (b) => {
                if (this.bubble === b) {
                    this.bubble = null;
                }
            }
        );
    },
    spawnGrab: function () {
        const grab = new GhostGrab(this.x, this.y);
        grab.setRadius(
            this.grabRadius !== Constants.UNDEFINED ? this.grabRadius : Constants.UNDEFINED
        );
        grab.wheel = false;
        grab.spider = null;
        grab.mover = null;
        this.gsBungees.push(grab);
        this.grab = grab;
        this.imageContainer.playTimeline(GhostTimeline.FADE_OUT);
    },
    removeGrab: function () {
        if (!this.grab) {
            return;
        }
        const grab = this.grab;
        this.fadeOutElement(
            grab,
            this.gsBungees,
            (g) => {
                const rope = g.rope;
                if (rope) {
                    rope.forceWhite = true;
                    rope.cutTime = 0.36;
                    if (rope.cut === Constants.UNDEFINED) {
                        rope.cut = 0;
                    }
                }
            },
            (g) => {
                if (g.destroyRope) {
                    g.destroyRope();
                }
                if (this.grab === g) {
                    this.grab = null;
                }
            }
        );
    },
    spawnBouncer: function () {
        const bouncer = new GhostBouncer(this.x, this.y, 1, this.bouncerAngle || 0);
        this.gsBouncers.push(bouncer);
        this.bouncer = bouncer;
        this.imageContainer.playTimeline(GhostTimeline.FADE_OUT);
    },
    removeBouncer: function () {
        if (!this.bouncer) {
            return;
        }
        const bouncer = this.bouncer;
        this.fadeOutElement(bouncer, this.gsBouncers, null, (b) => {
            if (this.bouncer === b) {
                this.bouncer = null;
            }
        });
    },
    cleanupFadedElement: function (element, collection, onCleanup) {
        if (!element || element.currentTimelineIndex !== GhostTimeline.FADE_OUT) {
            return false;
        }
        const timeline = element.getTimeline(GhostTimeline.FADE_OUT);
        if (!timeline || timeline.state !== Timeline.StateType.STOPPED) {
            return false;
        }
        if (element._ghostRemovalScheduled) {
            return false;
        }
        element._ghostRemovalScheduled = true;
        element.visible = false;
        element.touchable = false;
        element.update = function () {};
        const finalizeRemoval = () => {
            if (collection) {
                removeFromCollection(collection, element);
            }
            if (onCleanup) {
                onCleanup(element);
            }
            element._ghostRemovalScheduled = false;
        };
        if (typeof Promise !== "undefined" && Promise.resolve) {
            Promise.resolve().then(finalizeRemoval);
        } else if (typeof setTimeout === "function") {
            setTimeout(finalizeRemoval, 0);
        } else {
            finalizeRemoval();
        }
        return true;
    },
    resetToState: function (newState) {
        if ((newState & this.possibleStatesMask) === 0) {
            return;
        }
        if (this.bubble) {
            this.removeBubble();
        }
        if (this.grab) {
            this.removeGrab();
        }
        if (this.bouncer) {
            this.removeBouncer();
        }
        this.ghostState = newState;
        switch (newState) {
            case GhostState.BODY:
                this.imageContainer.playTimeline(GhostTimeline.FADE_IN);
                break;
            case GhostState.BUBBLE:
                this.spawnBubble();
                break;
            case GhostState.GRAB:
                this.spawnGrab();
                break;
            case GhostState.BOUNCER:
                this.spawnBouncer();
                break;
        }
        this.morphingBubbles.x = this.x;
        this.morphingBubbles.y = this.y;
        this.morphingBubbles.startSystem(GHOST_PARTICLE_COUNT);
        SoundMgr.playSound(ResourceId.SND_GHOST_PUFF);
    },
    resetToNextState: function () {
        let nextState = this.ghostState;
        do {
            nextState <<= 1;
            if (nextState > GhostState.BOUNCER) {
                nextState = GhostState.BUBBLE;
            }
        } while ((nextState & this.possibleStatesMask) === 0);
        this.resetToState(nextState);
    },
    onTouchDown: function (x, y) {
        if (!this.cyclingEnabled || this.candyBreak) {
            return false;
        }
        const distance = Vector.distance(x, y, this.x, this.y);
        if (distance < GHOST_TOUCH_RADIUS * this.pixelMultiplier) {
            this.resetToNextState();
            return true;
        }
        return false;
    },
    update: function (delta) {
        if (this.pendingFadeOuts && this.pendingFadeOuts.length) {
            this.pendingFadeOuts = this.pendingFadeOuts.filter((entry) => {
                const removed = this.cleanupFadedElement(
                    entry.element,
                    entry.collection,
                    entry.onCleanup
                );
                if (removed && entry.element === this.bubble) {
                    this.bubble = null;
                }
                if (removed && entry.element === this.grab) {
                    this.grab = null;
                }
                if (removed && entry.element === this.bouncer) {
                    this.bouncer = null;
                }
                return !removed;
            });
        }
        this._super(delta);
        if (
            this.grab &&
            this.grab.rope &&
            this.grab.rope.cut !== Constants.UNDEFINED &&
            this.ghostState === GhostState.GRAB
        ) {
            this.cyclingEnabled = true;
            this.resetToState(GhostState.BODY);
        }
    },
});
Ghost.State = GhostState;
export default Ghost;
