import ImageElement from "@/visual/ImageElement";
import Text from "@/visual/Text";
import Texture2D from "@/core/Texture2D";

interface DrawImgOptions {
    fontId: number;
    text: string;
    width?: number;
    alignment?: number;
}

class TextImage extends ImageElement {
    constructor() {
        super();
    }

    setText(fontId: number, text: string, width?: number, alignment?: number): void {
        const options: DrawImgOptions = {
            fontId,
            text,
        };

        if (width !== undefined) {
            options.width = width;
        }

        if (alignment !== undefined) {
            options.alignment = alignment;
        }

        const img = Text.drawImg(options);
        this.initTexture(new Texture2D(img));
    }
}

export default TextImage;
