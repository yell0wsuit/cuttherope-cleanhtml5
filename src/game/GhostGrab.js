import Grab from "@/game/Grab";
import ImageElement from "@/visual/ImageElement";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Alignment from "@/core/Alignment";
import ResourceId from "@/resources/ResourceId";
import { getGhostCloudSlice } from "@/game/GhostAssets";
const GhostGrab = Grab.extend({
    init: function (px, py) {
        this._super();
        this.x = px;
        this.y = py;
        this.anchor = Alignment.CENTER;
        this.passColorToChilds = true;
        const leftCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(3));
        leftCloud.anchor = Alignment.CENTER;
        leftCloud.parentAnchor = Alignment.CENTER;
        leftCloud.x = -20;
        leftCloud.y = 2;
        leftCloud.doRestoreCutTransparency();
        this.addChild(leftCloud);
        const leftTimeline = new Timeline();
        leftTimeline.loopType = Timeline.LoopType.REPLAY;
        leftTimeline.addKeyFrame(
            KeyFrame.makeScale(0.43, 0.43, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makeScale(0.465, 0.465, KeyFrame.TransitionType.EASE_IN, 0.65)
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makeScale(0.5, 0.5, KeyFrame.TransitionType.EASE_OUT, 0.65)
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makeScale(0.465, 0.465, KeyFrame.TransitionType.EASE_IN, 0.65)
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makeScale(0.43, 0.43, KeyFrame.TransitionType.EASE_OUT, 0.65)
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makePos(leftCloud.x - 1, leftCloud.y + 1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makePos(leftCloud.x, leftCloud.y, KeyFrame.TransitionType.EASE_IN, 0.65)
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makePos(
                leftCloud.x + 1,
                leftCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.65
            )
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makePos(leftCloud.x, leftCloud.y, KeyFrame.TransitionType.EASE_IN, 0.65)
        );
        leftTimeline.addKeyFrame(
            KeyFrame.makePos(
                leftCloud.x - 1,
                leftCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.65
            )
        );
        leftCloud.addTimelineWithID(leftTimeline, 0);
        leftCloud.playTimeline(0);
        const rightCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(2));
        rightCloud.anchor = Alignment.CENTER;
        rightCloud.parentAnchor = Alignment.CENTER;
        rightCloud.x = 18;
        rightCloud.y = 8;
        rightCloud.doRestoreCutTransparency();
        this.addChild(rightCloud);
        const rightTimeline = new Timeline();
        rightTimeline.loopType = Timeline.LoopType.REPLAY;
        rightTimeline.addKeyFrame(
            KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.EASE_IN, 0.45)
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makeScale(0.7, 0.7, KeyFrame.TransitionType.EASE_OUT, 0.45)
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.EASE_IN, 0.45)
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.EASE_OUT, 0.45)
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makePos(
                rightCloud.x + 1,
                rightCloud.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makePos(rightCloud.x, rightCloud.y, KeyFrame.TransitionType.EASE_IN, 0.45)
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makePos(
                rightCloud.x - 1,
                rightCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.45
            )
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makePos(rightCloud.x, rightCloud.y, KeyFrame.TransitionType.EASE_IN, 0.45)
        );
        rightTimeline.addKeyFrame(
            KeyFrame.makePos(
                rightCloud.x + 1,
                rightCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.45
            )
        );
        rightCloud.addTimelineWithID(rightTimeline, 0);
        rightCloud.playTimeline(0);
        const frontCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(0));
        frontCloud.anchor = Alignment.CENTER;
        frontCloud.parentAnchor = Alignment.CENTER;
        frontCloud.x = -5;
        frontCloud.y = 15;
        frontCloud.doRestoreCutTransparency();
        this.addChild(frontCloud);
        const frontTimeline = new Timeline();
        frontTimeline.loopType = Timeline.LoopType.REPLAY;
        frontTimeline.addKeyFrame(
            KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        frontTimeline.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, 0.5));
        frontTimeline.addKeyFrame(
            KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.EASE_OUT, 0.5)
        );
        frontTimeline.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, 0.5));
        frontTimeline.addKeyFrame(
            KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.EASE_OUT, 0.5)
        );
        frontTimeline.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x - 1,
                frontCloud.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        frontTimeline.addKeyFrame(
            KeyFrame.makePos(frontCloud.x, frontCloud.y, KeyFrame.TransitionType.EASE_IN, 0.5)
        );
        frontTimeline.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x + 1,
                frontCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.5
            )
        );
        frontTimeline.addKeyFrame(
            KeyFrame.makePos(frontCloud.x, frontCloud.y, KeyFrame.TransitionType.EASE_IN, 0.5)
        );
        frontTimeline.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x - 1,
                frontCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.5
            )
        );
        frontCloud.addTimelineWithID(frontTimeline, 0);
        frontCloud.playTimeline(0);
    },
});
export default GhostGrab;
