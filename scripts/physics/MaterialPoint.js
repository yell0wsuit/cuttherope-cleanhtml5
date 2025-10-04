define("physics/MaterialPoint", [
  "utils/Class",
  "utils/Constants",
  "core/Vector",
  "physics/Gravity",
], function (Class, Constants, Vector, Gravity) {
  var MaterialPoint = Class.extend({
    init: function () {
      this.disableGravity = false;
      this.setWeight(1);
      this.resetAll();
    },
    setWeight: function (w) {
      this.weight = w;
      this.invWeight = 1 / w;
      this.gravity = new Vector(0, Constants.EARTH_Y * w);
    },
    resetAll: function () {
      var newZero = Vector.newZero;
      this.v = newZero(); // velocity vector
      this.a = newZero(); // acceleration vector
      this.pos = newZero();
      this.posDelta = newZero();
      this.totalForce = newZero();
    },
    updateWithPrecision: function (delta, precision) {
      // Calculate number Of iterations to be made at this update depending
      // on maxPossible_dt And dt (chop off fractional part and add 1)
      var numIterations = ((delta / precision) >> 0) + 1;

      // update delta based on num of iterations
      if (numIterations != 0) {
        // avoid division by zero
        delta = delta / numIterations;
      }

      for (var i = 0; i < numIterations; i++) {
        this.update(delta);
      }
    },
    update: function (delta) {
      this.totalForce = Vector.newZero();

      // incorporate gravity
      if (!this.disableGravity) {
        if (!Gravity.isZero()) {
          this.totalForce.add(Vector.multiply(Gravity.current, this.weight));
        } else {
          this.totalForce.add(this.gravity);
        }
      }

      var adjustedDelta = delta / Constants.TIME_SCALE;
      this.totalForce.multiply(this.invWeight);
      this.a = Vector.multiply(this.totalForce, adjustedDelta);
      this.v.add(this.a);

      this.posDelta = Vector.multiply(this.v, adjustedDelta);
      this.pos.add(this.posDelta);
    },
    applyImpulse: function (impulse, delta) {
      if (!impulse.isZero()) {
        var im = Vector.multiply(impulse, delta / Constants.TIME_SCALE);
        this.pos.add(im);
      }
    },
  });

  return MaterialPoint;
});
