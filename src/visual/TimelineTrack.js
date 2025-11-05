import KeyFrame from "@/visual/KeyFrame";
import TrackType from "@/visual/TrackType";
import Constants from "@/utils/Constants";

/**
 * @typedef {object} TrackStrategy
 * @property {(track: TimelineTrack, keyFrame: KeyFrame, delta: number) => void} applyEaseStep
 * @property {(track: TimelineTrack, delta: number) => void} applyLinearStep
 * @property {(track: TimelineTrack, keyFrame: KeyFrame) => void} setElementFromKeyFrame
 * @property {(track: TimelineTrack, keyFrame: KeyFrame) => void} setKeyFrameFromElement
 * @property {(track: TimelineTrack, src: KeyFrame, dst: KeyFrame) => void} initKeyFrameStepFrom
 * @property {(track: TimelineTrack, src: KeyFrame, dst: KeyFrame, isEaseIn: boolean, isEaseOut: boolean) => void} configureEase
 */

/**
 * @type {Record<number, TrackStrategy>}
 */
const TRACK_STRATEGIES = {
    [TrackType.POSITION]: {
        applyEaseStep(track, _keyFrame, delta) {
            const saPos = track.currentStepAcceleration.value.pos;
            const xPosDelta = saPos.x * delta;
            const yPosDelta = saPos.y * delta;
            const spsPos = track.currentStepPerSecond.value.pos;
            const oldPosX = spsPos.x;
            const oldPosY = spsPos.y;

            spsPos.x += xPosDelta;
            spsPos.y += yPosDelta;

            track.t.element.x += (oldPosX + xPosDelta / 2) * delta;
            track.t.element.y += (oldPosY + yPosDelta / 2) * delta;
        },
        applyLinearStep(track, delta) {
            const spsValue = track.currentStepPerSecond.value.pos;
            const element = track.t.element;
            element.x += spsValue.x * delta;
            element.y += spsValue.y * delta;
        },
        setElementFromKeyFrame(track, keyFrame) {
            const element = track.t.element;
            const kfPos = keyFrame.value.pos;

            if (!track.relative) {
                element.x = kfPos.x;
                element.y = kfPos.y;
                return;
            }

            const prevPos = track.elementPrevState.value.pos;
            element.x = prevPos.x + kfPos.x;
            element.y = prevPos.y + kfPos.y;
        },
        setKeyFrameFromElement(track, keyFrame) {
            const kfValue = keyFrame.value.pos;
            const element = track.t.element;
            kfValue.x = element.x;
            kfValue.y = element.y;
        },
        initKeyFrameStepFrom(track, src, dst) {
            const spsPos = track.currentStepPerSecond.value.pos;
            const dstPos = dst.value.pos;
            const srcPos = src.value.pos;
            spsPos.x = (dstPos.x - srcPos.x) / track.keyFrameTimeLeft;
            spsPos.y = (dstPos.y - srcPos.y) / track.keyFrameTimeLeft;
        },
        configureEase(track, _src, _dst, isEaseIn, isEaseOut) {
            if (!isEaseIn && !isEaseOut) {
                return;
            }

            const spsPos = track.currentStepPerSecond.value.pos;
            const saPos = track.currentStepAcceleration.value.pos;
            spsPos.multiply(2);
            saPos.x = spsPos.x / track.keyFrameTimeLeft;
            saPos.y = spsPos.y / track.keyFrameTimeLeft;
            if (isEaseIn) {
                spsPos.x = 0;
                spsPos.y = 0;
            } else {
                saPos.multiply(-1);
            }
        },
    },
    [TrackType.SCALE]: {
        applyEaseStep(track, _keyFrame, delta) {
            const saScale = track.currentStepAcceleration.value.scale;
            const xScaleDelta = saScale.x * delta;
            const yScaleDelta = saScale.y * delta;
            const spsScale = track.currentStepPerSecond.value.scale;
            const oldScaleX = spsScale.x;
            const oldScaleY = spsScale.y;

            spsScale.x += xScaleDelta;
            spsScale.y += yScaleDelta;

            track.t.element.scaleX += (oldScaleX + xScaleDelta / 2) * delta;
            track.t.element.scaleY += (oldScaleY + yScaleDelta / 2) * delta;
        },
        applyLinearStep(track, delta) {
            const spsScale = track.currentStepPerSecond.value.scale;
            const element = track.t.element;
            element.scaleX += spsScale.x * delta;
            element.scaleY += spsScale.y * delta;
        },
        setElementFromKeyFrame(track, keyFrame) {
            const element = track.t.element;
            const kfScale = keyFrame.value.scale;
            if (!track.relative) {
                element.scaleX = kfScale.x;
                element.scaleY = kfScale.y;
                return;
            }

            const prevScale = track.elementPrevState.value.scale;
            element.scaleX = prevScale.x + kfScale.x;
            element.scaleY = prevScale.y + kfScale.y;
        },
        setKeyFrameFromElement(track, keyFrame) {
            const kfScale = keyFrame.value.scale;
            const element = track.t.element;
            kfScale.x = element.scaleX;
            kfScale.y = element.scaleY;
        },
        initKeyFrameStepFrom(track, src, dst) {
            const spsScale = track.currentStepPerSecond.value.scale;
            const dstScale = dst.value.scale;
            const srcScale = src.value.scale;
            spsScale.x = (dstScale.x - srcScale.x) / track.keyFrameTimeLeft;
            spsScale.y = (dstScale.y - srcScale.y) / track.keyFrameTimeLeft;
        },
        configureEase(track, _src, _dst, isEaseIn, isEaseOut) {
            if (!isEaseIn && !isEaseOut) {
                return;
            }

            const spsScale = track.currentStepPerSecond.value.scale;
            const saScale = track.currentStepAcceleration.value.scale;
            spsScale.multiply(2);
            saScale.x = spsScale.x / track.keyFrameTimeLeft;
            saScale.y = spsScale.y / track.keyFrameTimeLeft;
            if (isEaseIn) {
                spsScale.x = 0;
                spsScale.y = 0;
            } else {
                saScale.multiply(-1);
            }
        },
    },
    [TrackType.ROTATION]: {
        applyEaseStep(track, _keyFrame, delta) {
            const acceleration = track.currentStepAcceleration.value.rotationAngle * delta;
            const current = track.currentStepPerSecond.value.rotationAngle;
            track.currentStepPerSecond.value.rotationAngle += acceleration;
            track.t.element.rotation += (current + acceleration / 2) * delta;
        },
        applyLinearStep(track, delta) {
            const spsRotation = track.currentStepPerSecond.value.rotationAngle;
            track.t.element.rotationAngle += spsRotation * delta;
        },
        setElementFromKeyFrame(track, keyFrame) {
            if (!track.relative) {
                track.t.element.rotation = keyFrame.value.rotationAngle;
                return;
            }

            track.t.element.rotation =
                track.elementPrevState.value.rotationAngle + keyFrame.value.rotationAngle;
        },
        setKeyFrameFromElement(track, keyFrame) {
            keyFrame.value.rotationAngle = track.t.element.rotation;
        },
        initKeyFrameStepFrom(track, src, dst) {
            track.currentStepPerSecond.value.rotationAngle =
                (dst.value.rotationAngle - src.value.rotationAngle) / track.keyFrameTimeLeft;
        },
        configureEase(track, _src, _dst, isEaseIn, isEaseOut) {
            if (!isEaseIn && !isEaseOut) {
                return;
            }

            const sps = track.currentStepPerSecond.value;
            const sa = track.currentStepAcceleration.value;
            sps.rotationAngle *= 2;
            sa.rotationAngle = sps.rotationAngle / track.keyFrameTimeLeft;
            if (isEaseIn) {
                sps.rotationAngle = 0;
            } else {
                sa.rotationAngle *= -1;
            }
        },
    },
    [TrackType.COLOR]: {
        applyEaseStep(track, _keyFrame, delta) {
            const spsColor = track.currentStepPerSecond.value.color;
            const oldColorR = spsColor.r;
            const oldColorG = spsColor.g;
            const oldColorB = spsColor.b;
            const oldColorA = spsColor.a;
            const saColor = track.currentStepAcceleration.value.color;
            const deltaR = saColor.r * delta;
            const deltaG = saColor.g * delta;
            const deltaB = saColor.b * delta;
            const deltaA = saColor.a * delta;

            // NOTE: it looks like there may be a bug in iOS? For now, we'll follow
            // it by adding the delta twice
            spsColor.r += deltaR * 2;
            spsColor.g += deltaG * 2;
            spsColor.b += deltaB * 2;
            spsColor.a += deltaA * 2;

            const elementColor = track.t.element.color;
            elementColor.r += (oldColorR + deltaR / 2) * delta;
            elementColor.g += (oldColorG + deltaG / 2) * delta;
            elementColor.b += (oldColorB + deltaB / 2) * delta;
            elementColor.a += (oldColorA + deltaA / 2) * delta;
        },
        applyLinearStep(track, delta) {
            const spsColor = track.currentStepPerSecond.value.color;
            const elementColor = track.t.element.color;
            elementColor.r += spsColor.r * delta;
            elementColor.g += spsColor.g * delta;
            elementColor.b += spsColor.b * delta;
            elementColor.a += spsColor.a * delta;
        },
        setElementFromKeyFrame(track, keyFrame) {
            const elementColor = track.t.element.color;
            const kfColor = keyFrame.value.color;
            if (!track.relative) {
                elementColor.copyFrom(kfColor);
                return;
            }

            const prevColor = track.elementPrevState.value.color;
            elementColor.r = prevColor.r + kfColor.r;
            elementColor.g = prevColor.g + kfColor.g;
            elementColor.b = prevColor.b + kfColor.b;
            elementColor.a = prevColor.a + kfColor.a;
        },
        setKeyFrameFromElement(track, keyFrame) {
            keyFrame.value.color.copyFrom(track.t.element.color);
        },
        initKeyFrameStepFrom(track, src, dst) {
            const spsColor = track.currentStepPerSecond.value.color;
            const dstColor = dst.value.color;
            const srcColor = src.value.color;
            spsColor.r = (dstColor.r - srcColor.r) / track.keyFrameTimeLeft;
            spsColor.g = (dstColor.g - srcColor.g) / track.keyFrameTimeLeft;
            spsColor.b = (dstColor.b - srcColor.b) / track.keyFrameTimeLeft;
            spsColor.a = (dstColor.a - srcColor.a) / track.keyFrameTimeLeft;
        },
        configureEase(track, _src, _dst, isEaseIn, isEaseOut) {
            if (!isEaseIn && !isEaseOut) {
                return;
            }

            const spsColor = track.currentStepPerSecond.value.color;
            const saColor = track.currentStepAcceleration.value.color;
            spsColor.multiply(2);
            saColor.r = spsColor.r / track.keyFrameTimeLeft;
            saColor.g = spsColor.g / track.keyFrameTimeLeft;
            saColor.b = spsColor.b / track.keyFrameTimeLeft;
            saColor.a = spsColor.a / track.keyFrameTimeLeft;
            if (isEaseIn) {
                spsColor.multiply(0);
            } else {
                saColor.multiply(-1);
            }
        },
    },
};

