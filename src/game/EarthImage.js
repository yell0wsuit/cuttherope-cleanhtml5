import ImageElement from "@/visual/ImageElement";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import Alignment from "@/core/Alignment";
import ResourceId from "@/resources/ResourceId";

const IMG_BGR_08_P1__position_window = 1;
const IMG_OBJ_STAR_IDLE_window = 58;

class EarthImage extends ImageElement {
    /**
     * @param {number} offsetX
     * @param {number} offsetY
     */
    constructor(offsetX, offsetY) {
        super();
        this.initTextureWithId(ResourceId.IMG_OBJ_STAR_IDLE);
        this.setTextureQuad(IMG_OBJ_STAR_IDLE_window);
        this.anchor = Alignment.CENTER;

        const t = new Timeline();
        t.addKeyFrame(KeyFrame.makeRotation(0, KeyFrame.TransitionType.LINEAR, 0));
        t.addKeyFrame(KeyFrame.makeRotation(180, KeyFrame.TransitionType.EASE_OUT, 0.3));
        this.addTimelineWithID(t, EarthImage.TimelineId.UPSIDE_DOWN);

        const t2 = new Timeline();
        t2.addKeyFrame(KeyFrame.makeRotation(180, KeyFrame.TransitionType.LINEAR, 0));
        t2.addKeyFrame(KeyFrame.makeRotation(0, KeyFrame.TransitionType.EASE_OUT, 0.3));
        this.addTimelineWithID(t2, EarthImage.TimelineId.NORMAL);

        this.setElementPositionWithOffset(ResourceId.IMG_BGR_08_P1, IMG_BGR_08_P1__position_window);
        this.x += offsetX;
        this.y += offsetY;
    }
}

/**
 * @enum {number}
 */
EarthImage.TimelineId = {
    NORMAL: 0,
    UPSIDE_DOWN: 1,
};

export default EarthImage;
