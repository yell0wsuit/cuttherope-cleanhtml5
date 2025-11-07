import BaseElement from "@/visual/BaseElement";
import resolution from "@/resolution";

class View extends BaseElement {
    width: number;
    height: number;

    constructor() {
        super();
        this.width = resolution.CANVAS_WIDTH;
        this.height = resolution.CANVAS_HEIGHT;
    }
}

export default View;
