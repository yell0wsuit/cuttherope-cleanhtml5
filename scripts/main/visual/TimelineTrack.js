import Class from "utils/Class";
import KeyFrame from "visual/KeyFrame";
import TrackType from "visual/TrackType";
import Constants from "utils/Constants";
/**
 * @enum {number}
 */
const TrackState = {
    NOT_ACTIVE: 0,
    ACTIVE: 1,
};

const TimelineTrack = Class.extend({
    init: function (timeline, trackType) {
        this.type = trackType;
        this.state = TrackState.NOT_ACTIVE;
        this.relative = false;

        this.startTime = 0;
        this.endTime = 0;

        this.keyFrames = [];

        this.t = timeline;

        this.nextKeyFrame = Constants.UNDEFINED;
        this.currentStepPerSecond = KeyFrame.newEmpty();
        this.currentStepAcceleration = KeyFrame.newEmpty();
        this.elementPrevState = KeyFrame.newEmpty();
        this.keyFrameTimeLeft = 0;
        this.overrun = 0;

        if (trackType === TrackType.ACTION) {
            this.actionSets = [];
        }
    },
    deactivate: function () {
        this.state = TrackState.NOT_ACTIVE;
    },
    addKeyFrame: function (keyFrame) {
        this.setKeyFrame(keyFrame, this.keyFrames.length);
    },
    setKeyFrame: function (keyFrame, index) {
        this.keyFrames[index] = keyFrame;

        if (this.type === TrackType.ACTION) {
            this.actionSets.push(keyFrame.value.actionSet);
        }
    },
    getFrameTime: function (frameIndex) {
        let total = 0;
        for (let i = 0; i <= frameIndex; i++) {
            total += this.keyFrames[i].timeOffset;
        }
        return total;
    },
    updateRange: function () {
        this.startTime = this.getFrameTime(0);
        this.endTime = this.getFrameTime(this.keyFrames.length - 1);
    },
    updateActionTrack: function (delta) {
        if (this.state === TrackState.NOT_ACTIVE) {
            if (!this.t.timelineDirReverse) {
                if (!(this.t.time - delta > this.endTime || this.t.time < this.startTime)) {
                    if (this.keyFrames.length > 1) {
                        this.state = TrackState.ACTIVE;
                        this.nextKeyFrame = 0;
                        this.overrun = this.t.time - this.startTime;

                        this.nextKeyFrame++;
                        this.initActionKeyFrame(
                            this.keyFrames[this.nextKeyFrame - 1],
                            this.keyFrames[this.nextKeyFrame].timeOffset
                        );
                    } else {
                        this.initActionKeyFrame(this.keyFrames[0], 0);
                    }
                }
            } else {
                if (!(this.t.time + delta < this.startTime || this.t.time > this.endTime)) {
                    if (this.keyFrames.length > 1) {
                        this.state = TrackState.ACTIVE;
                        this.nextKeyFrame = this.keyFrames.length - 1;
                        this.overrun = this.endTime - this.t.time;
                        this.nextKeyFrame--;
                        this.initActionKeyFrame(
                            this.keyFrames[this.nextKeyFrame + 1],
                            this.keyFrames[this.nextKeyFrame].timeOffset
                        );
                    } else {
                        this.initActionKeyFrame(this.keyFrames[0], 0);
                    }
                }
            }
            return;
        }

        this.keyFrameTimeLeft -= delta;

        // FLOAT_PRECISION is used to fix the situation when timeline
        // time >= timeline length but keyFrameTimeLeft is not <= 0
        if (this.keyFrameTimeLeft <= Constants.FLOAT_PRECISION) {
            if (this.t.onKeyFrame) {
                this.t.onKeyFrame(this.t, this.keyFrames[this.nextKeyFrame], this.nextKeyFrame);
            }

            this.overrun = -this.keyFrameTimeLeft;

            if (this.nextKeyFrame === this.keyFrames.length - 1) {
                this.setElementFromKeyFrame(this.keyFrames[this.nextKeyFrame]);
                this.state = TrackState.NOT_ACTIVE;
            } else if (this.nextKeyFrame === 0) {
                this.setElementFromKeyFrame(this.keyFrames[this.nextKeyFrame]);
                this.state = TrackState.NOT_ACTIVE;
            } else {
                if (!this.t.timelineDirReverse) {
                    this.nextKeyFrame++;
                    this.initActionKeyFrame(
                        this.keyFrames[this.nextKeyFrame - 1],
                        this.keyFrames[this.nextKeyFrame].timeOffset
                    );
                } else {
                    this.nextKeyFrame--;
                    const kf = this.keyFrames[this.nextKeyFrame + 1];
                    this.initActionKeyFrame(kf, kf.timeOffset);
                }
            }
        }
    },
    updateNonActionTrack: function (delta) {
        let t = this.t,
            kf;
        if (this.state === TrackState.NOT_ACTIVE) {
            if (t.time >= this.startTime && t.time <= this.endTime) {
                this.state = TrackState.ACTIVE;
                if (!t.timelineDirReverse) {
                    this.nextKeyFrame = 0;
                    this.overrun = t.time - this.startTime;
                    this.nextKeyFrame++;
                    kf = this.keyFrames[this.nextKeyFrame];
                    this.initKeyFrameStepFrom(
                        this.keyFrames[this.nextKeyFrame - 1],
                        kf,
                        kf.timeOffset
                    );
                } else {
                    this.nextKeyFrame = this.keyFrames.length - 1;
                    this.overrun = this.endTime - t.time;
                    this.nextKeyFrame--;
                    kf = this.keyFrames[this.nextKeyFrame + 1];
                    this.initKeyFrameStepFrom(
                        kf,
                        this.keyFrames[this.nextKeyFrame],
                        kf.timeOffset
                    );
                }
            }
            return;
        }

        this.keyFrameTimeLeft -= delta;
        kf = this.keyFrames[this.nextKeyFrame];
        if (
            kf.transitionType === KeyFrame.TransitionType.EASE_IN ||
            kf.transitionType === KeyFrame.TransitionType.EASE_OUT
        ) {
            switch (this.type) {
                case TrackType.POSITION:
                    var saPos = this.currentStepAcceleration.value.pos,
                        xPosDelta = saPos.x * delta,
                        yPosDelta = saPos.y * delta,
                        spsPos = this.currentStepPerSecond.value.pos,
                        oldPosX = spsPos.x,
                        oldPosY = spsPos.y;
                    spsPos.x += xPosDelta;
                    spsPos.y += yPosDelta;
                    t.element.x += (oldPosX + xPosDelta / 2) * delta;
                    t.element.y += (oldPosY + yPosDelta / 2) * delta;
                    break;
                case TrackType.SCALE:
                    var saScale = this.currentStepAcceleration.value.scale,
                        xScaleDelta = saScale.x * delta,
                        yScaleDelta = saScale.y * delta,
                        spsScale = this.currentStepPerSecond.value.scale,
                        oldScaleX = spsScale.x,
                        oldScaleY = spsScale.y;
                    spsScale.x += xScaleDelta;
                    spsScale.y += yScaleDelta;
                    t.element.scaleX += (oldScaleX + xScaleDelta / 2) * delta;
                    t.element.scaleY += (oldScaleY + yScaleDelta / 2) * delta;
                    break;
                case TrackType.ROTATION:
                    var rDelta = this.currentStepAcceleration.value.rotationAngle * delta,
                        oldRotationAngle = this.currentStepPerSecond.value.rotationAngle;
                    this.currentStepPerSecond.value.rotationAngle += rDelta;
                    t.element.rotation += (oldRotationAngle + rDelta / 2) * delta;
                    break;
                case TrackType.COLOR:
                    var spsColor = this.currentStepPerSecond.value.color,
                        oldColorR = spsColor.r,
                        oldColorG = spsColor.g,
                        oldColorB = spsColor.b,
                        oldColorA = spsColor.a,
                        saColor = this.currentStepAcceleration.value.color,
                        deltaR = saColor.r * delta,
                        deltaG = saColor.g * delta,
                        deltaB = saColor.b * delta,
                        deltaA = saColor.a * delta;

                    // NOTE: it looks like there may be a bug in iOS? For now, we'll follow
                    // it by adding the delta twice
                    spsColor.r += deltaR * 2;
                    spsColor.g += deltaG * 2;
                    spsColor.b += deltaB * 2;
                    spsColor.a += deltaA * 2;

                    var elemColor = t.element.color;
                    elemColor.r += (oldColorR + deltaR / 2) * delta;
                    elemColor.g += (oldColorG + deltaG / 2) * delta;
                    elemColor.b += (oldColorB + deltaB / 2) * delta;
                    elemColor.a += (oldColorA + deltaA / 2) * delta;
                    break;
                case TrackType.ACTION:
                    break;
            }
        } else if (kf.transitionType === KeyFrame.TransitionType.LINEAR) {
            const elem = t.element,
                spsValue = this.currentStepPerSecond.value;
            switch (this.type) {
                case TrackType.POSITION:
                    elem.x += spsValue.pos.x * delta;
                    elem.y += spsValue.pos.y * delta;
                    break;
                case TrackType.SCALE:
                    elem.scaleX += spsValue.scale.x * delta;
                    elem.scaleY += spsValue.scale.y * delta;
                    break;
                case TrackType.ROTATION:
                    elem.rotationAngle += spsValue.rotationAngle * delta;
                    break;
                case TrackType.COLOR:
                    elem.color.r += spsValue.color.r * delta;
                    elem.color.g += spsValue.color.g * delta;
                    elem.color.b += spsValue.color.b * delta;
                    elem.color.a += spsValue.color.a * delta;
                    break;
                case TrackType.ACTION:
                    break;
            }
        }

        if (this.keyFrameTimeLeft <= Constants.FLOAT_PRECISION) {
            if (t.onKeyFrame) {
                t.onKeyFrame(t, this.keyFrames[this.nextKeyFrame], this.nextKeyFrame);
            }

            this.overrun = -this.keyFrameTimeLeft;

            if (this.nextKeyFrame === this.keyFrames.length - 1) {
                this.setElementFromKeyFrame(this.keyFrames[this.nextKeyFrame]);
                this.state = TrackState.NOT_ACTIVE;
            } else if (this.nextKeyFrame === 0) {
                this.setElementFromKeyFrame(this.keyFrames[this.nextKeyFrame]);
                this.state = TrackState.NOT_ACTIVE;
            } else {
                if (!t.timelineDirReverse) {
                    this.nextKeyFrame++;
                    kf = this.keyFrames[this.nextKeyFrame];
                    this.initKeyFrameStepFrom(
                        this.keyFrames[this.nextKeyFrame - 1],
                        kf,
                        kf.timeOffset
                    );
                } else {
                    this.nextKeyFrame--;
                    kf = this.keyFrames[this.nextKeyFrame + 1];
                    this.initKeyFrameStepFrom(
                        kf,
                        this.keyFrames[this.nextKeyFrame],
                        kf.timeOffset
                    );
                }
            }
        }
    },
    initActionKeyFrame: function (kf, time) {
        this.keyFrameTimeLeft = time;
        this.setElementFromKeyFrame(kf);

        if (this.overrun > 0) {
            this.updateActionTrack(this.overrun);
            this.overrun = 0;
        }
    },
    /**
     * @param kf {KeyFrame}
     */
    setElementFromKeyFrame: function (kf) {
        switch (this.type) {
            case TrackType.POSITION:
                var elem = this.t.element,
                    kfPos = kf.value.pos;
                if (!this.relative) {
                    elem.x = kfPos.x;
                    elem.y = kfPos.y;
                } else {
                    const prevPos = this.elementPrevState.value.pos;
                    elem.x = prevPos.x + kfPos.x;
                    elem.y = prevPos.y + kfPos.y;
                }
                break;
            case TrackType.SCALE:
                var kfScale = kf.value.scale;
                elem = this.t.element;
                if (!this.relative) {
                    elem.scaleX = kfScale.x;
                    elem.scaleY = kfScale.y;
                } else {
                    const prevScale = this.elementPrevState.value.scale;
                    elem.scaleX = prevScale.x + kfScale.x;
                    elem.scaleY = prevScale.y + kfScale.y;
                }
                break;
            case TrackType.ROTATION:
                if (!this.relative) {
                    this.t.element.rotation = kf.value.rotationAngle;
                } else {
                    this.t.element.rotation =
                        this.elementPrevState.value.rotationAngle + kf.value.rotationAngle;
                }
                break;
            case TrackType.COLOR:
                var elemColor = this.t.element.color,
                    kfColor = kf.value.color;
                if (!this.relative) {
                    elemColor.copyFrom(kfColor);
                } else {
                    const prevColor = this.elementPrevState.value.color;
                    elemColor.r = prevColor.r + kfColor.r;
                    elemColor.g = prevColor.g + kfColor.g;
                    elemColor.b = prevColor.b + kfColor.b;
                    elemColor.a = prevColor.a + kfColor.a;
                }
                break;
            case TrackType.ACTION:
                var actionSet = kf.value.actionSet;
                for (let i = 0, len = actionSet.length; i < len; i++) {
                    const action = actionSet[i];
                    action.actionTarget.handleAction(action.data);
                }
                break;
        }
    },
    setKeyFrameFromElement: function (kf) {
        const kfValue = kf.value,
            elem = this.t.element;
        switch (this.type) {
            case TrackType.POSITION:
                kfValue.pos.x = elem.x;
                kfValue.pos.y = elem.y;
                break;
            case TrackType.SCALE:
                kfValue.scale.x = elem.scaleX;
                kfValue.scale.y = elem.scaleY;
                break;
            case TrackType.ROTATION:
                kfValue.rotationAngle = elem.rotation;
                break;
            case TrackType.COLOR:
                kfValue.color.copyFrom(elem.color);
                break;
            case TrackType.ACTION:
                break;
        }
    },
    initKeyFrameStepFrom: function (src, dst, time) {
        this.keyFrameTimeLeft = time;

        this.setKeyFrameFromElement(this.elementPrevState);
        this.setElementFromKeyFrame(src);

        const spsValue = this.currentStepPerSecond.value,
            saValue = this.currentStepAcceleration.value;
        switch (this.type) {
            case TrackType.POSITION:
                var spsPos = spsValue.pos,
                    dstPos = dst.value.pos,
                    srcPos = src.value.pos;
                spsPos.x = (dstPos.x - srcPos.x) / this.keyFrameTimeLeft;
                spsPos.y = (dstPos.y - srcPos.y) / this.keyFrameTimeLeft;
                break;
            case TrackType.SCALE:
                var spsScale = spsValue.scale,
                    dstScale = dst.value.scale,
                    srcScale = src.value.scale;
                spsScale.x = (dstScale.x - srcScale.x) / this.keyFrameTimeLeft;
                spsScale.y = (dstScale.y - srcScale.y) / this.keyFrameTimeLeft;
                break;
            case TrackType.ROTATION:
                spsValue.rotationAngle =
                    (dst.value.rotationAngle - src.value.rotationAngle) / this.keyFrameTimeLeft;
                break;
            case TrackType.COLOR:
                var spsColor = spsValue.color,
                    dstColor = dst.value.color,
                    srcColor = src.value.color;
                spsColor.r = (dstColor.r - srcColor.r) / this.keyFrameTimeLeft;
                spsColor.g = (dstColor.g - srcColor.g) / this.keyFrameTimeLeft;
                spsColor.b = (dstColor.b - srcColor.b) / this.keyFrameTimeLeft;
                spsColor.a = (dstColor.a - srcColor.a) / this.keyFrameTimeLeft;
                break;
            case TrackType.ACTION:
                break;
        }

        const isEaseIn = dst.transitionType === KeyFrame.TransitionType.EASE_IN,
            isEaseOut = dst.transitionType == KeyFrame.TransitionType.EASE_OUT;
        if (isEaseIn || isEaseOut) {
            switch (this.type) {
                case TrackType.POSITION:
                    spsPos = spsValue.pos;
                    var saPos = saValue.pos;
                    spsPos.multiply(2);
                    saPos.x = spsPos.x / this.keyFrameTimeLeft;
                    saPos.y = spsPos.y / this.keyFrameTimeLeft;
                    if (isEaseIn) {
                        spsPos.x = 0;
                        spsPos.y = 0;
                    } else {
                        saPos.multiply(-1);
                    }
                    break;
                case TrackType.SCALE:
                    spsScale = spsValue.scale;
                    var saScale = saValue.scale;
                    spsScale.multiply(2);
                    saScale.x = spsScale.x / this.keyFrameTimeLeft;
                    saScale.y = spsScale.y / this.keyFrameTimeLeft;
                    if (isEaseIn) {
                        spsScale.x = 0;
                        spsScale.y = 0;
                    } else {
                        saScale.multiply(-1);
                    }
                    break;
                case TrackType.ROTATION:
                    spsValue.rotationAngle *= 2;
                    saValue.rotationAngle = spsValue.rotationAngle / this.keyFrameTimeLeft;
                    if (isEaseIn) {
                        spsValue.rotationAngle = 0;
                    } else {
                        saValue.rotationAngle *= -1;
                    }
                    break;
                case TrackType.COLOR:
                    spsColor = spsValue.color;
                    var saColor = saValue.color;
                    spsColor.multiply(2);
                    saColor.r = spsColor.r / this.keyFrameTimeLeft;
                    saColor.g = spsColor.g / this.keyFrameTimeLeft;
                    saColor.b = spsColor.b / this.keyFrameTimeLeft;
                    saColor.a = spsColor.a / this.keyFrameTimeLeft;
                    if (isEaseIn) {
                        spsColor.multiply(0);
                    } else {
                        saColor.multiply(-1);
                    }

                    break;
                case TrackType.ACTION:
                    break;
            }
        }

        if (this.overrun > 0) {
            this.updateNonActionTrack(this.overrun);
            this.overrun = 0;
        }
    },
});

export default TimelineTrack;
