import Alignment from "@/core/Alignment";
import Grab from "@/game/Grab";
import ImageElement from "@/visual/ImageElement";
import KeyFrame from "@/visual/KeyFrame";
import Timeline from "@/visual/Timeline";
import ResourceId from "@/resources/ResourceId";

class GhostGrab extends Grab {
    initAt(px: number, py: number): this {
        this.x = px;
        this.y = py;

        // Cloud quad 5 (index 5) - left
        const leftCloud = ImageElement.create(
            ResourceId.IMG_OBJ_GHOST,
            5
        );
        leftCloud.anchor = leftCloud.parentAnchor = Alignment.CENTER;
        leftCloud.x = this.x - 60;
        leftCloud.y = this.y + 2;
        this.addChild(leftCloud);
        this.addFloatTimeline(leftCloud, 0.65, 0.43, 0.465, 0.5, -1, 1);

        // Cloud quad 4 (index 4) - right
        const rightCloud = ImageElement.create(
            ResourceId.IMG_OBJ_GHOST,
            4
        );
        rightCloud.anchor = rightCloud.parentAnchor = Alignment.CENTER;
        rightCloud.x = this.x + 58;
        rightCloud.y = this.y + 18;
        this.addChild(rightCloud);
        this.addFloatTimeline(rightCloud, 0.45, 0.9, 0.8, 0.7, 1, 1);

        // Cloud quad 2 (index 2) - center
        const centerCloud = ImageElement.create(
            ResourceId.IMG_OBJ_GHOST,
            2
        );
        centerCloud.anchor = centerCloud.parentAnchor = Alignment.CENTER;
        centerCloud.x = this.x - 15;
        centerCloud.y = this.y + 45;
        this.addChild(centerCloud);
        this.addFloatTimeline(centerCloud, 0.5, 1.1, 1, 0.9, -1, 1);

        // Child clouds inherit parent color and transformations
        (this as any).passTransformationsToChilds = true;

        return this;
    }

    override drawBack(): void {
        // Skip the default back draw to let the front layer and custom clouds dominate.
    }

    private addFloatTimeline(
        target: ImageElement,
        duration: number,
        startScale: number,
        midScale: number,
        endScale: number,
        posDeltaX: number,
        posDeltaY: number
    ): void {
        const timeline = new Timeline();
        timeline.loopType = Timeline.LoopType.REPLAY;
        timeline.addKeyFrame(
            KeyFrame.makeScale(startScale, startScale, KeyFrame.TransitionType.IMMEDIATE, 0)
        );
        timeline.addKeyFrame(
            KeyFrame.makeScale(midScale, midScale, KeyFrame.TransitionType.EASE_IN, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makeScale(endScale, endScale, KeyFrame.TransitionType.EASE_OUT, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makeScale(midScale, midScale, KeyFrame.TransitionType.EASE_IN, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makeScale(startScale, startScale, KeyFrame.TransitionType.EASE_OUT, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                target.x + posDeltaX,
                target.y + posDeltaY,
                KeyFrame.TransitionType.IMMEDIATE,
                0
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(target.x, target.y, KeyFrame.TransitionType.EASE_IN, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                target.x - posDeltaX,
                target.y - posDeltaY,
                KeyFrame.TransitionType.EASE_OUT,
                duration
            )
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(target.x, target.y, KeyFrame.TransitionType.EASE_IN, duration)
        );
        timeline.addKeyFrame(
            KeyFrame.makePos(
                target.x + posDeltaX,
                target.y + posDeltaY,
                KeyFrame.TransitionType.EASE_OUT,
                duration
            )
        );
        target.addTimeline(timeline);
        target.playTimeline(0);
    }
}

export default GhostGrab;
