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
    addAnimationDelay(delay, loop, start, end) {
        const index = this.timelines.length;
        this.addAnimationEndpoints(index, delay, loop, start, end);
        return index;
    }

    addAnimationWithDelay(delay, loopType, count, sequence) {
        const index = this.timelines.length;
        this.addAnimationSequence(index, delay, loopType, count, sequence);
    }

    addAnimationSequence(animationId, delay, loopType, count, sequence, resourceId) {
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

    addAnimationEndpoints(animationId, delay, loopType, start, end, argumentList, resourceId) {
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
     * @param loopType
     * @param {number} count
     * @param {number} start
     * @param {number} end
     * @param argumentList
     */
    addAnimation(animationId, delay, loopType, count, start, end, argumentList, resourceId) {
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

            if (i == count - 1 && loopType === Timeline.StateType.REPLAY) {
                t.addKeyFrame(KeyFrame.makeAction(as, delay));
            }
        }

        if (loopType) {
            t.loopType = loopType;
        }

        this.addTimelineWithID(t, animationId);

        t.resourceId = resourceId;
    }

    setDelay(delay, index, animationId) {
        const timeline = this.getTimeline(animationId),
            track = timeline.getTrack(TrackType.ACTION),
            kf = track.keyFrames[index];
        kf.timeOffset = delay;
    }

    setPause(index, animationId) {
        this.setAction(ActionType.PAUSE_TIMELINE, this, 0, 0, index, animationId);
    }

    setAction(actionName, target, param, subParam, index, animationId) {
        const timeline = this.getTimeline(animationId),
            track = timeline.getTrack(TrackType.ACTION),
            kf = track.keyFrames[index],
            action = Action.create(target, actionName, param, subParam);

        kf.value.actionSet.push(action);
    }

    switchToAnimation(a2, a1, delay) {
        const timeline = this.getTimeline(a1),
            as = [Action.create(this, ActionType.PLAY_TIMELINE, 0, a2)],
            kf = KeyFrame.makeAction(as, delay);
        timeline.addKeyFrame(kf);
    }

    /**
     * Go to the specified sequence frame of the current animation
     * @param {number} index
     */
    jumpTo(index) {
        const timeline = this.currentTimeline;
        timeline.jumpToTrack(TrackType.ACTION, index);
    }
}

export default Animation;
