import CTRGameObject from "@/game/CTRGameObject";
import Alignment from "@/core/Alignment";
import ImageElement from "@/visual/ImageElement";
import ResourceId from "@/resources/ResourceId";
import RGBAColor from "@/core/RGBAColor";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Bubble from "@/game/Bubble";
import Grab from "@/game/Grab";
import Bouncer from "@/game/Bouncer";
import SoundMgr from "@/game/CTRSoundMgr";
import MathHelper from "@/utils/MathHelper";
import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
import Rectangle from "@/core/Rectangle";
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
const IMG_OBJ_GHOST_BUBBLE_START = 1;
const IMG_OBJ_GHOST_BUBBLE_END = 5;
const IMG_OBJ_GHOST_FACE = 6;
const TOUCH_RADIUS = 40;
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
    spawnBubble: function () {
        const bubble = new Bubble();
        bubble.initTextureWithId(ResourceId.IMG_OBJ_GHOST);
        bubble.setTextureQuad(
            MathHelper.randomRange(IMG_OBJ_GHOST_BUBBLE_START, IMG_OBJ_GHOST_BUBBLE_END)
        );
        bubble.doRestoreCutTransparency();
        bubble.anchor = Alignment.CENTER;
        bubble.x = this.x;
        bubble.y = this.y;
        bubble.bb = new Rectangle(-28, -28, 56, 56);
        bubble.popped = false;
        this.gsBubbles.push(bubble);
        this.bubble = bubble;
        this.imageContainer.playTimeline(GhostTimeline.FADE_OUT);
    },
    removeBubble: function () {
        if (!this.bubble) {
            return;
        }
        this.bubble.popped = true;
        removeFromCollection(this.gsBubbles, this.bubble);
        this.bubble = null;
    },
    spawnGrab: function () {
        const grab = new Grab();
        grab.x = this.x;
        grab.y = this.y;
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
        if (this.grab.destroyRope) {
            this.grab.destroyRope();
        }
        removeFromCollection(this.gsBungees, this.grab);
        this.grab = null;
    },
    spawnBouncer: function () {
        const bouncer = new Bouncer(this.x, this.y, 1, this.bouncerAngle || 0);
        this.gsBouncers.push(bouncer);
        this.bouncer = bouncer;
        this.imageContainer.playTimeline(GhostTimeline.FADE_OUT);
    },
    removeBouncer: function () {
        if (!this.bouncer) {
            return;
        }
        removeFromCollection(this.gsBouncers, this.bouncer);
        this.bouncer = null;
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
        if (distance < TOUCH_RADIUS * this.pixelMultiplier) {
            this.resetToNextState();
            return true;
        }
        return false;
    },
    update: function (delta) {
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
