import Class from "utils/Class";
import Vector from "core/Vector";
import Log from "utils/Log";
import satisfyConstraintArray from "physics/satisfyConstraintArray";
const ConstraintSystem = Class.extend({
    init: function () {
        this.relaxationTimes = 1;

        this.parts = [];
    },
    addPartAtIndex: function (cp, index) {
        // splice with removeLength=0 means we just insert
        // the additional element (cp) at the index
        this.parts.splice(index, 0, cp);
    },
    addPart: function (cp) {
        this.parts[this.parts.length] = cp;
    },
    log: function () {
        Log.debug("Constraint System Log:");
        for (let i = 0, partsLen = this.parts.length; i < partsLen; i++) {
            const cp = this.parts[i];
            Log.debug("-- Point: " + cp.posString());
            for (let j = 0, constraintsLen = cp.constraints.length; j < constraintsLen; j++) {
                const c = cp.constraints[j];
                const cInfo = "---- Constraint: " + c.cp.posString() + " len: " + c.restLength;
                Log.debug(cInfo);
            }
        }
    },
    removePartAtIndex: function (index) {
        this.parts.splice(index, 1);
    },
    update: function (delta) {
        const parts = this.parts,
            numParts = parts.length,
            relaxationTimes = this.relaxationTimes;

        // update each part
        for (let i = 0; i < numParts; i++) {
            parts[i].update(delta);
        }

        // satisfy constraints during each relaxation period

        satisfyConstraintArray(parts, relaxationTimes);
    },

    // NOTE: base draw() implementation isn't used so we won't port it yet
});

export default ConstraintSystem;
