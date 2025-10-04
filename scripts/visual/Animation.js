define("visual/Animation", [
  "visual/ImageElement",
  "core/Quad2D",
  "visual/TrackType",
  "visual/Timeline",
  "visual/Action",
  "visual/ActionType",
  "visual/KeyFrame",
  "utils/Constants",
], function (
  ImageElement,
  Quad2D,
  TrackType,
  Timeline,
  Action,
  ActionType,
  KeyFrame,
  Constants,
) {
  /**
   * Animation element based on timeline
   */
  var Animation = ImageElement.extend({
    init: function () {
      this._super();
    },
    /**
     * @param delay {number}
     * @param loop {number}
     * @param start {number}
     * @param end {number}
     * @return {number}
     */
    addAnimationDelay: function (delay, loop, start, end) {
      var index = this.timelines.length;
      this.addAnimationEndpoints(index, delay, loop, start, end);
      return index;
    },
    addAnimationWithDelay: function (delay, loopType, count, sequence) {
      var index = this.timelines.length;
      this.addAnimationSequence(index, delay, loopType, count, sequence);
    },
    addAnimationSequence: function (
      animationId,
      delay,
      loopType,
      count,
      sequence,
    ) {
      this.addAnimation(
        animationId,
        delay,
        loopType,
        count,
        sequence[0],
        Constants.UNDEFINED,
        sequence,
      );
    },
    addAnimationEndpoints: function (
      animationId,
      delay,
      loopType,
      start,
      end,
      argumentList,
    ) {
      var count = end - start + 1;
      this.addAnimation(
        animationId,
        delay,
        loopType,
        count,
        start,
        end,
        argumentList,
      );
    },
    /**
     * @param animationId {number}
     * @param delay {number}
     * @param loopType
     * @param count {number}
     * @param start {number}
     * @param end {number}
     * @param argumentList
     */
    addAnimation: function (
      animationId,
      delay,
      loopType,
      count,
      start,
      end,
      argumentList,
    ) {
      var t = new Timeline(),
        as = [Action.create(this, ActionType.SET_DRAWQUAD, start, 0)];

      t.addKeyFrame(KeyFrame.makeAction(as, 0));

      var si = start;
      for (var i = 1; i < count; i++) {
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
    },
    setDelay: function (delay, index, animationId) {
      var timeline = this.getTimeline(animationId),
        track = timeline.getTrack(TrackType.ACTION),
        kf = track.keyFrames[index];
      kf.timeOffset = delay;
    },
    setPause: function (index, animationId) {
      this.setAction(ActionType.PAUSE_TIMELINE, this, 0, 0, index, animationId);
    },
    setAction: function (
      actionName,
      target,
      param,
      subParam,
      index,
      animationId,
    ) {
      var timeline = this.getTimeline(animationId),
        track = timeline.getTrack(TrackType.ACTION),
        kf = track.keyFrames[index],
        action = Action.create(target, actionName, param, subParam);

      kf.value.actionSet.push(action);
    },
    switchToAnimation: function (a2, a1, delay) {
      var timeline = this.getTimeline(a1),
        as = [Action.create(this, ActionType.PLAY_TIMELINE, 0, a2)],
        kf = KeyFrame.makeAction(as, delay);
      timeline.addKeyFrame(kf);
    },
    /**
     * Go to the specified sequence frame of the current animation
     * @param index {number}
     */
    jumpTo: function (index) {
      var timeline = this.currentTimeline;
      timeline.jumpToTrack(TrackType.ACTION, index);
    },
  });

  return Animation;
});
