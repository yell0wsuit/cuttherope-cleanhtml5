import Bubble from "@/game/Bubble";
import Alignment from "@/core/Alignment";
import ImageElement from "@/visual/ImageElement";
import ResourceId from "@/resources/ResourceId";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Rectangle from "@/core/Rectangle";
import BaseElement from "@/visual/BaseElement";
import Canvas from "@/utils/Canvas";

const SUPPORTING_CLOUD_RIGHT = 4;
const SUPPORTING_CLOUD_LEFT = 5;
const TRANSFORM_CLOUD_START = 1;
const TRANSFORM_CLOUD_END = 3;
const BUBBLE_BASE_FRAME = 0;

const GhostBubble = Bubble.extend({
    init: function (x, y, quadIndex) {
        this._super();
        this.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_ATTACHED);
        this.anchor = Alignment.CENTER;
        this.doRestoreCutTransparency();
        this.setTextureQuad(BUBBLE_BASE_FRAME);

        const stainFrame =
            quadIndex === undefined || quadIndex === BUBBLE_BASE_FRAME
                ? TRANSFORM_CLOUD_START
                : quadIndex;

        this.stain = ImageElement.create(ResourceId.IMG_OBJ_BUBBLE_ATTACHED, stainFrame);
        this.stain.anchor = this.stain.parentAnchor = Alignment.CENTER;
        this.stain.doRestoreCutTransparency();

        this.x = x;
        this.y = y;
        this.bb = new Rectangle(-28, -28, 56, 56);
        this.popped = false;
        this.withoutShadow = false;

        this.addChild(this.stain);
        this.addSupportingClouds();
    },

    draw: function () {
        if (this.popped) {
            // When popped, don't draw anything at all
            return;
        }

        this.preDraw();

        if (!this.withoutShadow) {
            if (this.quadToDraw === -1) {
                // Draw the full texture
                this.drawImage();
            } else {
                // Draw specific quad
                this.drawQuad(this.quadToDraw);
            }
        }

        this.postDraw();
    },

    addSupportingClouds: function () {
        this.passTransformationsToChilds = true;

        // Back Cloud (Right)
        this.backCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, SUPPORTING_CLOUD_RIGHT);
        this.backCloud.anchor = this.backCloud.parentAnchor = Alignment.CENTER;
        this.backCloud.doRestoreCutTransparency();
        this.backCloud.x = this.x + 28;
        this.backCloud.y = this.y + 8;
        this.addChild(this.backCloud);

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
            KeyFrame.makePos(
                this.backCloud.x + 1,
                this.backCloud.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x,
                this.backCloud.y,
                KeyFrame.TransitionType.EASE_IN,
                0.48
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x - 1,
                this.backCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.48
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x,
                this.backCloud.y,
                KeyFrame.TransitionType.EASE_IN,
                0.48
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x + 1,
                this.backCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.48
            )
        );
        this.backCloud.addTimelineWithID(timeline, 0);
        this.backCloud.playTimeline(0);

        // Back Cloud 2
        this.backCloud2 = ImageElement.create(ResourceId.IMG_OBJ_GHOST, TRANSFORM_CLOUD_END);
        this.backCloud2.anchor = this.backCloud2.parentAnchor = Alignment.CENTER;
        this.backCloud2.doRestoreCutTransparency();
        this.backCloud2.x = this.x + 22;
        this.backCloud2.y = this.y + 16;
        this.addChild(this.backCloud2);

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
                this.backCloud2.x + 1,
                this.backCloud2.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x,
                this.backCloud2.y,
                KeyFrame.TransitionType.EASE_IN,
                0.4
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x - 1,
                this.backCloud2.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.4
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x,
                this.backCloud2.y,
                KeyFrame.TransitionType.EASE_IN,
                0.4
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x + 1,
                this.backCloud2.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.4
            )
        );
        this.backCloud2.addTimelineWithID(timeline2, 0);
        this.backCloud2.playTimeline(0);

        // Back Cloud 3
        this.backCloud3 = ImageElement.create(ResourceId.IMG_OBJ_GHOST, TRANSFORM_CLOUD_END);
        this.backCloud3.anchor = this.backCloud3.parentAnchor = Alignment.CENTER;
        this.backCloud3.doRestoreCutTransparency();
        this.backCloud3.x = this.x - 28;
        this.backCloud3.y = this.y + 5;
        this.addChild(this.backCloud3);

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
                this.backCloud3.x + 1,
                this.backCloud3.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud3.x,
                this.backCloud3.y,
                KeyFrame.TransitionType.EASE_IN,
                0.43
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud3.x - 1,
                this.backCloud3.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.43
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud3.x,
                this.backCloud3.y,
                KeyFrame.TransitionType.EASE_IN,
                0.43
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud3.x + 1,
                this.backCloud3.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.43
            )
        );
        this.backCloud3.addTimelineWithID(timeline3, 0);
        this.backCloud3.playTimeline(0);

        // Front Cloud (Left)
        const frontCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, SUPPORTING_CLOUD_LEFT);
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

        // Front Cloud 2
        const frontCloud2 = ImageElement.create(ResourceId.IMG_OBJ_GHOST, TRANSFORM_CLOUD_START);
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

    dealloc: function () {
        this.backCloud = null;
        this.backCloud2 = null;
        this.backCloud3 = null;
        this._super();
    },
});

export default GhostBubble;
