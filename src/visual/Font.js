import ImageElement from "@/visual/ImageElement";
import Canvas from "@/utils/Canvas";
import Constants from "@/utils/Constants";
import Log from "@/utils/Log";

class Font extends ImageElement {
    constructor() {
        super();

        this.chars = "";
        this.charOffset = 0;
        this.lineOffset = 0;
        this.spaceWidth = 0;
        this.kerning = null;
    }

    /**
     * @param {string} chars
     * @param {Texture2D} charTexture
     * @param {Object.<string, number>|null} kerningDictionary
     * @returns {void}
     */
    initWithVariableSizeChars(chars, charTexture, kerningDictionary) {
        this.chars = chars;
        this.initTexture(charTexture);
        this.kerning = kerningDictionary;
    }

    /**
     * @param {number} charOffset
     * @param {number} lineOffset
     * @param {number} spaceWidth
     * @returns {void}
     */
    setOffsets(charOffset, lineOffset, spaceWidth) {
        this.charOffset = charOffset;
        this.lineOffset = lineOffset;
        this.spaceWidth = spaceWidth;
    }

    /**
     * @param {string} c
     * @returns {number}
     */
    getCharQuad(c) {
        const charIndex = this.chars.indexOf(c);
        if (charIndex >= 0) {
            return charIndex;
        }

        Log.alert(`Char not found in font: ${c}`);

        // replace missing character with a period
        return this.chars.indexOf(".");
    }

    /**
     * @param {number} index
     * @param {number} x
     * @param {number} y
     * @returns {void}
     */
    drawQuadWOBind(index, x, y) {
        const rect = this.texture.rects[index];
        const quadWidth = Math.ceil(rect.w);
        const quadHeight = Math.ceil(rect.h);

        if (!Canvas.context) {
            return;
        }

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
    }

    /**
     * @param {string} str
     * @returns {number}
     */
    stringWidth(str) {
        let strWidth = 0;
        const len = str.length;
        let lastOffset = 0;
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
    }

    /**
     * @returns {number}
     */
    fontHeight() {
        return this.texture.rects[0].h;
    }

    /**
     * @param {string} str
     * @param {number} charIndex
     * @returns {number}
     */
    getCharOffset(str, charIndex) {
        // no offset if its the last character
        if (charIndex === str.length - 1) {
            return 0;
        }

        // use the default offset if no kerning is defined
        if (!this.kerning) {
            return this.charOffset;
        }

        // see if kerning is specified for char pair or use the default offset
        const chars = str[charIndex] + str[charIndex + 1];
        const v = this.kerning[chars];
        if (v != null) {
            return v;
        } else {
            return this.charOffset;
        }
    }
}

export default Font;
