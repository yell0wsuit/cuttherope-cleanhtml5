import GameObject from "@/visual/GameObject";

class Bubble extends GameObject {
    /**
     * @type {boolean}
     */
    popped: boolean;

    /**
     * @type {boolean}
     */
    withoutShadow: boolean;

    constructor() {
        super();
        this.popped = false;
        this.withoutShadow = false;
    }

    override draw() {
        if (this.withoutShadow) {
            // only do transformations and draw children
            this.preDraw();
            this.postDraw();
        } else {
            super.draw();
        }
    }
}

export default Bubble;
