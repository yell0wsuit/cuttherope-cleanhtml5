define("visual/TextImage", [
  "visual/ImageElement",
  "visual/Text",
  "core/Texture2D",
], function (ImageElement, Text, Texture2D) {
  var TextImage = ImageElement.extend({
    init: function () {
      this._super();
    },
    setText: function (fontId, text, width, alignment) {
      var img = Text.drawImg({
        fontId: fontId,
        text: text,
        width: width,
        alignment: alignment,
      });
      this.initTexture(new Texture2D(img));
    },
  });

  return TextImage;
});
