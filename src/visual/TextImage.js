import ImageElement from "@/visual/ImageElement";
import Text from "@/visual/Text";
import Texture2D from "@/core/Texture2D";

class TextImage extends ImageElement {
    constructor() {
        super();
    }

    /**
     * @param {number} fontId
     * @param {string} text
     * @param {number} [width]
     * @param {number} [alignment]
     */
    setText(fontId, text, width, alignment) {
        /** @type {import("@/visual/Text").DrawImgOptions} */
        const options = {
            fontId: fontId,
            text: text,
        };

        if (width !== undefined) {
            options.width = width;
        }

        if (alignment !== undefined) {
            options.alignment = alignment;
        }

        const img = Text.drawImg(options);
        this.initTexture(new Texture2D(/** @type {any} */ (img)));
    }
}

export default TextImage;
