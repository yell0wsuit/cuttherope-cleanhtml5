import GameObject from "@/visual/GameObject";

class Bubble extends GameObject {
    popped: boolean;
    withoutShadow: boolean;

    constructor() {
        super();
        this.popped = false;
        this.withoutShadow = false;
    }

    draw() {
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
