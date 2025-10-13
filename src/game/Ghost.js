import BaseElement from "@/visual/BaseElement";
import Alignment from "@/core/Alignment";
import RGBAColor from "@/core/RGBAColor";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import MathHelper from "@/utils/MathHelper";
import Constants from "@/utils/Constants";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import ImageElement from "@/visual/ImageElement";
import GhostMorphingParticles from "@/game/GhostMorphingParticles";
import GhostBubble from "@/game/GhostBubble";
import GhostGrab from "@/game/GhostGrab";
import GhostBouncer from "@/game/GhostBouncer";
import GhostElementTimeline from "@/game/GhostElementTimeline";
import GhostState from "@/game/GhostState";
import { GhostSpriteIndex } from "@/game/GhostAssets";

const GHOST_TOUCH_RADIUS = 40;

function createAppearTimeline() {
    const timeline = new Timeline();
    timeline.addKeyFrame(
        KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.IMMEDIATE, 0)
    );
    timeline.addKeyFrame(
        KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0.36)
    );
    return timeline;
}

function createDisappearTimeline() {
    const timeline = new Timeline();
    timeline.addKeyFrame(
        KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.IMMEDIATE, 0)
    );
    timeline.addKeyFrame(
        KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.16)
    );
    return timeline;
}

const Ghost = BaseElement.extend({
    init: function (
        position,
        possibleStatesMask,
        grabRadius,
        bouncerAngle,
        bubbles,
        bungees,
        bouncers
    ) {
        this._super();

        this.possibleStatesMask = possibleStatesMask | GhostState.GHOST;
        this.ghostState = GhostState.GHOST;
        this.grabRadius = grabRadius;
        this.bouncerAngle = bouncerAngle;
        this.cyclingEnabled = true;
        this.candyBreak = false;

        this.gsBubbles = bubbles;
        this.gsBungees = bungees;
        this.gsBouncers = bouncers;

        this.x = position.x;
        this.y = position.y;
        this.anchor = Alignment.CENTER;
        this.passColorToChilds = true;

        this.bubble = null;
        this.grab = null;
        this.bouncer = null;

        this.ghostSprite = ImageElement.create(ResourceId.IMG_OBJ_GHOST, GhostSpriteIndex.BODY);
        this.ghostSprite.anchor = Alignment.CENTER;
        this.ghostSprite.parentAnchor = Alignment.CENTER;
        this.ghostSprite.doRestoreCutTransparency();
        this.addChild(this.ghostSprite);

        this.width = this.ghostSprite.width;
        this.height = this.ghostSprite.height;

        this.addTimelineWithID(createAppearTimeline(), GhostElementTimeline.APPEAR);
        this.addTimelineWithID(createDisappearTimeline(), GhostElementTimeline.DISAPPEAR);
        this.playTimeline(GhostElementTimeline.APPEAR);

        this.setupFloatingTimelines();

        this.morphingBubbles = new GhostMorphingParticles(7);
        this.morphingBubbles.x = this.x;
        this.morphingBubbles.y = this.y;
        this.addChild(this.morphingBubbles);
    },
    setupFloatingTimelines: function () {
        const startTimeline = new Timeline(),
            floatTimeline = new Timeline(),
            delay = Math.random();

        startTimeline.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.IMMEDIATE, 0));
        startTimeline.addKeyFrame(KeyFrame.makePos(0, -3, KeyFrame.TransitionType.EASE_OUT, delay));
        startTimeline.onFinished = this.startFloating.bind(this);

        floatTimeline.loopType = Timeline.LoopType.REPLAY;
        floatTimeline.addKeyFrame(KeyFrame.makePos(0, -3, KeyFrame.TransitionType.IMMEDIATE, 0));
        floatTimeline.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.EASE_IN, 0.38));
        floatTimeline.addKeyFrame(KeyFrame.makePos(0, 3, KeyFrame.TransitionType.EASE_OUT, 0.38));
        floatTimeline.addKeyFrame(KeyFrame.makePos(0, 0, KeyFrame.TransitionType.EASE_IN, 0.38));
        floatTimeline.addKeyFrame(KeyFrame.makePos(0, -3, KeyFrame.TransitionType.EASE_OUT, 0.38));

        this.ghostSprite.addTimelineWithID(startTimeline, GhostElementTimeline.DELAY);
        this.ghostSprite.addTimelineWithID(floatTimeline, GhostElementTimeline.FLOATING);
        this.ghostSprite.playTimeline(GhostElementTimeline.DELAY);
    },
    startFloating: function () {
        this.ghostSprite.playTimeline(GhostElementTimeline.FLOATING);
    },
    resetToState: function (newState) {
        if ((newState & this.possibleStatesMask) === 0) {
            return;
        }

        this.ghostState = newState;

        if (this.currentTimelineIndex === GhostElementTimeline.APPEAR) {
            this.playTimeline(GhostElementTimeline.DISAPPEAR);
        }

        this.fadeOutAttachment(this.bubble, this.gsBubbles);
        this.fadeOutAttachment(this.bouncer, this.gsBouncers);
        if (this.grab) {
            const rope = this.grab.rope;
            if (rope) {
                rope.forceWhite = true;
                rope.cutTime = 0.36;
                if (rope.cut === Constants.UNDEFINED) {
                    rope.cut = 0;
                }
            }
            this.fadeOutAttachment(this.grab, this.gsBungees, true);
        }

        switch (newState) {
            case GhostState.GHOST:
                this.playTimeline(GhostElementTimeline.APPEAR);
                break;
            case GhostState.BUBBLE: {
                const bubble = new GhostBubble(MathHelper.randomRange(0, 3));
                bubble.x = this.x;
                bubble.y = this.y;
                bubble.anchor = Alignment.CENTER;
                bubble.parentAnchor = Alignment.CENTER;
                bubble.popped = false;
                bubble.addSupportingCloudsTimelines();
                this.gsBubbles.push(bubble);
                bubble.addTimelineWithID(createAppearTimeline(), GhostElementTimeline.APPEAR);
                bubble.playTimeline(GhostElementTimeline.APPEAR);
                this.bubble = bubble;
                break;
            }
            case GhostState.GRAB: {
                const grab = new GhostGrab(this.x, this.y);
                grab.wheel = false;
                grab.spider = null;
                grab.setRadius(this.grabRadius);
                this.gsBungees.push(grab);
                grab.addTimelineWithID(createAppearTimeline(), GhostElementTimeline.APPEAR);
                grab.playTimeline(GhostElementTimeline.APPEAR);
                this.grab = grab;
                break;
            }
            case GhostState.BOUNCER: {
                const bouncer = new GhostBouncer(this.x, this.y, 1, this.bouncerAngle);
                this.gsBouncers.push(bouncer);
                bouncer.addTimelineWithID(createAppearTimeline(), GhostElementTimeline.APPEAR);
                bouncer.playTimeline(GhostElementTimeline.APPEAR);
                this.bouncer = bouncer;
                break;
            }
        }

        this.morphingBubbles.startSystem(7);
        SoundMgr.playSound(ResourceId.SND_GHOST_PUFF);
    },
    fadeOutAttachment: function (element, collection, destroyRope) {
        if (!element) {
            return;
        }
        if (element.currentTimelineIndex === GhostElementTimeline.DISAPPEAR) {
            this.removeFromCollection(collection, element);
            if (destroyRope && element.destroyRope) {
                element.destroyRope();
            }
            if (element === this.bubble) this.bubble = null;
            if (element === this.grab) this.grab = null;
            if (element === this.bouncer) this.bouncer = null;
            return;
        }
        const timeline = createDisappearTimeline();
        element.addTimelineWithID(timeline, GhostElementTimeline.DISAPPEAR);
        element.playTimeline(GhostElementTimeline.DISAPPEAR);
        if (element === this.bubble) {
            element.popped = true;
        }
    },
    removeFromCollection: function (collection, element) {
        const index = collection.indexOf(element);
        if (index !== -1) {
            collection.splice(index, 1);
        }
    },
    resetToNextState: function () {
        let nextState = this.ghostState;
        do {
            nextState <<= 1;
            if (nextState === GhostState.TOTAL_STATES) {
                nextState = GhostState.BUBBLE;
            }
        } while ((nextState & this.possibleStatesMask) === 0);
        this.resetToState(nextState);
    },
    onTouchDown: function (tx, ty) {
        const dx = tx - this.x,
            dy = ty - this.y,
            dist = Math.sqrt(dx * dx + dy * dy);
        if (this.cyclingEnabled && !this.candyBreak && dist < GHOST_TOUCH_RADIUS) {
            this.resetToNextState();
            return true;
        }
        return false;
    },
    update: function (delta) {
        this._super(delta);

        if (
            this.bubble &&
            this.bubble.currentTimelineIndex === GhostElementTimeline.DISAPPEAR &&
            this.bubble.currentTimeline &&
            this.bubble.currentTimeline.state === Timeline.StateType.STOPPED
        ) {
            this.removeFromCollection(this.gsBubbles, this.bubble);
            this.bubble = null;
        }

        if (
            this.bouncer &&
            this.bouncer.currentTimelineIndex === GhostElementTimeline.DISAPPEAR &&
            this.bouncer.currentTimeline &&
            this.bouncer.currentTimeline.state === Timeline.StateType.STOPPED
        ) {
            this.removeFromCollection(this.gsBouncers, this.bouncer);
            this.bouncer = null;
        }

        if (
            this.grab &&
            this.grab.currentTimelineIndex === GhostElementTimeline.DISAPPEAR &&
            this.grab.currentTimeline &&
            this.grab.currentTimeline.state === Timeline.StateType.STOPPED
        ) {
            if (this.grab.destroyRope) {
                this.grab.destroyRope();
            }
            this.removeFromCollection(this.gsBungees, this.grab);
            this.grab = null;
        }

        if (
            this.grab &&
            this.grab.rope &&
            this.grab.rope.cut !== Constants.UNDEFINED &&
            this.grab.currentTimelineIndex === GhostElementTimeline.APPEAR
        ) {
            this.cyclingEnabled = true;
            this.resetToState(GhostState.GHOST);
        }
    },
});

export default Ghost;
