import TextImage from "@/visual/TextImage";

class TutorialText extends TextImage {
    /**
     * @type {number}
     */
    special;
    x: any;
    y: any;
    align: number;
    color: import("/Users/yell0wsuitMac/Documents/GitHub/cuttherope-cleanhtml5/src/core/RGBAColor").default;

    constructor() {
        super();
        this.special = 0;
    }
}

export default TutorialText;
