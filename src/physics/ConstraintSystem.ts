import Vector from "@/core/Vector";
import Log from "@/utils/Log";
import satisfyConstraintArray from "@/physics/satisfyConstraintArray";
import type ConstrainedPoint from "./ConstrainedPoint";

class ConstraintSystem {
    relaxationTimes: number;
    parts: never[];
    constructor() {
        this.relaxationTimes = 1;
        /**
         * @type {ConstrainedPoint[]}
         */
        this.parts = [];
    }

    /**
     * @param {ConstrainedPoint} cp
     * @param {number} index
     */
    addPartAtIndex(cp: ConstrainedPoint, index: number) {
        // splice with removeLength=0 means we just insert
        // the additional element (cp) at the index
        this.parts.splice(index, 0, cp);
    }

    /**
     * @param {ConstrainedPoint} cp
     */
    addPart(cp: ConstrainedPoint) {
        this.parts[this.parts.length] = cp;
    }

    log() {
        Log.debug("Constraint System Log:");
        for (let i = 0, partsLen = this.parts.length; i < partsLen; i++) {
            const cp = this.parts[i];
            Log.debug(`-- Point: ${cp.posString()}`);
            for (let j = 0, constraintsLen = cp.constraints.length; j < constraintsLen; j++) {
                const c = cp.constraints[j];
                const cInfo = `---- Constraint: ${c.cp.posString()} len: ${c.restLength}`;
                Log.debug(cInfo);
            }
        }
    }

    /**
     * @param {number} index
     */
    removePartAtIndex(index: number) {
        this.parts.splice(index, 1);
    }

    /**
     * @param {number} delta
     */
    update(delta: number) {
        const parts = this.parts;
        const numParts = parts.length;
        const relaxationTimes = this.relaxationTimes;

        // update each part
        for (let i = 0; i < numParts; i++) {
            parts[i].update(delta);
        }

        // satisfy constraints during each relaxation period
        satisfyConstraintArray(parts, relaxationTimes);
    }

    // NOTE: base draw() implementation isn't used so we won't port it yet
}

export default ConstraintSystem;
