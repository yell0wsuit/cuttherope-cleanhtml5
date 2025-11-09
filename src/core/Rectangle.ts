import Vector from "@/core/Vector";

export interface RectangleLike {
    x: number;
    y: number;
    w: number;
    h: number;
}

class Rectangle {
    constructor(
        public x: number,
        public y: number,
        public w: number,
        public h: number
    ) {}

    static copy(r: RectangleLike): Rectangle {
        return new Rectangle(r.x, r.y, r.w, r.h);
    }

    static scaleCopy(r: RectangleLike, scale: number): Rectangle {
        return new Rectangle(r.x * scale, r.y * scale, r.w * scale, r.h * scale);
    }

    /**
     * Returns true if rectangles overlap (used in collision detection)
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
    ): boolean {
        return x >= checkX && x < checkX + checkWidth && y >= checkY && y < checkY + checkHeight;
    }

    /**
     * Cohen-Sutherland algorithm from russian wikipedia
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
        const a = new Vector(x1, y1);
        const b = new Vector(x2, y2);

        const xMin = rx;
        const yMin = ry;
        const xMax = rx + w;
        const yMax = ry + h;

        let codeA = vcode(xMin, yMin, xMax, yMax, a);
        let codeB = vcode(xMin, yMin, xMax, yMax, b);

        while (codeA !== 0 || codeB !== 0) {
            if ((codeA & codeB) !== 0) {
                return false;
            }

            let code: number;
            let current: Vector;
            if (codeA !== 0) {
                code = codeA;
                current = a;
            } else {
                code = codeB;
                current = b;
            }

            if (code & COHEN_LEFT) {
                current.y += ((y1 - y2) * (xMin - current.x)) / (x1 - x2);
                current.x = xMin;
            } else if (code & COHEN_RIGHT) {
                current.y += ((y1 - y2) * (xMax - current.x)) / (x1 - x2);
                current.x = xMax;
            }

            if (code & COHEN_BOT) {
                current.x += ((x1 - x2) * (yMin - current.y)) / (y1 - y2);
                current.y = yMin;
            } else if (code & COHEN_TOP) {
                current.x += ((x1 - x2) * (yMax - current.y)) / (y1 - y2);
                current.y = yMax;
            }

            if (code === codeA) {
                codeA = vcode(xMin, yMin, xMax, yMax, a);
            } else {
                codeB = vcode(xMin, yMin, xMax, yMax, b);
            }
        }

        return true;
    }
}

const COHEN_LEFT = 1;
const COHEN_RIGHT = 2;
const COHEN_BOT = 4;
const COHEN_TOP = 8;

const vcode = (x_min: number, y_min: number, x_max: number, y_max: number, p: Vector): number => {
    return (
        (p.x < x_min ? COHEN_LEFT : 0) +
        (p.x > x_max ? COHEN_RIGHT : 0) +
        (p.y < y_min ? COHEN_BOT : 0) +
        (p.y > y_max ? COHEN_TOP : 0)
    );
};

export default Rectangle;
