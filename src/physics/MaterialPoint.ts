import Constants from "@/utils/Constants";
import Vector from "@/core/Vector";
import Gravity, { GCONST } from "@/physics/Gravity";

class MaterialPoint {
    disableGravity: boolean;
    weight!: number;
    invWeight!: number;
    gravity!: Vector;
    v: Vector; // velocity vector
    a: Vector; // acceleration vector
    pos: Vector;
    posDelta: Vector;
    totalForce: Vector;

    constructor() {
        this.disableGravity = false;
        this.setWeight(1);
        // Initialize vectors directly instead of calling resetAll()
        // to avoid issues with subclass initialization order
        const newZero = Vector.newZero;
        this.v = newZero(); // velocity vector
        this.a = newZero(); // acceleration vector
        this.pos = newZero();
        this.posDelta = newZero();
        this.totalForce = newZero();
    }

    setWeight(w: number): void {
        this.weight = w;
        this.invWeight = 1 / w;
        this.gravity = new Vector(0, GCONST * w);
    }

    resetAll(): void {
        const newZero = Vector.newZero;
        this.v = newZero(); // velocity vector
        this.a = newZero(); // acceleration vector
        this.pos = newZero();
        this.posDelta = newZero();
        this.totalForce = newZero();
    }

    updateWithPrecision(delta: number, precision: number): void {
        // Calculate number Of iterations to be made at this update depending
        // on maxPossible_dt And dt (chop off fractional part and add 1)
        const numIterations = ((delta / precision) >> 0) + 1;

        // update delta based on num of iterations
        if (numIterations != 0) {
            // avoid division by zero
            delta = delta / numIterations;
        }

        for (let i = 0; i < numIterations; i++) {
            this.update(delta);
        }
    }

    update(delta: number): void {
        this.totalForce = Vector.newZero();

        // incorporate gravity
        if (!this.disableGravity) {
            if (!Gravity.isZero() && this.weight) {
                this.totalForce.add(Vector.multiply(Gravity.current, this.weight));
            } else if (this.gravity) {
                this.totalForce.add(this.gravity);
            }
        }

        const adjustedDelta = delta / Constants.TIME_SCALE;
        if (!this.invWeight) {
            return;
        }

        this.totalForce.multiply(this.invWeight);
        this.a = Vector.multiply(this.totalForce, adjustedDelta);
        this.v.add(this.a);

        this.posDelta = Vector.multiply(this.v, adjustedDelta);
        this.pos.add(this.posDelta);
    }

    applyImpulse(impulse: Vector, delta: number): void {
        if (!impulse.isZero()) {
            const im = Vector.multiply(impulse, delta / Constants.TIME_SCALE);
            this.pos.add(im);
        }
    }
}

export default MaterialPoint;
