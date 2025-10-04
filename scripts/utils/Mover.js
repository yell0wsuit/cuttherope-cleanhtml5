define("utils/Mover", [
  "utils/Class",
  "utils/MathHelper",
  "core/Vector",
], function (Class, MathHelper, Vector) {
  var Mover = Class.extend({
    init: function (pathCapacity, moveSpeed, rotateSpeed) {
      this.pathCapacity = pathCapacity;
      this.rotateSpeed = rotateSpeed || 0;
      this.path = [];
      if (pathCapacity > 0) {
        this.moveSpeed = new Array(pathCapacity);
        for (var i = 0; i < pathCapacity; i++) {
          this.moveSpeed[i] = moveSpeed || 0;
        }
      }
      this.pos = new Vector(0, 0);
      this.angle = 0;
      this.paused = false;
      this.reverse = false;
      this.overrun = 0;
    },
    setMoveSpeed: function (speed) {
      for (var i = 0, len = this.pathCapacity; i < len; i++) {
        this.moveSpeed[i] = speed;
      }
    },
    /**
     * @param path {string}
     * @param start {Vector}
     */
    setPathFromString: function (path, start) {
      if (path[0] === "R") {
        var clockwise = path[1] === "C",
          rad = parseInt(path.substr(2), 10),
          pointsCount = rad / 2,
          kIncrement = (2 * Math.PI) / pointsCount,
          theta = 0;

        if (!clockwise) kIncrement = -kIncrement;

        for (var i = 0; i < pointsCount; ++i) {
          var nx = start.x + rad * Math.cos(theta),
            ny = start.y + rad * Math.sin(theta);

          this.addPathPoint(new Vector(nx, ny));
          theta += kIncrement;
        }
      } else {
        this.addPathPoint(start.copy());

        // remove the trailing comma
        if (path[path.length - 1] === ",") {
          path = path.substr(0, path.length - 1);
        }

        var parts = path.split(","),
          len = parts.length;
        for (i = 0; i < len; i += 2) {
          var xs = parseFloat(parts[i]),
            ys = parseFloat(parts[i + 1]),
            pathPoint = new Vector(start.x + xs, start.y + ys);
          this.addPathPoint(pathPoint);
        }
      }
    },
    /**
     * @param pathPoint {Vector}
     */
    addPathPoint: function (pathPoint) {
      this.path.push(pathPoint);
    },
    start: function () {
      if (this.path.length > 0) {
        this.pos.copyFrom(this.path[0]);
        this.targetPoint = 1;
        this.calculateOffset();
      }
    },
    pause: function () {
      this.paused = true;
    },
    unpause: function () {
      this.paused = false;
    },
    setRotateSpeed: function (rotateSpeed) {
      this.rotateSpeed = rotateSpeed;
    },
    jumpToPoint: function (point) {
      this.targetPoint = point;
      this.pos.copyFrom(this.path[point]);
      this.calculateOffset();
    },
    calculateOffset: function () {
      var target = this.path[this.targetPoint];
      this.offset = Vector.subtract(target, this.pos);
      this.offset.normalize();
      this.offset.multiply(this.moveSpeed[this.targetPoint]);
    },
    setMoveSpeedAt: function (moveSpeed, index) {
      this.moveSpeed[index] = moveSpeed;
    },
    setMoveReverse: function (reverse) {
      this.reverse = reverse;
    },
    update: function (delta) {
      if (this.paused) return;

      if (this.path.length > 0) {
        var target = this.path[this.targetPoint],
          switchPoint = false;

        if (!this.pos.equals(target)) {
          var rdelta = delta;
          if (this.overrun !== 0) {
            rdelta += this.overrun;
            this.overrun = 0;
          }

          this.pos.add(Vector.multiply(this.offset, rdelta));

          // see if we passed the target
          if (
            !MathHelper.sameSign(this.offset.x, target.x - this.pos.x) ||
            !MathHelper.sameSign(this.offset.y, target.y - this.pos.y)
          ) {
            this.overrun = Vector.subtract(this.pos, target).getLength();

            // overrun in seconds
            this.overrun /= this.offset.getLength();
            this.pos.copyFrom(target);
            switchPoint = true;
          }
        } else {
          switchPoint = true;
        }

        if (switchPoint) {
          if (this.reverse) {
            this.targetPoint--;
            if (this.targetPoint < 0) {
              this.targetPoint = this.path.length - 1;
            }
          } else {
            this.targetPoint++;
            if (this.targetPoint >= this.path.length) {
              this.targetPoint = 0;
            }
          }

          this.calculateOffset();
        }
      }

      if (this.rotateSpeed !== 0) {
        this.angle += this.rotateSpeed * delta;
      }
    },
  });

  // NOTE: sometimes we need the status indicating whether the
  // variable was moved to zero. However, for performance we'll
  // offer another version without status.

  Mover.moveToTarget = function (v, t, speed, delta) {
    if (t !== v) {
      if (t > v) {
        v += speed * delta;
        if (v > t) {
          v = t;
        }
      } else {
        v -= speed * delta;
        if (v < t) {
          v = t;
        }
      }
    }
    return v;
  };
  /**
   *
   * @param v {number} value
   * @param t {number} target
   * @param speed {number}
   * @param delta {number}
   * @return {Object}
   */
  Mover.moveToTargetWithStatus = function (v, t, speed, delta) {
    var reachedZero = false;
    if (t !== v) {
      if (t > v) {
        v += speed * delta;
        if (v > t) {
          v = t;
        }
      } else {
        v -= speed * delta;
        if (v < t) {
          v = t;
        }
      }
      if (t === v) reachedZero = true;
    }

    return {
      value: v,
      reachedZero: reachedZero,
    };
  };

  /**
   * @const
   * @type {number}
   */
  Mover.MAX_CAPACITY = 100;

  return Mover;
});
