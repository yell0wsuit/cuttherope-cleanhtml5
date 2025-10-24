import GameObject from "@/visual/GameObject";
import ResourceId from "@/resources/ResourceId";
import PubSub from "@/utils/PubSub";

class Drawing extends GameObject {
    constructor(hiddenId, drawingIndex) {
        super();
        this.initTextureWithId(ResourceId.IMG_DRAWING_HIDDEN);
        this.setTextureQuad(hiddenId);
        this.ingame = true;
        this.drawingIndex = drawingIndex;
        this.passTransformationsToChilds = false;
    }

    showDrawing() {
        PubSub.publish(PubSub.ChannelId.DrawingClicked, this.drawingIndex);
    }
}

export default Drawing;
