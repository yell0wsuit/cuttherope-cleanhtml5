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
 * @param time {number}
 * @param trackType {TrackType}
 * @param transitionType {KeyFrame.TransitionType}
 * @param value {KeyFrameValue}
 */
function KeyFrame(time, trackType, transitionType, value) {
    this.timeOffset = time;
    this.trackType = trackType;
    this.transitionType = transitionType;
    this.value = value;
}

KeyFrame.prototype.copy = function () {
    return new KeyFrame(this.timeOffset, this.trackType, this.transitionType, this.value.copy());
};

/**
 * @enum {number}
 */
KeyFrame.TransitionType = {
    LINEAR: 0,
    IMMEDIATE: 1,
    EASE_IN: 2,
    EASE_OUT: 3,
};

/**
 * Creates an empty keyframe
 * @return {KeyFrame}
 */
KeyFrame.newEmpty = function () {
    return new KeyFrame(
        0, // time
        TrackType.POSITION, // default track type
        KeyFrame.TransitionType.LINEAR, // default transition type
        new KeyFrameValue()
    );
};

KeyFrame.makePos = function (x, y, transition, time) {
    const v = new KeyFrameValue();
    v.pos.x = x;
    v.pos.y = y;
    return new KeyFrame(time, TrackType.POSITION, transition, v);
};

KeyFrame.makeScale = function (x, y, transition, time) {
    const v = new KeyFrameValue();
    v.scale.x = x;
    v.scale.y = y;
    return new KeyFrame(time, TrackType.SCALE, transition, v);
};

KeyFrame.makeRotation = function (r, transition, time) {
    const v = new KeyFrameValue();
    v.rotationAngle = r;
    return new KeyFrame(time, TrackType.ROTATION, transition, v);
};

KeyFrame.makeColor = function (color, transition, time) {
    const v = new KeyFrameValue();
    v.color = color;
    return new KeyFrame(time, TrackType.COLOR, transition, v);
};

KeyFrame.makeAction = function (actions, time) {
    const v = new KeyFrameValue();
    v.actionSet = actions;
    return new KeyFrame(time, TrackType.ACTION, KeyFrame.TransitionType.LINEAR, v);
};

KeyFrame.makeSingleAction = function (target, actionName, actionParam, actionSubParam, time) {
    const v = new KeyFrameValue(),
        action = Action.create(target, actionName, actionParam, actionSubParam);
    v.actionSet = [action];
    return new KeyFrame(time, TrackType.ACTION, KeyFrame.TransitionType.LINEAR, v);
};

export default KeyFrame;
