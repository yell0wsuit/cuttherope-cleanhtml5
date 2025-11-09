import Animation from "@/visual/Animation";
import Alignment from "@/core/Alignment";
import ResourceId from "@/resources/ResourceId";
import Timeline from "@/visual/Timeline";
import * as GameSceneConstants from "@/gameScene/constants";
import type GameSceneInit from "../init";

export function initAnimations(this: GameSceneInit): void {
    this.starDisappearPool = [];

    //create bubble animation
    this.bubbleDisappear = new Animation();
    this.bubbleDisappear.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_POP);
    this.bubbleDisappear.doRestoreCutTransparency();
    this.bubbleDisappear.anchor = Alignment.CENTER;

    const a = this.bubbleDisappear.addAnimationDelay(
        0.05,
        Timeline.LoopType.NO_LOOP,
        GameSceneConstants.IMG_OBJ_BUBBLE_POP_Frame_1,
        GameSceneConstants.IMG_OBJ_BUBBLE_POP_Frame_12
    );
    const bubbleTimeline = this.bubbleDisappear.getTimeline(a);
    if (bubbleTimeline) {
        bubbleTimeline.onFinished = this.aniPool.timelineFinishedDelegate();
    }

    this.aniPool.removeAllChildren();
    this.staticAniPool.removeAllChildren();
    this.dd.cancelAllDispatches();

    this.attachCount = 0;
    this.juggleTimer = 0;
}
