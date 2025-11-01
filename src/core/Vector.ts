/**
 * Vector constructor
 * @constructor
 * @param {number} x
 * @param {number} y
 */
class Vector {
    y: number;
    x: number;

    // Static properties
    static zero: Vector = new Vector(0, 0);
    static undefined: Vector = Vector.newUndefined();
    static _tmpBezierX: number[] = new Array(64);
    static _tmpBezierY: number[] = new Array(64);

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    /**
     *  Convenience method to create a new zero-based vector
     *  @return {Vector}
     */
    static newZero(): Vector {
        return new Vector(0, 0);
    }
    static newUndefined() {
        return new Vector(0x7fffffff, 0x7fffffff);
    }
    // NOTE: we want to avoid creating new objects when possible so
    // we have member methods that modify vector instances. We also
    // have static methods below which return a new vector without
    // modifying any source vectors.
    /**
     * @param {Vector} v1
     * @param {Vector} v2
     * @return {Vector}
     */
    static add(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }
    /**
     * @param {Vector} v1
     * @param {Vector} v2
     * @return {Vector}
     */
    static subtract(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }
    /**
     * @param {Vector} v
     * @param {number} s scalar multiplier
     */
    static multiply(v: Vector, s: number) {
        return new Vector(v.x * s, v.y * s);
    }
    /**
     * @param {Vector} v source vector
     * @param {number} s scalar divisor
     * @return {Vector}
     */
    static divide(v: Vector, s: number): Vector {
        return new Vector(v.x / s, v.y / s);
    }
    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    static distance(x1: number, y1: number, x2: number, y2: number) {
        const tx = x1 - x2;
        const ty = y1 - y2;
        const dot = tx * tx + ty * ty;
        return Math.sqrt(dot);
    }
    /**
     * @param {Vector} v
     * @return {Vector}
     */
    static perpendicular(v: Vector): Vector {
        //noinspection JSSuspiciousNameCombination
        return new Vector(-v.y, v.x);
    }
    /**
     * @param {Vector} v
     * @return {Vector}
     */
    static rPerpendicular(v: Vector): Vector {
        //noinspection JSSuspiciousNameCombination
        return new Vector(v.y, -v.x);
    }
    /**
     * @param {Vector} v
     * @return {Vector}
     */
    static normalize(v: Vector): Vector {
        return this.multiply(v, 1 / v.getLength());
    }
    /**
     * @param {Vector} v
     * @return {Vector}
     */
    static negate(v: Vector): Vector {
        return new Vector(-v.x, -v.y);
    }
    /**
     * @param {Vector[]} points
     * @param {number} delta
     */
    static calcPathBezier(points: Vector[], delta: number) {
        const result = new Vector(0, 0);
        Vector.setCalcPathBezier(points, delta, result);
        return result;
    }
    /**
     * Calculates the bezier path vector
     * @param {Vector[]} points
     * @param {number} delta
     * @param {Vector} result
     */
    static setCalcPathBezier(points: Vector[], delta: number, result: Vector) {
        let count = points.length;
        if (count <= 1) {
            result.x = result.y = 0;
            return;
        }

        const xs = Vector._tmpBezierX;
        const ys = Vector._tmpBezierY;
        const d1 = 1 - delta;

        for (let j = 0; j < count; j++) {
            const point = points[j]!;
            xs[j] = point.x;
            ys[j] = point.y;
        }

        let countMinusOne = count - 1;
        for (; countMinusOne > 0; count--, countMinusOne--) {
            let i = 0,
                iPlusOne = 1;
            for (; i < countMinusOne; i++, iPlusOne++) {
                xs[i] = xs[i]! * d1 + xs[iPlusOne]! * delta;
                ys[i] = ys[i]! * d1 + ys[iPlusOne]! * delta;
            }
        }
        result.x = xs[0]!;
        result.y = ys[0]!;
    }
    /**
     * @param {number} angle
     * @return {Vector}
     */
    static forAngle(angle: number): Vector {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
    getLength() {
        const dot = this.x * this.x + this.y * this.y;
        return Math.sqrt(dot);
    }
    /**
     * @param {Vector} v2
     * @return {number}
     */
    getDot(v2: Vector): number {
        return this.x * v2.x + this.y * v2.y;
    }
    /**
     * @return {boolean}
     */
    isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }
    /**
     * @param {Vector} v2
     * @return {boolean}
     */
    equals(v2: Vector): boolean {
        return this.x === v2.x && this.y === v2.y;
    }
    setToZero() {
        this.x = 0;
        this.y = 0;
    }
    /** @return {number} */
    angle(): number {
        return Math.atan(this.y / this.x);
    }
    /** @return {number} */
    normalizedAngle(): number {
        // Note: y goes first in Math.atan2()
        return Math.atan2(this.y, this.x);
    }
    /** @return {Vector} */
    copy(): Vector {
        return new Vector(this.x, this.y);
    }
    /**
     * Copies the values from another vector
     * @param {Vector} v source vector
     */
    copyFrom(v: Vector) {
        this.x = v.x;
        this.y = v.y;
    }
    round() {
        this.x = Math.round(this.x);
        //noinspection JSSuspiciousNameCombination
        this.y = Math.round(this.y);
    }
    /**
     * @param {number} rad
     */
    rotate(rad: number) {
        //noinspection UnnecessaryLocalVariableJS
        const cosA = Math.cos(rad),
            sinA = Math.sin(rad),
            nx = this.x * cosA - this.y * sinA,
            ny = this.x * sinA + this.y * cosA;

        this.x = nx;
        this.y = ny;
    }
    /**
     * @param {number} rad
     * @param {number} cx
     * @param {number} cy
     */
    rotateAround(rad: number, cx: number, cy: number) {
        // shift to the rotation point
        this.x -= cx;
        this.y -= cy;

        this.rotate(rad);

        // shift back to original location
        this.x += cx;
        this.y += cy;
    }
    /** @return {string} */
    toString(): string {
        return `[${this.x}, ${this.y}]`;
    }
    /**
     * Add another vector to this vector (modifies this vector)
     * @param {Vector} v2
     */
    add(v2: Vector) {
        this.x += v2.x;
        this.y += v2.y;
    }
    /**
     * Subtract another vector from this vector (modifies this vector)
     * @param {Vector} v2
     */
    subtract(v2: Vector) {
        this.x -= v2.x;
        this.y -= v2.y;
    }
    /**
     * Multiply this vector by a scalar (modifies this vector)
     * @param {number} s scalar multiplier
     */
    multiply(s: number) {
        this.x *= s;
        this.y *= s;
    }
    /**
     * Divide this vector by a scalar (modifies this vector)
     * @param {number} s scalar divisor
     */
    divide(s: number) {
        this.x /= s;
        this.y /= s;
    }
    /**
     * Calculate distance to another vector
     * @param {Vector} v2
     * @return {number}
     */
    distance(v2: Vector): number {
        const tx = this.x - v2.x;
        const ty = this.y - v2.y;
        const dot = tx * tx + ty * ty;
        return Math.sqrt(dot);
    }
    /**
     * Normalize this vector (modifies this vector)
     */
    normalize() {
        this.multiply(1 / this.getLength());
    }
}

export default Vector;
