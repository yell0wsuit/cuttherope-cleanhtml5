import Vector from "@/core/Vector";

/**
 * Rectangle constructor
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param w {number} width
 * @param h {number} height
 */
class Rectangle {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */

    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    /**
     * @param {{ x: number; y: number; w: number; h: number; }} r
     */
    static copy(r) {
        return new Rectangle(r.x, r.y, r.w, r.h);
    }

    /**
     * @param {{ x: number; y: number; w: number; h: number; }} r
     * @param {number} scale
     */
    static scaleCopy(r, scale) {
        return new Rectangle(r.x * scale, r.y * scale, r.w * scale, r.h * scale);
    }
    /**
     * Returns true if rectangles overlap (used in collision detection)
     * @param x1l {number}
     * @param y1t {number}
     * @param x1r {number}
     * @param y1b {number}
     * @param x2l {number}
     * @param y2t {number}
     * @param x2r {number}
     * @param y2b {number}
     * @return {boolean}
     */
    static rectInRect(x1l, y1t, x1r, y1b, x2l, y2t, x2r, y2b) {
        return !(x1l > x2r || x1r < x2l || y1t > y2b || y1b < y2t);
    }
    /**
     * get intersection rectangle, it's 0,0 is in the r1 top left corner
     *
     * // first rectangle
     * @param r1x {number}
     * @param r1y {number}
     * @param r1w {number}
     * @param r1h {number}
     *
     * // second rectangle
     * @param r2x {number}
     * @param r2y {number}
     * @param r2w {number}
     * @param r2h {number}
     *
     * @return {Rectangle}
     */
    static rectInRectIntersection(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        const res = new Rectangle(r2x - r1x, r2y - r1y, r2w, r2h);

        if (res.x < 0) {
            res.w += res.x;
            res.x = 0;
        }
        if (res.x + res.w > r1w) {
            res.w = r1w - res.x;
        }
        if (res.y < 0) {
            res.h += res.y;
            res.y = 0;
        }
        if (res.y + res.h > r1h) {
            res.h = r1h - res.y;
        }

        return res;
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} checkX
     * @param {number} checkY
     * @param {number} checkWidth
     * @param {number} checkHeight
     */
    static pointInRect(x, y, checkX, checkY, checkWidth, checkHeight) {
        return x >= checkX && x < checkX + checkWidth && y >= checkY && y < checkY + checkHeight;
    }
    /**
     * Cohen-Sutherland algorithm from russian wikipedia
     * @param x1 {number}
     * @param y1 {number}
     * @param x2 {number}
     * @param y2 {number}
     * @param rx {number}
     * @param ry {number}
     * @param w {number}
     * @param h {number}
     * @return {boolean}
     */
    static lineInRect(x1, y1, x2, y2, rx, ry, w, h) {
        let code_a, code_b, code;
        const a = new Vector(x1, y1),
            b = new Vector(x2, y2);
        let c;

        //noinspection UnnecessaryLocalVariableJS
        const x_min = rx,
            y_min = ry,
            x_max = rx + w,
            y_max = ry + h;

        code_a = vcode(x_min, y_min, x_max, y_max, a);
        code_b = vcode(x_min, y_min, x_max, y_max, b);

        while (code_a || code_b) {
            if (code_a & code_b) {
                return false;
            }

            if (code_a) {
                code = code_a;
                c = a;
            } else {
                code = code_b;
                c = b;
            }

            if (code & COHEN_LEFT) {
                c.y += ((y1 - y2) * (x_min - c.x)) / (x1 - x2);
                c.x = x_min;
            } else if (code & COHEN_RIGHT) {
                c.y += ((y1 - y2) * (x_max - c.x)) / (x1 - x2);
                c.x = x_max;
            }

            if (code & COHEN_BOT) {
                c.x += ((x1 - x2) * (y_min - c.y)) / (y1 - y2);
                c.y = y_min;
            } else if (code & COHEN_TOP) {
                c.x += ((x1 - x2) * (y_max - c.y)) / (y1 - y2);
                c.y = y_max;
            }

            if (code == code_a) {
                code_a = vcode(x_min, y_min, x_max, y_max, a);
            } else {
                code_b = vcode(x_min, y_min, x_max, y_max, b);
            }
        }

        //release from pool
        return true;
    }
}

/**
 * @const
 * @type {number}
 */
const COHEN_LEFT = 1;

/**
 * @const
 * @type {number}
 */
const COHEN_RIGHT = 2;

/**
 * @const
 * @type {number}
 */
const COHEN_BOT = 4;
/**
 * @const
 * @type {number}
 */
const COHEN_TOP = 8;

/**
 * @param x_min {number}
 * @param y_min {number}
 * @param x_max {number}
 * @param y_max {number}
 * @param p {Vector}
 * @return {number}
 */
function vcode(x_min, y_min, x_max, y_max, p) {
    return (
        (p.x < x_min ? COHEN_LEFT : 0) +
        (p.x > x_max ? COHEN_RIGHT : 0) +
        (p.y < y_min ? COHEN_BOT : 0) +
        (p.y > y_max ? COHEN_TOP : 0)
    );
}

export default Rectangle;
