import Bubble from "@/game/Bubble";
import ImageElement from "@/visual/ImageElement";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Alignment from "@/core/Alignment";
import ResourceId from "@/resources/ResourceId";
import MathHelper from "@/utils/MathHelper";
import { getGhostCloudSlice } from "@/game/GhostAssets";
const GhostBubble = Bubble.extend({
    init: function (quadIndex) {
        this._super();
        this.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_ATTACHED);
        this.setTextureQuad(quadIndex);
        this.doRestoreCutTransparency();
        this.setBBFromFirstQuad();
        this.anchor = Alignment.CENTER;
        this.parentAnchor = Alignment.CENTER;
        this.passColorToChilds = true;
    },
    addSupportingCloudsTimelines: function () {
        this.passTransformationsToChilds = true;
        const backCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(4));
        backCloud.anchor = Alignment.CENTER;
        backCloud.parentAnchor = Alignment.CENTER;
        backCloud.x = 28;
        backCloud.y = 8;
        backCloud.doRestoreCutTransparency();
        this.addChild(backCloud);
        const backCloudTimeline = new Timeline();
        backCloudTimeline.loopType = Timeline.LoopType.REPLAY;
        backCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.78, 0.78, KeyFrame.TransitionType.EASE_IN, 0.48)
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.76, 0.76, KeyFrame.TransitionType.EASE_OUT, 0.48)
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.78, 0.78, KeyFrame.TransitionType.EASE_IN, 0.48)
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.EASE_OUT, 0.48)
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makePos(backCloud.x + 1, backCloud.y + 1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makePos(backCloud.x, backCloud.y, KeyFrame.TransitionType.EASE_IN, 0.48)
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makePos(
                backCloud.x - 1,
                backCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.48
            )
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makePos(backCloud.x, backCloud.y, KeyFrame.TransitionType.EASE_IN, 0.48)
        );
        backCloudTimeline.addKeyFrame(
            KeyFrame.makePos(
                backCloud.x + 1,
                backCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.48
            )
        );
        backCloud.addTimelineWithID(backCloudTimeline, 0);
        backCloud.playTimeline(0);
        const backCloud2 = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(3));
        backCloud2.anchor = Alignment.CENTER;
        backCloud2.parentAnchor = Alignment.CENTER;
        backCloud2.x = 22;
        backCloud2.y = 16;
        backCloud2.doRestoreCutTransparency();
        this.addChild(backCloud2);
        const backCloudTimeline2 = new Timeline();
        backCloudTimeline2.loopType = Timeline.LoopType.REPLAY;
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makeScale(0.93, 0.93, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makeScale(0.965, 0.965, KeyFrame.TransitionType.EASE_IN, 0.4)
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_OUT, 0.4)
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makeScale(0.965, 0.965, KeyFrame.TransitionType.EASE_IN, 0.4)
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makeScale(0.93, 0.93, KeyFrame.TransitionType.EASE_OUT, 0.4)
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makePos(
                backCloud2.x + 1,
                backCloud2.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makePos(backCloud2.x, backCloud2.y, KeyFrame.TransitionType.EASE_IN, 0.4)
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makePos(
                backCloud2.x - 1,
                backCloud2.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.4
            )
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makePos(backCloud2.x, backCloud2.y, KeyFrame.TransitionType.EASE_IN, 0.4)
        );
        backCloudTimeline2.addKeyFrame(
            KeyFrame.makePos(
                backCloud2.x + 1,
                backCloud2.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.4
            )
        );
        backCloud2.addTimelineWithID(backCloudTimeline2, 0);
        backCloud2.playTimeline(0);
        const backCloud3 = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(3));
        backCloud3.anchor = Alignment.CENTER;
        backCloud3.parentAnchor = Alignment.CENTER;
        backCloud3.x = -28;
        backCloud3.y = 5;
        backCloud3.doRestoreCutTransparency();
        this.addChild(backCloud3);
        const backCloudTimeline3 = new Timeline();
        backCloudTimeline3.loopType = Timeline.LoopType.REPLAY;
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makeScale(0.33, 0.33, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makeScale(0.365, 0.365, KeyFrame.TransitionType.EASE_IN, 0.43)
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makeScale(0.4, 0.4, KeyFrame.TransitionType.EASE_OUT, 0.43)
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makeScale(0.365, 0.365, KeyFrame.TransitionType.EASE_IN, 0.43)
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makeScale(0.33, 0.33, KeyFrame.TransitionType.EASE_OUT, 0.43)
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makePos(
                backCloud3.x + 1,
                backCloud3.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makePos(backCloud3.x, backCloud3.y, KeyFrame.TransitionType.EASE_IN, 0.43)
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makePos(
                backCloud3.x - 1,
                backCloud3.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.43
            )
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makePos(backCloud3.x, backCloud3.y, KeyFrame.TransitionType.EASE_IN, 0.43)
        );
        backCloudTimeline3.addKeyFrame(
            KeyFrame.makePos(
                backCloud3.x + 1,
                backCloud3.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.43
            )
        );
        backCloud3.addTimelineWithID(backCloudTimeline3, 0);
        backCloud3.playTimeline(0);
        const frontCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(4));
        frontCloud.anchor = Alignment.CENTER;
        frontCloud.parentAnchor = Alignment.CENTER;
        frontCloud.x = -23;
        frontCloud.y = 16;
        frontCloud.doRestoreCutTransparency();
        this.addChild(frontCloud);
        const frontCloudTimeline = new Timeline();
        frontCloudTimeline.loopType = Timeline.LoopType.REPLAY;
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.6, 0.6, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.565, 0.565, KeyFrame.TransitionType.EASE_IN, 0.42)
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.53, 0.53, KeyFrame.TransitionType.EASE_OUT, 0.42)
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.565, 0.565, KeyFrame.TransitionType.EASE_IN, 0.42)
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makeScale(0.6, 0.6, KeyFrame.TransitionType.EASE_OUT, 0.42)
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x - 1,
                frontCloud.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makePos(frontCloud.x, frontCloud.y, KeyFrame.TransitionType.EASE_IN, 0.42)
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x + 1,
                frontCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.42
            )
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makePos(frontCloud.x, frontCloud.y, KeyFrame.TransitionType.EASE_IN, 0.42)
        );
        frontCloudTimeline.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x - 1,
                frontCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.42
            )
        );
        frontCloud.addTimelineWithID(frontCloudTimeline, 0);
        frontCloud.playTimeline(0);
        const frontRing = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(0));
        frontRing.anchor = Alignment.CENTER;
        frontRing.parentAnchor = Alignment.CENTER;
        frontRing.x = -5;
        frontRing.y = 25;
        frontRing.doRestoreCutTransparency();
        this.addChild(frontRing);
        const frontRingTimeline = new Timeline();
        frontRingTimeline.loopType = Timeline.LoopType.REPLAY;
        frontRingTimeline.addKeyFrame(
            KeyFrame.makeScale(0.93, 0.93, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makeScale(0.965, 0.965, KeyFrame.TransitionType.EASE_IN, 0.47)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_OUT, 0.47)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makeScale(0.965, 0.965, KeyFrame.TransitionType.EASE_IN, 0.47)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makeScale(0.93, 0.93, KeyFrame.TransitionType.EASE_OUT, 0.47)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makePos(frontRing.x + 1, frontRing.y - 1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makePos(frontRing.x, frontRing.y, KeyFrame.TransitionType.EASE_IN, 0.47)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makePos(
                frontRing.x - 1,
                frontRing.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.47
            )
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makePos(frontRing.x, frontRing.y, KeyFrame.TransitionType.EASE_IN, 0.47)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makePos(
                frontRing.x + 1,
                frontRing.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.47
            )
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makeRotation(350, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makeRotation(350, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        frontRingTimeline.addKeyFrame(
            KeyFrame.makeRotation(350, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        frontRing.addTimelineWithID(frontRingTimeline, 0);
        frontRing.playTimeline(0);
    },
});
GhostBubble.createRandom = function () {
    const quadIndex = MathHelper.randomRange(0, 3);
    const bubble = new GhostBubble(quadIndex);
    return bubble;
};
export default GhostBubble;
