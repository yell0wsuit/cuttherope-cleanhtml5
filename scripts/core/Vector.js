define("core/Vector", [], function () {
  /**
   * Vector constructor
   * @constructor
   * @param x {number}
   * @param y {number}
   */
  function Vector(x, y) {
    this.x = x;
    this.y = y;
  }

  Vector.prototype.add = function (v2) {
    this.x += v2.x;
    this.y += v2.y;
  };

  Vector.prototype.subtract = function (v2) {
    this.x -= v2.x;
    this.y -= v2.y;
  };

  Vector.prototype.multiply = function (s) {
    this.x *= s;
    this.y *= s;
  };

  Vector.prototype.divide = function (s) {
    this.x /= s;
    this.y /= s;
  };

  Vector.prototype.distance = function (v2) {
    var tx = this.x - v2.x,
      ty = this.y - v2.y,
      dot = tx * tx + ty * ty;
    return Math.sqrt(dot);
  };

  Vector.prototype.getLength = function () {
    var dot = this.x * this.x + this.y * this.y;
    return Math.sqrt(dot);
  };

  /**
   * @param v2 {Vector}
   * @return {number}
   */
  Vector.prototype.getDot = function (v2) {
    return this.x * v2.x + this.y * v2.y;
  };

  /**
   * @return {boolean}
   */
  Vector.prototype.isZero = function () {
    return this.x === 0 && this.y === 0;
  };

  /**
   * @param v2 {Vector}
   * @return {boolean}
   */
  Vector.prototype.equals = function (v2) {
    return this.x === v2.x && this.y === v2.y;
  };

  Vector.prototype.setToZero = function () {
    this.x = 0;
    this.y = 0;
  };

  Vector.prototype.normalize = function () {
    this.multiply(1 / this.getLength());
  };

  /** @return {number} */
  Vector.prototype.angle = function () {
    return Math.atan(this.y / this.x);
  };

  /** @return {number} */
  Vector.prototype.normalizedAngle = function () {
    // Note: y goes first in Math.atan2()
    return Math.atan2(this.y, this.x);
  };

  /** @return {Vector} */
  Vector.prototype.copy = function () {
    return new Vector(this.x, this.y);
  };

  /**
   * Copies the values from another vector
   * @param v {Vector} source vector
   */
  Vector.prototype.copyFrom = function (v) {
    this.x = v.x;
    this.y = v.y;
  };

  Vector.prototype.round = function () {
    this.x = Math.round(this.x);
    //noinspection JSSuspiciousNameCombination
    this.y = Math.round(this.y);
  };

  Vector.prototype.rotate = function (rad) {
    //noinspection UnnecessaryLocalVariableJS
    var cosA = Math.cos(rad),
      sinA = Math.sin(rad),
      nx = this.x * cosA - this.y * sinA,
      ny = this.x * sinA + this.y * cosA;

    this.x = nx;
    this.y = ny;
  };

  Vector.prototype.rotateAround = function (rad, cx, cy) {
    // shift to the rotation point
    this.x -= cx;
    this.y -= cy;

    this.rotate(rad);

    // shift back to original location
    this.x += cx;
    this.y += cy;
  };

  /** @return {string} */
  Vector.prototype.toString = function () {
    return "[" + this.x + ", " + this.y + "]";
  };

  /**
   *  Convenience method to create a new zero-based vector
   *  @return {Vector}
   */
  Vector.newZero = function () {
    return new Vector(0, 0);
  };
  Vector.zero = new Vector(0, 0);

  Vector.newUndefined = function () {
    return new Vector(0x7fffffff, 0x7fffffff);
  };
  Vector.undefined = Vector.newUndefined();

  // NOTE: we want to avoid creating new objects when possible so
  // we have member methods that modify vector instances. We also
  // have static methods below which return a new vector without
  // modifying any source vectors.
  /**
   * @param v1 {Vector}
   * @param v2 {Vector}
   * @return {Vector}
   */
  Vector.add = function (v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  };
  /**
   * @param v1 {Vector}
   * @param v2 {Vector}
   * @return {Vector}
   */
  Vector.subtract = function (v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  };
  /**
   * @param v {Vector}
   * @param s {number} scalar multiplier
   */
  Vector.multiply = function (v, s) {
    return new Vector(v.x * s, v.y * s);
  };
  /**
   * @param v {Vector} source vector
   * @param s {number} scalar divisor
   * @return {Vector}
   */
  Vector.divide = function (v, s) {
    return new Vector(v.x / s, v.y / s);
  };
  Vector.distance = function (x1, y1, x2, y2) {
    var tx = x1 - x2,
      ty = y1 - y2,
      dot = tx * tx + ty * ty;
    return Math.sqrt(dot);
  };
  /**
   * @param v {Vector}
   * @return {Vector}
   */
  Vector.perpendicular = function (v) {
    //noinspection JSSuspiciousNameCombination
    return new Vector(-v.y, v.x);
  };
  /**
   * @param v {Vector}
   * @return {Vector}
   */
  Vector.rPerpendicular = function (v) {
    //noinspection JSSuspiciousNameCombination
    return new Vector(v.y, -v.x);
  };
  /**
   * @param v {Vector}
   * @return {Vector}
   */
  Vector.normalize = function (v) {
    return this.multiply(v, 1 / v.getLength());
  };
  /**
   * @param v {Vector}
   * @return {Vector}
   */
  Vector.negate = function (v) {
    return new Vector(-v.x, -v.y);
  };

  // initialize temp arrays used in bezier calcs to avoid allocations
  Vector._tmpBezierX = new Array(64);
  Vector._tmpBezierY = new Array(64);

  Vector.calcPathBezier = function (points, delta) {
    var result = new Vector(0, 0);
    Vector.setCalcPathBezier(points, delta, result);
    return result;
  };

  /**
   * Calculates the bezier path vector
   * @param points {Array.<Vector>}
   * @param delta {number}
   * @param result {Vector}
   */
  Vector.setCalcPathBezier = function (points, delta, result) {
    var count = points.length;
    if (count <= 1) {
      result.x = result.y = 0;
      return;
    }

    var xs = Vector._tmpBezierX,
      ys = Vector._tmpBezierY,
      d1 = 1 - delta;

    for (var j = 0; j < count; j++) {
      var point = points[j];
      xs[j] = point.x;
      ys[j] = point.y;
    }

    var countMinusOne = count - 1;
    for (; countMinusOne > 0; count--, countMinusOne--) {
      var i = 0,
        iPlusOne = 1;
      for (; i < countMinusOne; i++, iPlusOne++) {
        xs[i] = xs[i] * d1 + xs[iPlusOne] * delta;
        ys[i] = ys[i] * d1 + ys[iPlusOne] * delta;
      }
    }
    result.x = xs[0];
    result.y = ys[0];
  };

  /**
   * @param angle {number}
   * @return {Vector}
   */
  Vector.forAngle = function (angle) {
    return new Vector(Math.cos(angle), Math.sin(angle));
  };

  return Vector;
});
