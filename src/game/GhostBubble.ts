import Alignment from "@/core/Alignment";
import Rectangle from "@/core/Rectangle";
import KeyFrame from "@/visual/KeyFrame";
import Timeline from "@/visual/Timeline";
import Bubble from "@/game/Bubble";
import ImageElement from "@/visual/ImageElement";
import ResourceId from "@/resources/ResourceId";
import resolution from "@/resolution";
import * as GameSceneConstants from "@/gameScene/constants";

const CLOUD_SCALE_MIN = 0.7;
const CLOUD_SCALE_MAX = 1;
const CLOUD_DRIFT = 1;
const CLOUD_DURATION = 0.45;

class GhostBubble extends Bubble {
    private readonly clouds: ImageElement[];

    constructor() {
        super();
        this.clouds = [];
    }

    initAt(x: number, y: number): this {
        this.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_ATTACHED);
        this.bb = Rectangle.copy(resolution.BUBBLE_BB);
        this.x = x;
        this.y = y;
        this.anchor = Alignment.CENTER;
        this.popped = false;

        const bubble = ImageElement.create(
            ResourceId.IMG_OBJ_BUBBLE_ATTACHED,
            GameSceneConstants.IMG_OBJ_BUBBLE_ATTACHED_bubble
        );
        bubble.doRestoreCutTransparency();
        bubble.parentAnchor = bubble.anchor = Alignment.CENTER;
        this.addChild(bubble);

        this.addSupportingClouds();

        return this;
    }

    private addSupportingClouds() {
        const quads = [
            GameSceneConstants.IMG_OBJ_GHOST_bubble_2,
            GameSceneConstants.IMG_OBJ_GHOST_bubble_4,
            GameSceneConstants.IMG_OBJ_GHOST_bubble_3,
        ];

        const offsets: [number, number][] = [
            [60, 50],
            [-55, 55],
            [70, 10],
        ];

        for (let i = 0; i < quads.length; i++) {
            const cloud = ImageElement.create(ResourceId.IMG_OBJ_GHOST, quads[i]);
            cloud.anchor = cloud.parentAnchor = Alignment.CENTER;
            cloud.x = this.x + offsets[i]![0];
            cloud.y = this.y + offsets[i]![1];
            this.addChild(cloud);
            this.clouds.push(cloud);

            const timeline = new Timeline();
            timeline.loopType = Timeline.LoopType.REPLAY;
            timeline.addKeyFrame(
                KeyFrame.makeScale(
                    CLOUD_SCALE_MAX,
                    CLOUD_SCALE_MAX,
                    KeyFrame.TransitionType.IMMEDIATE,
                    0
                )
            );
            timeline.addKeyFrame(
                KeyFrame.makeScale(
                    CLOUD_SCALE_MIN,
                    CLOUD_SCALE_MIN,
                    KeyFrame.TransitionType.EASE_OUT,
                    CLOUD_DURATION
                )
            );
            timeline.addKeyFrame(
                KeyFrame.makeScale(
                    CLOUD_SCALE_MAX,
                    CLOUD_SCALE_MAX,
                    KeyFrame.TransitionType.EASE_IN,
                    CLOUD_DURATION
                )
            );

            timeline.addKeyFrame(
                KeyFrame.makePos(
                    cloud.x + CLOUD_DRIFT,
                    cloud.y + CLOUD_DRIFT,
                    KeyFrame.TransitionType.IMMEDIATE,
                    0
                )
            );
            timeline.addKeyFrame(
                KeyFrame.makePos(
                    cloud.x - CLOUD_DRIFT,
                    cloud.y - CLOUD_DRIFT,
                    KeyFrame.TransitionType.EASE_OUT,
                    CLOUD_DURATION
                )
            );
            timeline.addKeyFrame(
                KeyFrame.makePos(
                    cloud.x,
                    cloud.y,
                    KeyFrame.TransitionType.EASE_IN,
                    CLOUD_DURATION
                )
            );

            cloud.addTimeline(timeline);
            cloud.playTimeline(0);
        }

        this.passColorToChilds = true;
    }
}

export default GhostBubble;
