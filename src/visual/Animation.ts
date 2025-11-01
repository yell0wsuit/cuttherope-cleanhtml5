import ImageElement from "@/visual/ImageElement";
import Quad2D from "@/core/Quad2D";
import TrackType from "@/visual/TrackType";
import Timeline from "@/visual/Timeline";
import Action from "@/visual/Action";
import ActionType from "@/visual/ActionType";
import KeyFrame from "@/visual/KeyFrame";
import Constants from "@/utils/Constants";

/**
 * Animation element based on timeline
 */
class Animation extends ImageElement {
    constructor() {
        super();
    }

    /**
     * @param {number} delay
     * @param {number} loop
     * @param {number} start
     * @param {number} end
     * @return {number}
     */
    addAnimationDelay(delay: number, loop: number, start: number, end: number): number {
        const index = this.timelines.length;
        this.addAnimationEndpoints(index, delay, loop, start, end);
        return index;
    }

    /**
     * @param {number} delay
     * @param {number} loopType
     * @param {number} count
     * @param {number[]} sequence
     */
    addAnimationWithDelay(delay: number, loopType: number, count: number, sequence: number[]) {
        const index = this.timelines.length;
        this.addAnimationSequence(index, delay, loopType, count, sequence);
    }

    /**
     * @param {number} animationId
     * @param {number} delay
     * @param {number} loopType
     * @param {number} count
     * @param {number[]} sequence
     * @param {number | undefined} [resourceId]
     */
    addAnimationSequence(
        animationId: number,
        delay: number,
        loopType: number,
        count: number,
        sequence: number[],
        resourceId: number | undefined
    ) {
        this.addAnimation(
            animationId,
            delay,
            loopType,
            count,
            sequence[0],
            Constants.UNDEFINED,
            sequence,
            resourceId
        );
    }

    /**
     * @param {number} animationId
     * @param {number} delay
     * @param {number} loopType
     * @param {number} start
     * @param {number} end
     * @param {number[]} [argumentList]
     * @param {number | undefined} [resourceId]
     */
    addAnimationEndpoints(
        animationId: number,
        delay: number,
        loopType: number,
        start: number,
        end: number,
        argumentList: number[],
        resourceId: number | undefined
    ) {
        const count = end - start + 1;

        this.addAnimation(
            animationId,
            delay,
            loopType,
            count,
            start,
            end,
            argumentList,
            resourceId
        );
    }

    /**
     * @param {number} animationId
     * @param {number} delay
     * @param {number} loopType
     * @param {number} count
     * @param {number} start
     * @param {number} end
     * @param {number[] | undefined} argumentList
     * @param {number | undefined} resourceId
     */
    addAnimation(
        animationId: number,
        delay: number,
        loopType: number,
        count: number,
        start: number,
        end: number,
        argumentList: number[] | undefined,
        resourceId: number | undefined
    ) {
        const t = new Timeline();
        let as = [Action.create(this, ActionType.SET_DRAWQUAD, start, 0)];

        t.addKeyFrame(KeyFrame.makeAction(as, 0));

        resourceId = resourceId !== undefined ? resourceId : this.resId;

        let si = start;
        for (let i = 1; i < count; i++) {
            if (argumentList) {
                si = argumentList[i];
            } else {
                si++;
            }

            as = [Action.create(this, ActionType.SET_DRAWQUAD, si, 0)];
            t.addKeyFrame(KeyFrame.makeAction(as, delay));

            if (i == count - 1 && loopType === Timeline.LoopType.REPLAY) {
                t.addKeyFrame(KeyFrame.makeAction(as, delay));
            }
        }

        if (loopType) {
            t.loopType = loopType;
        }

        this.addTimelineWithID(t, animationId);

        t.resourceId = resourceId;
    }

    /**
     * @param {number} delay
     * @param {number} index
     * @param {number} animationId
     */
    setDelay(delay: number, index: number, animationId: number) {
        const timeline = this.getTimeline(animationId);
        const track = timeline.getTrack(TrackType.ACTION);
        if (!track) return;
        const kf = track.keyFrames[index];
        kf.timeOffset = delay;
    }

    /**
     * @param {number} index
     * @param {number} animationId
     */
    setPause(index: number, animationId: number) {
        this.setAction(ActionType.PAUSE_TIMELINE, this, 0, 0, index, animationId);
    }

    /**
     * @param {string} actionName
     * @param {Object} target
     * @param {number} param
     * @param {number} subParam
     * @param {number} index
     * @param {number} animationId
     */
    setAction(
        actionName: string,
        target: object,
        param: number,
        subParam: number,
        index: number,
        animationId: number
    ) {
        const timeline = this.getTimeline(animationId);
        const track = timeline.getTrack(TrackType.ACTION);
        if (!track) return;
        const kf = track.keyFrames[index];
        const action = Action.create(target, actionName, param, subParam);

        kf.value.actionSet.push(action);
    }

    /**
     * @param {number} a2
     * @param {number} a1
     * @param {number} delay
     */
    switchToAnimation(a2: number, a1: number, delay: number) {
        const timeline = this.getTimeline(a1),
            as = [Action.create(this, ActionType.PLAY_TIMELINE, 0, a2)],
            kf = KeyFrame.makeAction(as, delay);
        timeline.addKeyFrame(kf);
    }

    /**
     * Go to the specified sequence frame of the current animation
     * @param {number} index
     */
    jumpTo(index: number) {
        const timeline = this.currentTimeline;
        if (timeline) {
            timeline.jumpToTrack(TrackType.ACTION, index);
        }
    }
}

export default Animation;
