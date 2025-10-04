define("physics/ConstraintSystem", [
  "utils/Class",
  "core/Vector",
  "utils/Log",
  "physics/satisfyConstraintArray",
], function (Class, Vector, Log, satisfyConstraintArray) {
  var ConstraintSystem = Class.extend({
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
      for (var i = 0, partsLen = this.parts.length; i < partsLen; i++) {
        var cp = this.parts[i];
        Log.debug("-- Point: " + cp.posString());
        for (
          var j = 0, constraintsLen = cp.constraints.length;
          j < constraintsLen;
          j++
        ) {
          var c = cp.constraints[j];
          var cInfo =
            "---- Constraint: " + c.cp.posString() + " len: " + c.restLength;
          Log.debug(cInfo);
        }
      }
    },
    removePartAtIndex: function (index) {
      this.parts.splice(index, 1);
    },
    update: function (delta) {
      var parts = this.parts,
        numParts = parts.length,
        relaxationTimes = this.relaxationTimes;

      // update each part
      for (var i = 0; i < numParts; i++) {
        parts[i].update(delta);
      }

      // satisfy constraints during each relaxation period

      satisfyConstraintArray(parts, relaxationTimes);
    },

    // NOTE: base draw() implementation isn't used so we won't port it yet
  });

  return ConstraintSystem;
});
