import BaseElement from "@/visual/BaseElement";
import resolution from "@/resolution";

/**
 * @class
 * @extends {BaseElement}
 */
class View extends BaseElement {
    /** @type {number} */
    width: number;

    /** @type {number} */
    height: number;

    constructor() {
        super();
        this.width = resolution.CANVAS_WIDTH;
        this.height = resolution.CANVAS_HEIGHT;
    }
}

export default View;
