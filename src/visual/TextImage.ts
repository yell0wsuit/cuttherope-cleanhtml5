import ImageElement from "@/visual/ImageElement";
import Text from "@/visual/Text";
import Texture2D from "@/core/Texture2D";

class TextImage extends ImageElement {
    constructor() {
        super();
    }

    setText(fontId, text, width, alignment) {
        const img = Text.drawImg({
            fontId: fontId,
            text: text,
            width: width,
            alignment: alignment,
        });
        this.initTexture(new Texture2D(img));
    }
}

export default TextImage;
