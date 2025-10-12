import Grab from "@/game/Grab";
import ImageElement from "@/visual/ImageElement";
import Alignment from "@/core/Alignment";
import ResourceId from "@/resources/ResourceId";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
const GhostGrab = Grab.extend({
    init: function (x, y) {
        this._super();
        this.x = x;
        this.y = y;
        this.addSupportingClouds();
    },
    addSupportingClouds: function () {
        const leftCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, 3);
        leftCloud.anchor = leftCloud.parentAnchor = Alignment.CENTER;
        leftCloud.doRestoreCutTransparency();
        leftCloud.x = this.x - 20;
        leftCloud.y = this.y + 2;
        this.addChild(leftCloud);
        const timeline = new Timeline();
        timeline.loopType = Timeline.LoopType.REPLAY;
        timeline.addKeyFrame(KeyFrame.makeScale(0.43, 0.43, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline.addKeyFrame(
            KeyFrame.makeScale(0.465, 0.465, KeyFrame.TransitionType.EASE_IN, 0.65)
        );
        timeline.addKeyFrame(KeyFrame.makeScale(0.5, 0.5, KeyFrame.TransitionType.EASE_OUT, 0.65));
        timeline.addKeyFrame(
            KeyFrame.makeScale(0.465, 0.465, KeyFrame.TransitionType.EASE_IN, 0.65)
        );
        timeline.addKeyFrame(
            KeyFrame.makeScale(0.43, 0.43, KeyFrame.TransitionType.EASE_OUT, 0.65)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(leftCloud.x - 1, leftCloud.y + 1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(leftCloud.x, leftCloud.y, KeyFrame.TransitionType.EASE_IN, 0.65)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                leftCloud.x + 1,
                leftCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.65
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(leftCloud.x, leftCloud.y, KeyFrame.TransitionType.EASE_IN, 0.65)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                leftCloud.x - 1,
                leftCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.65
            )
        );
        leftCloud.addTimelineWithID(timeline, 0);
        leftCloud.playTimeline(0);
        const rightCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, 4);
        rightCloud.anchor = rightCloud.parentAnchor = Alignment.CENTER;
        rightCloud.doRestoreCutTransparency();
        rightCloud.x = this.x + 18;
        rightCloud.y = this.y + 8;
        this.addChild(rightCloud);
        const timeline2 = new Timeline();
        timeline2.loopType = Timeline.LoopType.REPLAY;
        timeline2.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline2.addKeyFrame(KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.EASE_IN, 0.45));
        timeline2.addKeyFrame(KeyFrame.makeScale(0.7, 0.7, KeyFrame.TransitionType.EASE_OUT, 0.45));
        timeline2.addKeyFrame(KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.EASE_IN, 0.45));
        timeline2.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.EASE_OUT, 0.45));
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                rightCloud.x + 1,
                rightCloud.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(rightCloud.x, rightCloud.y, KeyFrame.TransitionType.EASE_IN, 0.45)
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                rightCloud.x - 1,
                rightCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.45
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(rightCloud.x, rightCloud.y, KeyFrame.TransitionType.EASE_IN, 0.45)
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                rightCloud.x + 1,
                rightCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.45
            )
        );
        rightCloud.addTimelineWithID(timeline2, 0);
        rightCloud.playTimeline(0);
        const centerCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, 5);
        centerCloud.anchor = centerCloud.parentAnchor = Alignment.CENTER;
        centerCloud.doRestoreCutTransparency();
        centerCloud.x = this.x - 5;
        centerCloud.y = this.y + 15;
        this.addChild(centerCloud);
        const timeline3 = new Timeline();
        timeline3.loopType = Timeline.LoopType.REPLAY;
        timeline3.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline3.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, 0.5));
        timeline3.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.EASE_OUT, 0.5));
        timeline3.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, 0.5));
        timeline3.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.EASE_OUT, 0.5));
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                centerCloud.x - 1,
                centerCloud.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(centerCloud.x, centerCloud.y, KeyFrame.TransitionType.EASE_IN, 0.5)
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                centerCloud.x + 1,
                centerCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.5
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(centerCloud.x, centerCloud.y, KeyFrame.TransitionType.EASE_IN, 0.5)
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                centerCloud.x - 1,
                centerCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.5
            )
        );
        centerCloud.addTimelineWithID(timeline3, 0);
        centerCloud.playTimeline(0);
    },
    drawBack: function () {},
});
export default GhostGrab;
