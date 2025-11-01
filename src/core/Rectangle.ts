import Vector from "@/core/Vector";

/**
 * Rectangle constructor
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} w width
 * @param {number} h height
 */
class Rectangle {
    /**
     * @type {number}
     */
    x: number;

    /**
     * @type {number}
     */
    y: number;

    /**
     * @type {number}
     */
    w: number;

    /**
     * @type {number}
     */
    h: number;

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    /**
     * @param {{ x: number; y: number; w: number; h: number; }} r
     */
    static copy(r: { x: number; y: number; w: number; h: number }) {
        return new Rectangle(r.x, r.y, r.w, r.h);
    }

    /**
     * @param {{ x: number; y: number; w: number; h: number; }} r
     * @param {number} scale
     */
    static scaleCopy(r: { x: number; y: number; w: number; h: number }, scale: number) {
        return new Rectangle(r.x * scale, r.y * scale, r.w * scale, r.h * scale);
    }
    /**
     * Returns true if rectangles overlap (used in collision detection)
     * @param {number} x1l
     * @param {number} y1t
     * @param {number} x1r
     * @param {number} y1b
     * @param {number} x2l
     * @param {number} y2t
     * @param {number} x2r
     * @param {number} y2b
     * @return {boolean}
     */
    static rectInRect(
        x1l: number,
        y1t: number,
        x1r: number,
        y1b: number,
        x2l: number,
        y2t: number,
        x2r: number,
        y2b: number
    ): boolean {
        return !(x1l > x2r || x1r < x2l || y1t > y2b || y1b < y2t);
    }
    /**
     * get intersection rectangle, it's 0,0 is in the r1 top left corner
     *
     * // first rectangle
     * @param {number} r1x
     * @param {number} r1y
     * @param {number} r1w
     * @param {number} r1h
     *
     * // second rectangle
     * @param {number} r2x
     * @param {number} r2y
     * @param {number} r2w
     * @param {number} r2h
     *
     * @return {Rectangle}
     */
    static rectInRectIntersection(
        r1x: number,
        r1y: number,
        r1w: number,
        r1h: number,
        r2x: number,
        r2y: number,
        r2w: number,
        r2h: number
    ): Rectangle {
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
    static pointInRect(
        x: number,
        y: number,
        checkX: number,
        checkY: number,
        checkWidth: number,
        checkHeight: number
    ) {
        return x >= checkX && x < checkX + checkWidth && y >= checkY && y < checkY + checkHeight;
    }
    /**
     * Cohen-Sutherland algorithm from russian wikipedia
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} rx
     * @param {number} ry
     * @param {number} w
     * @param {number} h
     * @return {boolean}
     */
    static lineInRect(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        rx: number,
        ry: number,
        w: number,
        h: number
    ): boolean {
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
const COHEN_LEFT: number = 1;

/**
 * @const
 * @type {number}
 */
const COHEN_RIGHT: number = 2;

/**
 * @const
 * @type {number}
 */
const COHEN_BOT: number = 4;
/**
 * @const
 * @type {number}
 */
const COHEN_TOP: number = 8;

/**
 * @param {number} x_min
 * @param {number} y_min
 * @param {number} x_max
 * @param {number} y_max
 * @param {Vector} p
 * @return {number}
 */
const vcode = (x_min: number, y_min: number, x_max: number, y_max: number, p: Vector): number => {
    return (
        (p.x < x_min ? COHEN_LEFT : 0) +
        (p.x > x_max ? COHEN_RIGHT : 0) +
        (p.y < y_min ? COHEN_BOT : 0) +
        (p.y > y_max ? COHEN_TOP : 0)
    );
};

export default Rectangle;
