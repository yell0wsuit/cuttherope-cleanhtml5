import MathHelper from "@/utils/MathHelper";
import Vector from "@/core/Vector";

class Mover {
    static MAX_CAPACITY: number;
    angle: number;
    pathCapacity: number;
    rotateSpeed: number;
    path: never[];
    moveSpeed: number[];
    pos: Vector;
    targetPoint: number;
    offset: Vector;
    paused: boolean;
    reverse: boolean;
    overrun: number;

    /**
     * @param {number} pathCapacity
     * @param {number} moveSpeed
     * @param {number} rotateSpeed
     */
    constructor(pathCapacity: number, moveSpeed: number, rotateSpeed: number) {
        this.pathCapacity = pathCapacity;
        this.rotateSpeed = rotateSpeed || 0;
        /**
         * @type {Vector[]}
         */
        this.path = [];
        /**
         * @type {number[]}
         */
        this.moveSpeed = new Array(pathCapacity > 0 ? pathCapacity : 0);
        if (pathCapacity > 0) {
            for (let i = 0; i < pathCapacity; i++) {
                this.moveSpeed[i] = moveSpeed || 0;
            }
        }
        this.pos = new Vector(0, 0);
        this.angle = 0;
        this.targetPoint = 0;
        this.offset = new Vector(0, 0);
        this.paused = false;
        this.reverse = false;
        this.overrun = 0;
    }

    /**
     * @param {number} speed
     */
    setMoveSpeed(speed: number) {
        for (let i = 0, len = this.pathCapacity; i < len; i++) {
            this.moveSpeed[i] = speed;
        }
    }

    /**
     * @param {string} path
     * @param {Vector} start
     */
    setPathFromString(path: string, start: Vector) {
        if (path[0] === "R") {
            const clockwise = path[1] === "C",
                rad = parseInt(path.slice(2), 10),
                pointsCount = rad / 2;
            let kIncrement = (2 * Math.PI) / pointsCount,
                theta = 0;

            if (!clockwise) kIncrement = -kIncrement;

            for (let i = 0; i < pointsCount; ++i) {
                const nx = start.x + rad * Math.cos(theta),
                    ny = start.y + rad * Math.sin(theta);

                this.addPathPoint(new Vector(nx, ny));
                theta += kIncrement;
            }
        } else {
            this.addPathPoint(start.copy());

            // remove the trailing comma
            if (path[path.length - 1] === ",") {
                path = path.slice(0, path.length - 1);
            }

            const parts = path.split(","),
                len = parts.length;

            let i;
            for (i = 0; i < len; i += 2) {
                const xs = parseFloat(parts[i]),
                    ys = parseFloat(parts[i + 1]),
                    pathPoint = new Vector(start.x + xs, start.y + ys);
                this.addPathPoint(pathPoint);
            }
        }
    }

    /**
     * @param {Vector} pathPoint
     */
    addPathPoint(pathPoint: Vector) {
        this.path.push(pathPoint);
    }

    start() {
        if (this.path.length > 0) {
            this.pos.copyFrom(this.path[0]);
            this.targetPoint = 1;
            this.calculateOffset();
        }
    }

    pause() {
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }

    /**
     * @param {number} rotateSpeed
     */
    setRotateSpeed(rotateSpeed: number) {
        this.rotateSpeed = rotateSpeed;
    }

    /**
     * @param {number} point
     */
    jumpToPoint(point: number) {
        this.targetPoint = point;
        this.pos.copyFrom(this.path[point]);
        this.calculateOffset();
    }

    calculateOffset() {
        const target = this.path[this.targetPoint];
        this.offset = Vector.subtract(target, this.pos);
        this.offset.normalize();
        this.offset.multiply(this.moveSpeed[this.targetPoint]);
    }

    /**
     * @param {number} moveSpeed
     * @param {number} index
     */
    setMoveSpeedAt(moveSpeed: number, index: number) {
        this.moveSpeed[index] = moveSpeed;
    }

    /**
     * @param {boolean} reverse
     */
    setMoveReverse(reverse: boolean) {
        this.reverse = reverse;
    }

    /**
     * @param {number} delta
     */
    update(delta: number) {
        if (this.paused) return;

        if (this.path.length > 0) {
            const target = this.path[this.targetPoint];
            let switchPoint = false;

            if (!this.pos.equals(target)) {
                let rdelta = delta;
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
    }

    // Static methods
    /**
     * @param {number} v
     * @param {number} t
     * @param {number} speed
     * @param {number} delta
     */
    static moveToTarget(v: number, t: number, speed: number, delta: number) {
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
    }

    /**
     *
     * @param {number} v value
     * @param {number} t target
     * @param {number} speed
     * @param {number} delta
     * @return {Object}
     */
    static moveToTargetWithStatus(v: number, t: number, speed: number, delta: number): object {
        let reachedZero = false;
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
    }
}

// NOTE: sometimes we need the status indicating whether the
// variable was moved to zero. However, for performance we'll
// offer another version without status.

/**
 * @const
 * @type {number}
 */
Mover.MAX_CAPACITY = 100;

export default Mover;
