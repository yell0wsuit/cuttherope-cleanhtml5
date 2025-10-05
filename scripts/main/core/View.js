import BaseElement from "visual/BaseElement";
import resolution from "resolution";
const View = BaseElement.extend({
    init: function () {
        this._super();
        this.width = resolution.CANVAS_WIDTH;
        this.height = resolution.CANVAS_HEIGHT;
    },
});

export default View;
