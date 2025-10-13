import Bouncer from "@/game/Bouncer";
import ImageElement from "@/visual/ImageElement";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Alignment from "@/core/Alignment";
import ResourceId from "@/resources/ResourceId";
import Radians from "@/utils/Radians";
import RGBAColor from "@/core/RGBAColor";
import GhostElementTimeline from "@/game/GhostElementTimeline";
import { getGhostCloudSlice } from "@/game/GhostAssets";
const GhostBouncer = Bouncer.extend({
    init: function (px, py, width, angle) {
        this._super(px, py, width, angle);
        this.passColorToChilds = true;
        this.backClouds = [];
        this.frontClouds = [];
        this.createBackCloud(getGhostCloudSlice(2), 170, Math.sqrt(925));
        this.createBackCloud(getGhostCloudSlice(2), 10, Math.sqrt(925));
        this.createFrontCloud(getGhostCloudSlice(1), 20, 20, 0.45);
        this.createFrontCloud(getGhostCloudSlice(0), -15, 20, 0.5);
    },
    createBackCloud: function (quadIndex, angleOffset, radius) {
        const rad = Radians.fromDegrees(angleOffset),
            cloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, quadIndex);
        cloud.anchor = Alignment.CENTER;
        cloud.parentAnchor = Alignment.CENTER;
        cloud.x = radius * Math.cos(rad);
        cloud.y = radius * Math.sin(rad);
        cloud.visible = false;
        cloud.doRestoreCutTransparency();
        this.addChild(cloud);
        const timeline = new Timeline();
        timeline.loopType = Timeline.LoopType.REPLAY;
        timeline.addKeyFrame(KeyFrame.makeScale(0.7, 0.7, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline.addKeyFrame(KeyFrame.makeScale(0.55, 0.55, KeyFrame.TransitionType.EASE_IN, 0.35));
        timeline.addKeyFrame(KeyFrame.makeScale(0.4, 0.4, KeyFrame.TransitionType.EASE_OUT, 0.35));
        timeline.addKeyFrame(KeyFrame.makeScale(0.55, 0.55, KeyFrame.TransitionType.EASE_IN, 0.35));
        timeline.addKeyFrame(KeyFrame.makeScale(0.7, 0.7, KeyFrame.TransitionType.EASE_OUT, 0.35));
        timeline.addKeyFrame(
            KeyFrame.makePos(cloud.x + 1, cloud.y + 1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(cloud.x, cloud.y, KeyFrame.TransitionType.EASE_IN, 0.35)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(cloud.x - 1, cloud.y - 1, KeyFrame.TransitionType.EASE_OUT, 0.35)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(cloud.x, cloud.y, KeyFrame.TransitionType.EASE_IN, 0.35)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(cloud.x + 1, cloud.y + 1, KeyFrame.TransitionType.EASE_OUT, 0.35)
        );
        cloud.addTimelineWithID(timeline, 0);
        cloud.playTimeline(0);
        this.backClouds.push({ cloud, angleOffset, radius });
    },
    createFrontCloud: function (quadIndex, offsetX, offsetY, duration) {
        const cloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, quadIndex);
        cloud.anchor = Alignment.CENTER;
        cloud.parentAnchor = Alignment.CENTER;
        cloud.x = offsetX;
        cloud.y = offsetY;
        cloud.visible = false;
        cloud.doRestoreCutTransparency();
        this.addChild(cloud);
        const timeline = new Timeline();
        timeline.loopType = Timeline.LoopType.REPLAY;
        timeline.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.IMMEDIATE, 0));
        timeline.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, duration));
        timeline.addKeyFrame(
            KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.EASE_OUT, duration)
        );
        timeline.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.EASE_IN, duration));
        timeline.addKeyFrame(
            KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.EASE_OUT, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(offsetX + 1, offsetY + 1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(offsetX, offsetY, KeyFrame.TransitionType.EASE_IN, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(offsetX - 1, offsetY - 1, KeyFrame.TransitionType.EASE_OUT, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(offsetX, offsetY, KeyFrame.TransitionType.EASE_IN, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(offsetX + 1, offsetY + 1, KeyFrame.TransitionType.EASE_OUT, duration)
        );
        cloud.addTimelineWithID(timeline, 0);
        cloud.playTimeline(0);
        this.frontClouds.push({ cloud, offsetX, offsetY });
    },
    update: function (delta) {
        this._super(delta);
        for (let i = 0; i < this.backClouds.length; i++) {
            const info = this.backClouds[i],
                rad = Radians.fromDegrees(this.rotation + info.angleOffset),
                cloud = info.cloud;
            cloud.x = info.radius * Math.cos(rad);
            cloud.y = info.radius * Math.sin(rad);
        }
        for (let i = 0; i < this.frontClouds.length; i++) {
            const info = this.frontClouds[i];
            info.cloud.x = info.offsetX;
            info.cloud.y = info.offsetY;
        }
    },
    playTimeline: function (timelineId) {
        if (this.currentTimelineIndex === GhostElementTimeline.DISAPPEAR) {
            return;
        }
        if (
            timelineId !== GhostElementTimeline.DISAPPEAR &&
            this.currentTimelineIndex === GhostElementTimeline.APPEAR &&
            this.currentTimeline &&
            this.currentTimeline.state !== Timeline.StateType.STOPPED
        ) {
            this.color.copyFrom(RGBAColor.solidOpaque);
        }
        this._super(timelineId);
    },
    draw: function () {
        for (let i = 0; i < this.backClouds.length; i++) {
            const cloud = this.backClouds[i].cloud;
            cloud.color.copyFrom(this.color);
            cloud.draw();
        }
        this._super();
        for (let i = 0; i < this.frontClouds.length; i++) {
            const cloud = this.frontClouds[i].cloud;
            cloud.color.copyFrom(this.color);
            cloud.draw();
        }
    },
});
export default GhostBouncer;
