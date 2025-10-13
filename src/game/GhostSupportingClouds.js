import BaseElement from "@/visual/BaseElement";
import ImageElement from "@/visual/ImageElement";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Alignment from "@/core/Alignment";
import ResourceId from "@/resources/ResourceId";
import { getGhostCloudSlice } from "@/game/GhostAssets";
const GhostSupportingClouds = BaseElement.extend({
    init: function (position, supportedElement) {
        this._super();
        const mainCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(1));
        const sideCloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, getGhostCloudSlice(0));
        mainCloud.anchor = Alignment.CENTER;
        mainCloud.parentAnchor = Alignment.CENTER;
        sideCloud.anchor = Alignment.CENTER;
        sideCloud.parentAnchor = Alignment.CENTER;
        switch (supportedElement) {
            case 0:
            case 1:
                mainCloud.x = position.x + 10;
                mainCloud.y = position.y + 10;
                sideCloud.x = position.x - 10;
                sideCloud.y = position.y + 10;
                break;
            case 2:
                mainCloud.x = position.x + 20;
                mainCloud.y = position.y + 20;
                sideCloud.x = position.x - 20;
                sideCloud.y = position.y + 20;
                break;
            default:
                mainCloud.x = position.x;
                mainCloud.y = position.y;
                sideCloud.x = position.x;
                sideCloud.y = position.y;
                break;
        }
        mainCloud.doRestoreCutTransparency();
        sideCloud.doRestoreCutTransparency();
        this.addChild(mainCloud);
        this.addChild(sideCloud);
        const mainTimeline = new Timeline();
        mainTimeline.loopType = Timeline.LoopType.REPLAY;
        mainTimeline.addKeyFrame(
            KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        mainTimeline.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.LINEAR, 1.2));
        mainTimeline.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.LINEAR, 1.2));
        mainTimeline.addKeyFrame(
            KeyFrame.makePos(mainCloud.x + 2, mainCloud.y + 2, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        mainTimeline.addKeyFrame(
            KeyFrame.makePos(mainCloud.x - 2, mainCloud.y - 2, KeyFrame.TransitionType.LINEAR, 1.2)
        );
        mainTimeline.addKeyFrame(
            KeyFrame.makePos(mainCloud.x + 2, mainCloud.y + 2, KeyFrame.TransitionType.LINEAR, 1.2)
        );
        mainCloud.addTimelineWithID(mainTimeline, 1);
        mainCloud.playTimeline(1);
        const sideTimeline = new Timeline();
        sideTimeline.loopType = Timeline.LoopType.REPLAY;
        sideTimeline.addKeyFrame(
            KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        sideTimeline.addKeyFrame(KeyFrame.makeScale(0.9, 0.9, KeyFrame.TransitionType.LINEAR, 1.2));
        sideTimeline.addKeyFrame(KeyFrame.makeScale(1.1, 1.1, KeyFrame.TransitionType.LINEAR, 1.2));
        sideTimeline.addKeyFrame(
            KeyFrame.makePos(sideCloud.x - 2, sideCloud.y + 2, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        sideTimeline.addKeyFrame(
            KeyFrame.makePos(sideCloud.x + 2, sideCloud.y - 2, KeyFrame.TransitionType.LINEAR, 1.2)
        );
        sideTimeline.addKeyFrame(
            KeyFrame.makePos(sideCloud.x - 2, sideCloud.y + 2, KeyFrame.TransitionType.LINEAR, 1.2)
        );
        sideCloud.addTimelineWithID(sideTimeline, 0);
        sideCloud.playTimeline(0);
    },
});
export default GhostSupportingClouds;
