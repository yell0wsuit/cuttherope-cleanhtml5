import ConstraintType from "@/physics/ConstraintType";
import MaterialPoint from "@/physics/MaterialPoint";
import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
import Gravity from "@/physics/Gravity";
class Constraint {
    constructor(cp, restLength, type) {
        this.cp = cp;
        this.restLength = restLength;
        this.type = type;
    }
}

const ConstrainedPoint = MaterialPoint.extend({
    init: function () {
        this.prevPos = new Vector(Constants.INT_MAX, Constants.INT_MAX);
        this.pin = new Vector(Constants.UNDEFINED, Constants.UNDEFINED);
        this.constraints = [];
        this.totalForce = Vector.newZero();
        this._super();
    },

    /**
     * Resets the point by clearing previous position and removing constraints
     */
    resetAll: function () {
        this._super();
        this.prevPos.x = Constants.INT_MAX;
        this.prevPos.y = Constants.INT_MAX;
        this.removeConstraints();
    },
    /**
     * removes all constraints
     */
    removeConstraints: function () {
        this.constraints = [];
    },
    /**
     * Add a new constraint
     * @param cp {ConstrainedPoint}
     * @param restLength {number}
     * @param type {ConstraintType}
     */
    addConstraint: function (cp, restLength, type) {
        const ct = new Constraint(cp, restLength, type);
        this.constraints.push(ct);
    },
    /**
     * Removes the specified constraint
     * @param cp {ConstrainedPoint}
     */
    removeConstraint: function (cp) {
        const constraints = this.constraints,
            len = constraints.length;
        for (let i = 0; i < len; i++) {
            if (constraints[i].cp === cp) {
                constraints.splice(i, 1);
                return;
            }
        }
    },
    /**
     * Removes the constraint at the specified index
     * @param index {number}
     */
    removeConstraintAtIndex: function (index) {
        this.constraints.splice(index, 1);
    },
    /**
     * @param fromCp {ConstrainedPoint}
     * @param toCp {ConstrainedPoint}
     */
    changeConstraint: function (fromCp, toCp) {
        const constraints = this.constraints,
            len = constraints.length;
        for (let i = 0; i < len; i++) {
            const constraint = constraints[i];
            if (constraint.cp === fromCp) {
                constraint.cp = toCp;
                return;
            }
        }
    },
    /**
     * Returns true if the constrained point is used by a constraint in the system
     * @param cp {ConstrainedPoint}
     * @return {boolean}
     */
    hasConstraint: function (cp) {
        const constraints = this.constraints,
            len = constraints.length;
        for (let i = 0; i < len; i++) {
            if (constraints[i].cp === cp) {
                return true;
            }
        }

        return false;
    },
    /**
     * @param cp {ConstrainedPoint}
     * @param restLength {number}
     */
    changeRestLength: function (cp, restLength) {
        const constraints = this.constraints,
            len = constraints.length;
        for (let i = 0; i < len; i++) {
            const constraint = constraints[i];
            if (constraint.cp === cp) {
                constraint.restLength = restLength;
                return;
            }
        }
    },
    /**
     * @param fromCp {ConstrainedPoint}
     * @param toCp {ConstrainedPoint}
     * @param restLength {number}
     */
    changeConstraintAndLength: function (fromCp, toCp, restLength) {
        const constraints = this.constraints,
            len = constraints.length;
        for (let i = 0; i < len; i++) {
            const constraint = constraints[i];
            if (constraint.cp === fromCp) {
                constraint.cp = toCp;
                constraint.restLength = restLength;
                return;
            }
        }
    },
    /**
     * @param cp {ConstrainedPoint}
     * @return {number}
     */
    restLength: function (cp) {
        const constraints = this.constraints,
            len = constraints.length;
        for (let i = 0; i < len; i++) {
            const constraint = constraints[i];
            if (constraint.cp === cp) {
                return constraint.restLength;
            }
        }

        return Constants.UNDEFINED;
    },
    /**
     * @param delta {number}
     */
    update: function (delta) {
        const totalForce = this.totalForce,
            currentGravity = Gravity.current;

        if (!this.disableGravity) {
            if (currentGravity.y !== 0 || currentGravity.x !== 0) {
                totalForce.x = currentGravity.x;
                totalForce.y = currentGravity.y;
            } else {
                totalForce.x = this.gravity.x * this.invWeight;
                totalForce.y = this.gravity.y * this.invWeight;
            }
        } else {
            totalForce.x = 0;
            totalForce.y = 0;
        }

        const aMultiplier = ((delta / Constants.TIME_SCALE) * delta) / Constants.TIME_SCALE;
        this.a.x = this.totalForce.x * aMultiplier;
        this.a.y = this.totalForce.y * aMultiplier;

        if (this.prevPos.x === Constants.INT_MAX) {
            this.prevPos.x = this.pos.x;
            this.prevPos.y = this.pos.y;
        }

        this.posDelta.x = this.pos.x - this.prevPos.x + this.a.x;
        this.posDelta.y = this.pos.y - this.prevPos.y + this.a.y;

        if (delta > 0) {
            const vMultiplier = 1 / delta;
            this.v.x = this.posDelta.x * vMultiplier;
            this.v.y = this.posDelta.y * vMultiplier;
        }

        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;

        this.pos.x += this.posDelta.x;
        this.pos.y += this.posDelta.y;
    },
    satisfyConstraints: function () {
        // NOTE: this method is a perf hotspot so be careful with changes
        const pin = this.pin,
            pos = this.pos,
            invWeight = this.invWeight;
        let tmp1X, tmp1Y, tmp2X, tmp2Y;

        if (pin.x !== -1 /* Constants.UNDEFINED */) {
            pos.x = pin.x;
            pos.y = pin.y;
            return;
        }

        const constraints = this.constraints,
            num = constraints.length;

        for (let i = 0; i < num; i++) {
            const c = constraints[i],
                cp = c.cp,
                cpPos = cp.pos;

            tmp1X = cpPos.x - pos.x;
            tmp1Y = cpPos.y - pos.y;

            if (tmp1X === 0 && tmp1Y === 0) {
                tmp1X = 1;
                tmp1Y = 1;
            }

            const sqrDeltaLength = tmp1X * tmp1X + tmp1Y * tmp1Y, // get dot product inline
                restLength = c.restLength,
                sqrRestLength = restLength * restLength,
                cType = c.type;
            if (cType === 1 /* ConstraintType.NOT_MORE_THAN */) {
                if (sqrDeltaLength <= sqrRestLength) continue;
            } else if (cType === 2 /*ConstraintType.NOT_LESS_THAN */) {
                if (sqrDeltaLength >= sqrRestLength) continue;
            }

            const pinUndefined = cp.pin.x === -1 /* Constants.UNDEFINED */,
                invWeight2 = cp.invWeight,
                deltaLength = Math.sqrt(sqrDeltaLength),
                minDeltaLength = deltaLength > 1 ? deltaLength : 1,
                diff = (deltaLength - restLength) / (minDeltaLength * (invWeight + invWeight2));

            // copy the first position before modification
            if (pinUndefined) {
                tmp2X = tmp1X;
                tmp2Y = tmp1Y;
            }

            const tmp1Multiplier = invWeight * diff;
            tmp1X *= tmp1Multiplier;
            tmp1Y *= tmp1Multiplier;

            pos.x += tmp1X;
            pos.y += tmp1Y;

            if (pinUndefined) {
                const tmp2Multiplier = invWeight2 * diff;
                cpPos.x -= tmp2X * tmp2Multiplier;
                cpPos.y -= tmp2Y * tmp2Multiplier;
            }
        }
    },
    qcpUpdate: function (delta) {
        // qcpUpdate only differs from update in that it includes material
        // force calculations, however those don't appear to be used. So
        // for now, qcpUpdate simply calls update

        this.update(delta);
    },
    posString: function () {
        return `${this.pos.x.toFixed(2)}, ${this.pos.y.toFixed(2)}`;
    },
});

export default ConstrainedPoint;
