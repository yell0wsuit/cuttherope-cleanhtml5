import Constants from "@/utils/Constants";
import Vector from "@/core/Vector";
import Gravity from "@/physics/Gravity";

class MaterialPoint {
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

    setWeight(w) {
        this.weight = w;
        this.invWeight = 1 / w;
        this.gravity = new Vector(0, Constants.EARTH_Y * w);
    }

    resetAll() {
        const newZero = Vector.newZero;
        this.v = newZero(); // velocity vector
        this.a = newZero(); // acceleration vector
        this.pos = newZero();
        this.posDelta = newZero();
        this.totalForce = newZero();
    }

    updateWithPrecision(delta, precision) {
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

    update(delta) {
        this.totalForce = Vector.newZero();

        // incorporate gravity
        if (!this.disableGravity) {
            if (!Gravity.isZero()) {
                this.totalForce.add(Vector.multiply(Gravity.current, this.weight));
            } else {
                this.totalForce.add(this.gravity);
            }
        }

        const adjustedDelta = delta / Constants.TIME_SCALE;
        this.totalForce.multiply(this.invWeight);
        this.a = Vector.multiply(this.totalForce, adjustedDelta);
        this.v.add(this.a);

        this.posDelta = Vector.multiply(this.v, adjustedDelta);
        this.pos.add(this.posDelta);
    }

    applyImpulse(impulse, delta) {
        if (!impulse.isZero()) {
            const im = Vector.multiply(impulse, delta / Constants.TIME_SCALE);
            this.pos.add(im);
        }
    }
}

export default MaterialPoint;
