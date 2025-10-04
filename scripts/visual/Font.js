define("visual/Font", [
  "visual/ImageElement",
  "utils/Canvas",
  "utils/Constants",
  "utils/Log",
], function (ImageElement, Canvas, Constants, Log) {
  var Font = ImageElement.extend({
    init: function () {
      this._super();

      this.chars = "";
      this.charOffset = 0;
      this.lineOffset = 0;
      this.spaceWidth = 0;
      this.kerning = null;
    },
    initWithVariableSizeChars: function (
      chars,
      charTexture,
      kerningDictionary,
    ) {
      this.chars = chars;
      this.initTexture(charTexture);
      this.kerning = kerningDictionary;
    },
    setOffsets: function (charOffset, lineOffset, spaceWidth) {
      this.charOffset = charOffset;
      this.lineOffset = lineOffset;
      this.spaceWidth = spaceWidth;
    },
    getCharQuad: function (c) {
      var charIndex = this.chars.indexOf(c);
      if (charIndex >= 0) {
        return charIndex;
      }

      Log.alert("Char not found in font:" + c);

      // replace missing character with a period
      return this.chars.indexOf(".");
    },
    drawQuadWOBind: function (index, x, y) {
      var rect = this.texture.rects[index],
        quadWidth = Math.ceil(rect.w),
        quadHeight = Math.ceil(rect.h);

      Canvas.context.drawImage(
        this.texture.image,
        rect.x | 0,
        rect.y | 0,
        quadWidth,
        quadHeight, // source coordinates
        x | 0,
        y | 0,
        quadWidth,
        quadHeight,
      ); // destination coordinates
    },
    stringWidth: function (str) {
      var strWidth = 0,
        len = str.length,
        lastOffset = 0;
      for (var c = 0; c < len; c++) {
        lastOffset = this.getCharOffset(str, c);

        if (str[c] === " ") {
          strWidth += this.spaceWidth + lastOffset;
        } else {
          var quadIndex = this.getCharQuad(str[c]),
            itemWidth = this.texture.rects[quadIndex].w;
          strWidth += itemWidth + lastOffset;
        }
      }
      strWidth -= lastOffset;
      return Math.ceil(strWidth);
    },
    fontHeight: function () {
      return this.texture.rects[0].h;
    },
    getCharOffset: function (str, charIndex) {
      // no offset if its the last character
      if (charIndex === str.length - 1) {
        return 0;
      }

      // use the default offset if no kerning is defined
      if (!this.kerning) {
        return this.charOffset;
      }

      // see if kerning is specified for char pair or use the default offset
      var chars = str[charIndex] + str[charIndex + 1],
        v = this.kerning[chars];
      if (v != null) {
        return v;
      } else {
        return this.charOffset;
      }
    },
  });

  return Font;
});
