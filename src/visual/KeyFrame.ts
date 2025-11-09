import Vector from "@/core/Vector";
import RGBAColor from "@/core/RGBAColor";
import Action from "@/visual/Action";
import TrackType from "@/visual/TrackType";
import type { TrackTypeValue } from "@/visual/TrackType";

const TransitionType = {
    LINEAR: 0,
    IMMEDIATE: 1,
    EASE_IN: 2,
    EASE_OUT: 3,
} as const;

type KeyFrameTransitionType = (typeof TransitionType)[keyof typeof TransitionType];

class KeyFrameValue {
    pos: Vector;
    scale: Vector;
    rotationAngle: number;
    color: RGBAColor;
    actionSet: Action[];

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

class KeyFrame {
    static readonly TransitionType = TransitionType;
    timeOffset: number;
    trackType: TrackTypeValue;
    transitionType: KeyFrameTransitionType;
    value: KeyFrameValue;

    constructor(
        time: number,
        trackType: TrackTypeValue,
        transitionType: KeyFrameTransitionType,
        value: KeyFrameValue
    ) {
        this.timeOffset = time;
        this.trackType = trackType;
        this.transitionType = transitionType;
        this.value = value;
    }

    static newEmpty(): KeyFrame {
        return new KeyFrame(
            0, // time
            TrackType.POSITION, // default track type
            KeyFrame.TransitionType.LINEAR, // default transition type
            new KeyFrameValue()
        );
    }

    static makePos(x: number, y: number, transition: KeyFrameTransitionType, time: number) {
        const v = new KeyFrameValue();
        v.pos.x = x;
        v.pos.y = y;
        return new KeyFrame(time, TrackType.POSITION, transition, v);
    }

    static makeScale(x: number, y: number, transition: KeyFrameTransitionType, time: number) {
        const v = new KeyFrameValue();
        v.scale.x = x;
        v.scale.y = y;
        return new KeyFrame(time, TrackType.SCALE, transition, v);
    }

    static makeRotation(r: number, transition: KeyFrameTransitionType, time: number) {
        const v = new KeyFrameValue();
        v.rotationAngle = r;
        return new KeyFrame(time, TrackType.ROTATION, transition, v);
    }

    static makeColor(color: RGBAColor, transition: KeyFrameTransitionType, time: number) {
        const v = new KeyFrameValue();
        v.color = color;
        return new KeyFrame(time, TrackType.COLOR, transition, v);
    }

    static makeAction(actions: Action[], time: number) {
        const v = new KeyFrameValue();
        v.actionSet = actions;
        return new KeyFrame(time, TrackType.ACTION, KeyFrame.TransitionType.LINEAR, v);
    }

    static makeSingleAction(
        target: object,
        actionName: string,
        actionParam: number,
        actionSubParam: number,
        time: number
    ) {
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

export default KeyFrame;
