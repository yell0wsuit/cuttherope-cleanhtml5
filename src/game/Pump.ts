import GameObject from "@/visual/GameObject";
import Vector from "@/core/Vector";
import Radians from "@/utils/Radians";

class Pump extends GameObject {
    angle: number;
    t1: Vector;
    t2: Vector;
    touchTimer: number;
    touch: number;
    constructor() {
        super();
        this.angle = 0;
        this.t1 = Vector.newZero();
        this.t2 = Vector.newZero();
        this.touchTimer = 0;
        this.touch = 0;
    }

    updateRotation() {
        if (!this.bb) {
            return;
        }

        const bbHalfWidth = this.bb.w / 2;

        this.t1.x = this.x - bbHalfWidth;
        this.t2.x = this.x + bbHalfWidth;
        this.t1.y = this.t2.y = this.y;

        this.angle = Radians.fromDegrees(this.rotation);

        this.t1.rotateAround(this.angle, this.x, this.y);
        this.t2.rotateAround(this.angle, this.x, this.y);
    }
}

export default Pump;