/**
 * @enum {number}
 */
const TrackState = {
    NOT_ACTIVE: 0,
    ACTIVE: 1,
};

class TimelineTrack {
    /**
     * @param {Timeline} timeline
     * @param {number} trackType
     */
    constructor(timeline, trackType) {
        /**
         * @type {number}
         */
        this.type = trackType;
        /**
         * @type {number}
         */
        this.state = TrackState.NOT_ACTIVE;
        /**
         * @type {boolean}
         */
        this.relative = false;

        /**
         * @type {number}
         */
        this.startTime = 0;
        /**
         * @type {number}
         */
        this.endTime = 0;

        /**
         * @type {KeyFrame[]}
         */
        this.keyFrames = [];

        /**
         * @type {Timeline}
         */
        this.t = timeline;

        /**
         * @type {TrackStrategy | null}
         */
        this.strategy = TRACK_STRATEGIES[trackType] ?? null;

        /**
         * @type {number}
         */
        this.nextKeyFrame = Constants.UNDEFINED;
        /**
         * @type {KeyFrame}
         */
        this.currentStepPerSecond = KeyFrame.newEmpty();
        /**
         * @type {KeyFrame}
         */
        this.currentStepAcceleration = KeyFrame.newEmpty();
        /**
         * @type {KeyFrame}
         */
        this.elementPrevState = KeyFrame.newEmpty();
        /**
         * @type {number}
         */
        this.keyFrameTimeLeft = 0;
        /**
         * @type {number}
         */
        this.overrun = 0;

        /**
         * Array of action sets, where each action set is an array of Action objects
         * Only defined for ACTION track types
         * @type {(Action[])[] | undefined}
         */
        this.actionSets = undefined;

        if (trackType === TrackType.ACTION) {
            this.actionSets = [];
        }
    }

