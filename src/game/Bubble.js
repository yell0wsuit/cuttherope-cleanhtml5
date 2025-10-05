import GameObject from "@/visual/GameObject";
const Bubble = GameObject.extend({
    init: function () {
        this._super();
        this.popped = false;
        this.withoutShadow = false;
    },
    draw: function () {
        if (this.withoutShadow) {
            // only do transformations and draw children
            this.preDraw();
            this.postDraw();
        } else {
            this._super();
        }
    },
});

export default Bubble;
