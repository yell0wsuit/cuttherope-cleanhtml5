define("game/Drawing", [
  "visual/GameObject",
  "resources/ResourceId",
  "utils/PubSub",
], function (GameObject, ResourceId, PubSub) {
  var Drawing = GameObject.extend({
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

  return Drawing;
});
