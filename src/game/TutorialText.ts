import type RGBAColor from "@/core/RGBAColor";
import TextImage from "@/visual/TextImage";

class TutorialText extends TextImage {
    /**
     * @type {number}
     */
    special: number;
    x?: number;
    y?: number;
    align?: number;
    color?: RGBAColor;

    constructor() {
        super();
        this.special = 0;
    }
}

export default TutorialText;
