import Vector from "@/core/Vector";
import RGBAColor from "@/core/RGBAColor";
import Action from "@/visual/Action";
import TrackType from "@/visual/TrackType";

class KeyFrameValue {
    constructor() {
        this.pos = Vector.newZero();
        this.scale = Vector.newZero();
        this.rotationAngle = 0;
        this.color = RGBAColor.solidOpaque.copy();
        /**
         * @type {Action[]}
         */
        this.actionSet = [];
    }
    copy() {
        const clone = new KeyFrameValue();
        clone.pos = this.pos.copy();
        clone.scale = this.scale.copy();
        clone.rotationAngle = this.rotationAngle;
        clone.color = this.color.copy();

        // NOTE: this assumes actions are values (not object refs)
        clone.actionSet = this.actionSet.slice(0);
        return clone;
    }
}

/**
 * KeyFrame constructor
 * @param {number} time
 * @param {TrackType} trackType
 * @param {number} transitionType
 * @param {KeyFrameValue} value
 */
class KeyFrame {
    /**
     * @param {number} time
     * @param {number} trackType
     * @param {number} transitionType
     * @param {KeyFrameValue} value
     */
    constructor(time, trackType, transitionType, value) {
        this.timeOffset = time;
        this.trackType = trackType;
        this.transitionType = transitionType;
        this.value = value;
    }
    /**
     * Creates an empty keyframe
     * @return {KeyFrame}
     */
    static newEmpty() {
        return new KeyFrame(
            0, // time
            TrackType.POSITION, // default track type
            KeyFrame.TransitionType.LINEAR, // default transition type
            new KeyFrameValue()
        );
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} transition
     * @param {number} time
     */
    static makePos(x, y, transition, time) {
        const v = new KeyFrameValue();
        v.pos.x = x;
        v.pos.y = y;
        return new KeyFrame(time, TrackType.POSITION, transition, v);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} transition
     * @param {number} time
     */
    static makeScale(x, y, transition, time) {
        const v = new KeyFrameValue();
        v.scale.x = x;
        v.scale.y = y;
        return new KeyFrame(time, TrackType.SCALE, transition, v);
    }
    /**
     * @param {number} r
     * @param {number} transition
     * @param {number} time
     */
    static makeRotation(r, transition, time) {
        const v = new KeyFrameValue();
        v.rotationAngle = r;
        return new KeyFrame(time, TrackType.ROTATION, transition, v);
    }
    /**
     * @param {RGBAColor} color
     * @param {number} transition
     * @param {number} time
     */
    static makeColor(color, transition, time) {
        const v = new KeyFrameValue();
        v.color = color;
        return new KeyFrame(time, TrackType.COLOR, transition, v);
    }
    /**
     * @param {Action[]} actions
     * @param {number} time
     */
    static makeAction(actions, time) {
        const v = new KeyFrameValue();
        v.actionSet = actions;
        return new KeyFrame(time, TrackType.ACTION, KeyFrame.TransitionType.LINEAR, v);
    }
    /**
     * @param {Object} target
     * @param {string} actionName
     * @param {number} actionParam
     * @param {number} actionSubParam
     * @param {number} time
     */
    static makeSingleAction(target, actionName, actionParam, actionSubParam, time) {
        const v = new KeyFrameValue();
        const action = Action.create(target, actionName, actionParam, actionSubParam);
        v.actionSet = [action];
        return new KeyFrame(time, TrackType.ACTION, KeyFrame.TransitionType.LINEAR, v);
    }
    copy() {
        return new KeyFrame(
            this.timeOffset,
            this.trackType,
            this.transitionType,
            this.value.copy()
        );
    }
}

/**
 * @enum {number}
 */
KeyFrame.TransitionType = {
    LINEAR: 0,
    IMMEDIATE: 1,
    EASE_IN: 2,
    EASE_OUT: 3,
};

export default KeyFrame;
