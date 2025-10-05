import ImageElement from "visual/ImageElement";
import Canvas from "utils/Canvas";
import Constants from "utils/Constants";
import Log from "utils/Log";
const Font = ImageElement.extend({
    init: function () {
        this._super();

        this.chars = "";
        this.charOffset = 0;
        this.lineOffset = 0;
        this.spaceWidth = 0;
        this.kerning = null;
    },
    initWithVariableSizeChars: function (chars, charTexture, kerningDictionary) {
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
        const charIndex = this.chars.indexOf(c);
        if (charIndex >= 0) {
            return charIndex;
        }

        Log.alert("Char not found in font:" + c);

        // replace missing character with a period
        return this.chars.indexOf(".");
    },
    drawQuadWOBind: function (index, x, y) {
        const rect = this.texture.rects[index],
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
            quadHeight
        ); // destination coordinates
    },
    stringWidth: function (str) {
        let strWidth = 0,
            len = str.length,
            lastOffset = 0;
        for (let c = 0; c < len; c++) {
            lastOffset = this.getCharOffset(str, c);

            if (str[c] === " ") {
                strWidth += this.spaceWidth + lastOffset;
            } else {
                const quadIndex = this.getCharQuad(str[c]),
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
        const chars = str[charIndex] + str[charIndex + 1],
            v = this.kerning[chars];
        if (v != null) {
            return v;
        } else {
            return this.charOffset;
        }
    },
});

export default Font;
