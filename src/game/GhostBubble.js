import Bubble from "@/game/Bubble";
import Alignment from "@/core/Alignment";
import ImageElement from "@/visual/ImageElement";
import ResourceId from "@/resources/ResourceId";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Rectangle from "@/core/Rectangle";
const SUPPORTING_CLOUD_LARGE = 1;
const SUPPORTING_CLOUD_SMALL = 6;
const SUPPORTING_CLOUD_ROTATING = 4;
const GhostBubble = Bubble.extend({
    init: function (x, y, quadIndex) {
        this._super();
        this.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_ATTACHED);
        this.anchor = Alignment.CENTER;
        this.doRestoreCutTransparency();
        this.setTextureQuad(quadIndex);
        this.x = x;
        this.y = y;
        this.bb = new Rectangle(-28, -28, 56, 56);
        this.popped = false;
        this.addSupportingClouds();
    },
    addSupportingClouds: function () {
        this.passColorToChilds = true;
        const backCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, SUPPORTING_CLOUD_LARGE);
        backCloud.anchor = backCloud.parentAnchor = Alignment.CENTER;
        backCloud.doRestoreCutTransparency();
        backCloud.x = this.x + 28;
        backCloud.y = this.y + 8;
        this.addChild(backCloud);
        const timeline = new Timeline();
        timeline.loopType = Timeline.LoopType.REPLAY;
        timeline.addKeyFrame(KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline.addKeyFrame(KeyFrame.makeScale(0.78, 0.78, KeyFrame.TransitionType.EASE_IN, 0.48));
        timeline.addKeyFrame(
            KeyFrame.makeScale(0.76, 0.76, KeyFrame.TransitionType.EASE_OUT, 0.48)
        );
        timeline.addKeyFrame(KeyFrame.makeScale(0.78, 0.78, KeyFrame.TransitionType.EASE_IN, 0.48));
        timeline.addKeyFrame(KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.EASE_OUT, 0.48));
        timeline.addKeyFrame(
            KeyFrame.makePos(backCloud.x + 1, backCloud.y + 1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(backCloud.x, backCloud.y, KeyFrame.TransitionType.EASE_IN, 0.48)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                backCloud.x - 1,
                backCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.48
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(backCloud.x, backCloud.y, KeyFrame.TransitionType.EASE_IN, 0.48)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                backCloud.x + 1,
                backCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.48
            )
        );
        backCloud.addTimelineWithID(timeline, 0);
        backCloud.playTimeline(0);
        const backCloud2 = ImageElement.create(ResourceId.IMG_OBJ_GHOST, SUPPORTING_CLOUD_SMALL);
        backCloud2.anchor = backCloud2.parentAnchor = Alignment.CENTER;
        backCloud2.doRestoreCutTransparency();
        backCloud2.x = this.x + 22;
        backCloud2.y = this.y + 16;
        this.addChild(backCloud2);
        const timeline2 = new Timeline();
        timeline2.loopType = Timeline.LoopType.REPLAY;
        timeline2.addKeyFrame(KeyFrame.makeScale(0.93, 0.93, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline2.addKeyFrame(
            KeyFrame.makeScale(0.965, 0.965, KeyFrame.TransitionType.EASE_IN, 0.4)
        );
        timeline2.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_OUT, 0.4));
        timeline2.addKeyFrame(
            KeyFrame.makeScale(0.965, 0.965, KeyFrame.TransitionType.EASE_IN, 0.4)
        );
        timeline2.addKeyFrame(
            KeyFrame.makeScale(0.93, 0.93, KeyFrame.TransitionType.EASE_OUT, 0.4)
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                backCloud2.x + 1,
                backCloud2.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(backCloud2.x, backCloud2.y, KeyFrame.TransitionType.EASE_IN, 0.4)
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                backCloud2.x - 1,
                backCloud2.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.4
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(backCloud2.x, backCloud2.y, KeyFrame.TransitionType.EASE_IN, 0.4)
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                backCloud2.x + 1,
                backCloud2.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.4
            )
        );
        backCloud2.addTimelineWithID(timeline2, 0);
        backCloud2.playTimeline(0);
        const backCloud3 = ImageElement.create(ResourceId.IMG_OBJ_GHOST, SUPPORTING_CLOUD_SMALL);
        backCloud3.anchor = backCloud3.parentAnchor = Alignment.CENTER;
        backCloud3.doRestoreCutTransparency();
        backCloud3.x = this.x - 28;
        backCloud3.y = this.y + 5;
        this.addChild(backCloud3);
        const timeline3 = new Timeline();
        timeline3.loopType = Timeline.LoopType.REPLAY;
        timeline3.addKeyFrame(KeyFrame.makeScale(0.33, 0.33, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline3.addKeyFrame(
            KeyFrame.makeScale(0.365, 0.365, KeyFrame.TransitionType.EASE_IN, 0.43)
        );
        timeline3.addKeyFrame(KeyFrame.makeScale(0.4, 0.4, KeyFrame.TransitionType.EASE_OUT, 0.43));
        timeline3.addKeyFrame(
            KeyFrame.makeScale(0.365, 0.365, KeyFrame.TransitionType.EASE_IN, 0.43)
        );
        timeline3.addKeyFrame(
            KeyFrame.makeScale(0.33, 0.33, KeyFrame.TransitionType.EASE_OUT, 0.43)
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                backCloud3.x + 1,
                backCloud3.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(backCloud3.x, backCloud3.y, KeyFrame.TransitionType.EASE_IN, 0.43)
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                backCloud3.x - 1,
                backCloud3.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.43
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(backCloud3.x, backCloud3.y, KeyFrame.TransitionType.EASE_IN, 0.43)
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                backCloud3.x + 1,
                backCloud3.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.43
            )
        );
        backCloud3.addTimelineWithID(timeline3, 0);
        backCloud3.playTimeline(0);
        const frontCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, SUPPORTING_CLOUD_LARGE);
        frontCloud.anchor = frontCloud.parentAnchor = Alignment.CENTER;
        frontCloud.doRestoreCutTransparency();
        frontCloud.x = this.x - 23;
        frontCloud.y = this.y + 16;
        this.addChild(frontCloud);
        const timeline4 = new Timeline();
        timeline4.loopType = Timeline.LoopType.REPLAY;
        timeline4.addKeyFrame(KeyFrame.makeScale(0.6, 0.6, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline4.addKeyFrame(
            KeyFrame.makeScale(0.565, 0.565, KeyFrame.TransitionType.EASE_IN, 0.42)
        );
        timeline4.addKeyFrame(
            KeyFrame.makeScale(0.53, 0.53, KeyFrame.TransitionType.EASE_OUT, 0.42)
        );
        timeline4.addKeyFrame(
            KeyFrame.makeScale(0.565, 0.565, KeyFrame.TransitionType.EASE_IN, 0.42)
        );
        timeline4.addKeyFrame(KeyFrame.makeScale(0.6, 0.6, KeyFrame.TransitionType.EASE_OUT, 0.42));
        timeline4.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x - 1,
                frontCloud.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline4.addKeyFrame(
            KeyFrame.makePos(frontCloud.x, frontCloud.y, KeyFrame.TransitionType.EASE_IN, 0.42)
        );
        timeline4.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x + 1,
                frontCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.42
            )
        );
        timeline4.addKeyFrame(
            KeyFrame.makePos(frontCloud.x, frontCloud.y, KeyFrame.TransitionType.EASE_IN, 0.42)
        );
        timeline4.addKeyFrame(
            KeyFrame.makePos(
                frontCloud.x - 1,
                frontCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.42
            )
        );
        frontCloud.addTimelineWithID(timeline4, 0);
        frontCloud.playTimeline(0);
        const frontCloud2 = ImageElement.create(
            ResourceId.IMG_OBJ_GHOST,
            SUPPORTING_CLOUD_ROTATING
        );
        frontCloud2.anchor = frontCloud2.parentAnchor = Alignment.CENTER;
        frontCloud2.doRestoreCutTransparency();
        frontCloud2.x = this.x - 5;
        frontCloud2.y = this.y + 25;
        this.addChild(frontCloud2);
        const timeline5 = new Timeline();
        timeline5.loopType = Timeline.LoopType.REPLAY;
        timeline5.addKeyFrame(KeyFrame.makeScale(0.93, 0.93, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline5.addKeyFrame(
            KeyFrame.makeScale(0.965, 0.965, KeyFrame.TransitionType.EASE_IN, 0.47)
        );
        timeline5.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_OUT, 0.47));
        timeline5.addKeyFrame(
            KeyFrame.makeScale(0.965, 0.965, KeyFrame.TransitionType.EASE_IN, 0.47)
        );
        timeline5.addKeyFrame(
            KeyFrame.makeScale(0.93, 0.93, KeyFrame.TransitionType.EASE_OUT, 0.47)
        );
        timeline5.addKeyFrame(
            KeyFrame.makePos(
                frontCloud2.x + 1,
                frontCloud2.y - 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline5.addKeyFrame(
            KeyFrame.makePos(frontCloud2.x, frontCloud2.y, KeyFrame.TransitionType.EASE_IN, 0.47)
        );
        timeline5.addKeyFrame(
            KeyFrame.makePos(
                frontCloud2.x - 1,
                frontCloud2.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.47
            )
        );
        timeline5.addKeyFrame(
            KeyFrame.makePos(frontCloud2.x, frontCloud2.y, KeyFrame.TransitionType.EASE_IN, 0.47)
        );
        timeline5.addKeyFrame(
            KeyFrame.makePos(
                frontCloud2.x + 1,
                frontCloud2.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.47
            )
        );
        timeline5.addKeyFrame(KeyFrame.makeRotation(350, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline5.addKeyFrame(KeyFrame.makeRotation(350, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline5.addKeyFrame(KeyFrame.makeRotation(350, KeyFrame.TransitionType.IMMEDIATE, 0));
        frontCloud2.addTimelineWithID(timeline5, 0);
        frontCloud2.playTimeline(0);
    },
});
export default GhostBubble;