    deactivate() {
        this.state = TrackState.NOT_ACTIVE;
    }

    /**
     * @param {KeyFrame} keyFrame
     */
    addKeyFrame(keyFrame) {
        this.setKeyFrame(keyFrame, this.keyFrames.length);
    }

    /**
     * @param {KeyFrame} keyFrame
     * @param {number} index
     */
    setKeyFrame(keyFrame, index) {
        this.keyFrames[index] = keyFrame;

        if (this.type === TrackType.ACTION && this.actionSets) {
            this.actionSets.push(keyFrame.value.actionSet);
        }
    }

    /**
     * @param {number} frameIndex
     */
    getFrameTime(frameIndex) {
        let total = 0;
        for (let i = 0; i <= frameIndex; i++) {
            total += this.keyFrames[i].timeOffset;
        }
        return total;
    }

    updateRange() {
        this.startTime = this.getFrameTime(0);
        this.endTime = this.getFrameTime(this.keyFrames.length - 1);
    }

    /**
     * @param {number} delta
     */
    updateActionTrack(delta) {
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
    }

    /**
     * @param {number} delta
     */
    updateNonActionTrack(delta) {
        const t = this.t;
        let kf;
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
                    this.initKeyFrameStepFrom(kf, this.keyFrames[this.nextKeyFrame], kf.timeOffset);
                }
            }
            return;
        }

        this.keyFrameTimeLeft -= delta;
        kf = this.keyFrames[this.nextKeyFrame];
        const strategy = this.strategy;
        if (!strategy) {
            return;
        }

        if (
            kf.transitionType === KeyFrame.TransitionType.EASE_IN ||
            kf.transitionType === KeyFrame.TransitionType.EASE_OUT
        ) {
            strategy.applyEaseStep(this, kf, delta);
        } else if (kf.transitionType === KeyFrame.TransitionType.LINEAR) {
            strategy.applyLinearStep(this, delta);
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
                    this.initKeyFrameStepFrom(kf, this.keyFrames[this.nextKeyFrame], kf.timeOffset);
                }
            }
        }
    }

    /**
     * @param {KeyFrame} kf
     * @param {number} time
     */
    initActionKeyFrame(kf, time) {
        this.keyFrameTimeLeft = time;
        this.setElementFromKeyFrame(kf);

        if (this.overrun > 0) {
            this.updateActionTrack(this.overrun);
            this.overrun = 0;
        }
    }

    /**
     * @param {KeyFrame} kf
     */
    setElementFromKeyFrame(kf) {
        if (this.type === TrackType.ACTION) {
            const actionSet = kf.value.actionSet;
            for (let i = 0, len = actionSet.length; i < len; i++) {
                const action = actionSet[i];
                action.actionTarget.handleAction(action.data);
            }
            return;
        }

        this.strategy?.setElementFromKeyFrame(this, kf);
    }

    /**
     * @param {KeyFrame} kf
     */
    setKeyFrameFromElement(kf) {
        if (this.type === TrackType.ACTION) {
            return;
        }

        this.strategy?.setKeyFrameFromElement(this, kf);
    }

    /**
     * @param {KeyFrame} src
     * @param {KeyFrame} dst
     * @param {number} time
     */
    initKeyFrameStepFrom(src, dst, time) {
        this.keyFrameTimeLeft = time;

        this.setKeyFrameFromElement(this.elementPrevState);
        this.setElementFromKeyFrame(src);

        const strategy = this.strategy;
        if (strategy) {
            strategy.initKeyFrameStepFrom(this, src, dst);
            const isEaseIn = dst.transitionType === KeyFrame.TransitionType.EASE_IN;
            const isEaseOut = dst.transitionType === KeyFrame.TransitionType.EASE_OUT;
            strategy.configureEase(this, src, dst, isEaseIn, isEaseOut);
        }

        if (this.overrun > 0) {
            this.updateNonActionTrack(this.overrun);
            this.overrun = 0;
        }
    }
}

export default TimelineTrack;
