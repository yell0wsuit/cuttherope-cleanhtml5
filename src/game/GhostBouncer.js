import Bouncer from "@/game/Bouncer";
import ImageElement from "@/visual/ImageElement";
import ResourceId from "@/resources/ResourceId";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Alignment from "@/core/Alignment";
import RGBAColor from "@/core/RGBAColor";
const DEG_TO_RAD = Math.PI / 180;
const BACK_CLOUD_FRAME = 1;
const FRONT_CLOUD_LEFT_FRAME = 5;
const FRONT_CLOUD_RIGHT_FRAME = 4;
const GhostBouncer = Bouncer.extend({
    init: function (x, y, width, angle) {
        this._super(x, y, width, angle);
        this.addSupportingClouds(angle);
    },
    addSupportingClouds: function (angle) {
        const radius = Math.sqrt(925);
        const offsetAngle = angle || 0;
        this.backCloud2 = ImageElement.create(ResourceId.IMG_OBJ_GHOST, BACK_CLOUD_FRAME);
        this.backCloud2.doRestoreCutTransparency();
        this.backCloud2.anchor = this.backCloud2.parentAnchor = Alignment.CENTER;
        const angle2 = (170 + offsetAngle) * DEG_TO_RAD;
        this.backCloud2.x = Math.cos(angle2);
        this.backCloud2.y = Math.sin(angle2);
        this.backCloud2.visible = true;
        this.addChild(this.backCloud2);
        const timeline = new Timeline();
        timeline.loopType = Timeline.LoopType.REPLAY;
        timeline.addKeyFrame(KeyFrame.makeScale(0.7, 0.7, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline.addKeyFrame(KeyFrame.makeScale(0.55, 0.55, KeyFrame.TransitionType.EASE_IN, 0.35));
        timeline.addKeyFrame(KeyFrame.makeScale(0.4, 0.4, KeyFrame.TransitionType.EASE_OUT, 0.35));
        timeline.addKeyFrame(KeyFrame.makeScale(0.55, 0.55, KeyFrame.TransitionType.EASE_IN, 0.35));
        timeline.addKeyFrame(KeyFrame.makeScale(0.7, 0.7, KeyFrame.TransitionType.EASE_OUT, 0.35));
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x + 1,
                this.backCloud2.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x,
                this.backCloud2.y,
                KeyFrame.TransitionType.EASE_IN,
                0.35
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x - 1,
                this.backCloud2.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.35
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x,
                this.backCloud2.y,
                KeyFrame.TransitionType.EASE_IN,
                0.35
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud2.x + 1,
                this.backCloud2.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.35
            )
        );
        this.backCloud2.addTimelineWithID(timeline, 0);
        this.backCloud2.playTimeline(0);
        this.backCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, BACK_CLOUD_FRAME);
        this.backCloud.doRestoreCutTransparency();
        this.backCloud.anchor = this.backCloud.parentAnchor = Alignment.CENTER;
        const angle1 = (10 + offsetAngle) * DEG_TO_RAD;
        this.backCloud.x = Math.cos(angle1);
        this.backCloud.y = Math.sin(angle1);
        this.backCloud.visible = true;
        this.addChild(this.backCloud);
        const timeline2 = new Timeline();
        timeline2.loopType = Timeline.LoopType.REPLAY;
        timeline2.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline2.addKeyFrame(KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.EASE_IN, 0.39));
        timeline2.addKeyFrame(KeyFrame.makeScale(0.7, 0.7, KeyFrame.TransitionType.EASE_OUT, 0.39));
        timeline2.addKeyFrame(KeyFrame.makeScale(0.8, 0.8, KeyFrame.TransitionType.EASE_IN, 0.39));
        timeline2.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.EASE_OUT, 0.39));
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x + 1,
                this.backCloud.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x,
                this.backCloud.y,
                KeyFrame.TransitionType.EASE_IN,
                0.39
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x - 1,
                this.backCloud.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.39
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x,
                this.backCloud.y,
                KeyFrame.TransitionType.EASE_IN,
                0.39
            )
        );
        timeline2.addKeyFrame(
            KeyFrame.makePos(
                this.backCloud.x + 1,
                this.backCloud.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.39
            )
        );
        this.backCloud.addTimelineWithID(timeline2, 0);
        this.backCloud.playTimeline(0);
        const frontCloudRight = ImageElement.create(
            ResourceId.IMG_OBJ_GHOST,
            FRONT_CLOUD_RIGHT_FRAME
        );
        frontCloudRight.doRestoreCutTransparency();
        frontCloudRight.anchor = frontCloudRight.parentAnchor = Alignment.CENTER;
        frontCloudRight.x = this.x + 20;
        frontCloudRight.y = this.y + 20;
        this.addChild(frontCloudRight);
        const timeline3 = new Timeline();
        timeline3.loopType = Timeline.LoopType.REPLAY;
        timeline3.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline3.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, 0.45));
        timeline3.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.EASE_OUT, 0.45));
        timeline3.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, 0.45));
        timeline3.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.EASE_OUT, 0.45));
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                frontCloudRight.x + 1,
                frontCloudRight.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                frontCloudRight.x,
                frontCloudRight.y,
                KeyFrame.TransitionType.EASE_IN,
                0.45
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                frontCloudRight.x - 1,
                frontCloudRight.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.45
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                frontCloudRight.x,
                frontCloudRight.y,
                KeyFrame.TransitionType.EASE_IN,
                0.45
            )
        );
        timeline3.addKeyFrame(
            KeyFrame.makePos(
                frontCloudRight.x + 1,
                frontCloudRight.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.45
            )
        );
        frontCloudRight.addTimelineWithID(timeline3, 0);
        frontCloudRight.playTimeline(0);
        const frontCloudLeft = ImageElement.create(
            ResourceId.IMG_OBJ_GHOST,
            FRONT_CLOUD_LEFT_FRAME
        );
        frontCloudLeft.doRestoreCutTransparency();
        frontCloudLeft.anchor = frontCloudLeft.parentAnchor = Alignment.CENTER;
        frontCloudLeft.x = this.x - 15;
        frontCloudLeft.y = this.y + 20;
        this.addChild(frontCloudLeft);
        const timeline4 = new Timeline();
        timeline4.loopType = Timeline.LoopType.REPLAY;
        timeline4.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline4.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, 0.5));
        timeline4.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.EASE_OUT, 0.5));
        timeline4.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, 0.5));
        timeline4.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.EASE_OUT, 0.5));
        timeline4.addKeyFrame(
            KeyFrame.makePos(
                frontCloudLeft.x - 1,
                frontCloudLeft.y + 1,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline4.addKeyFrame(
            KeyFrame.makePos(
                frontCloudLeft.x,
                frontCloudLeft.y,
                KeyFrame.TransitionType.EASE_IN,
                0.5
            )
        );
        timeline4.addKeyFrame(
            KeyFrame.makePos(
                frontCloudLeft.x + 1,
                frontCloudLeft.y - 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.5
            )
        );
        timeline4.addKeyFrame(
            KeyFrame.makePos(
                frontCloudLeft.x,
                frontCloudLeft.y,
                KeyFrame.TransitionType.EASE_IN,
                0.5
            )
        );
        timeline4.addKeyFrame(
            KeyFrame.makePos(
                frontCloudLeft.x - 1,
                frontCloudLeft.y + 1,
                KeyFrame.TransitionType.EASE_OUT,
                0.5
            )
        );
        frontCloudLeft.addTimelineWithID(timeline4, 0);
        frontCloudLeft.playTimeline(0);
    },
    playTimeline: function (index) {
        if (this.currentTimelineIndex === 1) {
            return;
        }
        if (
            index !== 1 &&
            this.currentTimelineIndex === 0 &&
            this.currentTimeline &&
            this.currentTimeline.state !== Timeline.StateType.STOPPED
        ) {
            this.color = RGBAColor.solidOpaque.copy();
        }
        this._super(index);
    },
    draw: function () {
        this.backCloud.draw();
        this.backCloud2.draw();
        this._super();
    },
});
export default GhostBouncer;
