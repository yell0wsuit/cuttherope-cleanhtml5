import Vector from "@/core/Vector";
/**
 * Rectangle constructor
 * @constructor
 * @param x {number}
 * @param y {number}
 * @param w {number} width
 * @param h {number} height
 */
class Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    static copy(r: Rectangle): Rectangle {
        return new Rectangle(r.x, r.y, r.w, r.h);
    }
    static scaleCopy(r: Rectangle, scale: number): Rectangle {
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
 * @param x_min {number}
 * @param y_min {number}
 * @param x_max {number}
 * @param y_max {number}
 * @param p {Vector}
 * @return {number}
 */
function vcode(x_min: number, y_min: number, x_max: number, y_max: number, p: Vector): number {
    return (
        (p.x < x_min ? COHEN_LEFT : 0) +
        (p.x > x_max ? COHEN_RIGHT : 0) +
        (p.y < y_min ? COHEN_BOT : 0) +
        (p.y > y_max ? COHEN_TOP : 0)
    );
}

export default Rectangle;
