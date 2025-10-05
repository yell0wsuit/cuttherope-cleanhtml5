import GameObject from "visual/GameObject";
import ResourceId from "resources/ResourceId";
import PubSub from "utils/PubSub";
const Drawing = GameObject.extend({
    init: function (hiddenId, drawingIndex) {
        this._super();
        this.initTextureWithId(ResourceId.IMG_DRAWING_HIDDEN);
        this.setTextureQuad(hiddenId);
        this.ingame = true;
        this.drawingIndex = drawingIndex;
        this.passTransformationsToChilds = false;
    },
    showDrawing: function () {
        PubSub.publish(PubSub.ChannelId.DrawingClicked, this.drawingIndex);
    },
});

export default Drawing;
