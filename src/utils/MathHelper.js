import Constants from "@/utils/Constants";

/**
 * Math utility class providing various mathematical helper functions
 */
class MathHelper {
    /**
     * Fits value v to [minV, maxV]
     * @param {number} v value
     * @param {number} minV
     * @param {number} maxV
     * @return {number}
     */
    static fitToBoundaries(v, minV, maxV) {
        return Math.max(Math.min(v, maxV), minV);
    }

    /**
     * Returns true if values have the same sign
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    static sameSign(x, y) {
        return x < 0 === y < 0;
    }

    /**
     * Returns a random integer from the interval
     * @param {number} from
     * @param {number} to
     */
    static randomRange(from, to) {
        return ~~(Math.random() * (to - from + 1) + from);
    }

    static randomBool() {
        return Math.random() > 0.5;
    }

    static randomMinus1to1() {
        return Math.random() * 2 - 1;
    }

    /**
     * Returns the max of 4 numbers
     * @param {number} v1
     * @param {number} v2
     * @param {number} v3
     * @param {number} v4
     * @return {number}
     */
    static maxOf4(v1, v2, v3, v4) {
        if (v1 >= v2 && v1 >= v3 && v1 >= v4) return v1;
        if (v2 >= v1 && v2 >= v3 && v2 >= v4) return v2;
        if (v3 >= v2 && v3 >= v1 && v3 >= v4) return v3;
        if (v4 >= v2 && v4 >= v3 && v4 >= v1) return v4;

        return Constants.UNDEFINED;
    }

    /**
     * Returns the minimum of 4 numbers
     * @param {number} v1
     * @param {number} v2
     * @param {number} v3
     * @param {number} v4
     * @return {number}
     */
    static minOf4(v1, v2, v3, v4) {
        if (v1 <= v2 && v1 <= v3 && v1 <= v4) return v1;
        if (v2 <= v1 && v2 <= v3 && v2 <= v4) return v2;
        if (v3 <= v2 && v3 <= v1 && v3 <= v4) return v3;
        if (v4 <= v2 && v4 <= v3 && v4 <= v1) return v4;

        return Constants.UNDEFINED;
    }

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} x3
     * @param {number} y3
     * @param {number} x4
     * @param {number} y4
     * @return {boolean}
     */
    static lineInLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        //let DPx, DPy, QAx, QAy, QBx, QBy, d, la, lb;

        const DPx = x3 - x1 + x4 - x2;
        const DPy = y3 - y1 + y4 - y2;
        const QAx = x2 - x1;
        const QAy = y2 - y1;
        const QBx = x4 - x3;
        const QBy = y4 - y3;
        const d = QAy * QBx - QBy * QAx;
        const la = QBx * DPy - QBy * DPx;
        const lb = QAx * DPy - QAy * DPx;

        const absD = Math.abs(d);
        return Math.abs(la) <= absD && Math.abs(lb) <= absD;
    }

    // round to arbitrary precision
    /**
     * @param {number} value
     * @param {number} precision
     */
    static roundPrecision(value, precision) {
        const scalar = Math.pow(10, precision);
        return Math.round(value * scalar) / scalar;
    }

    // round to 2 decimals of precision
    /**
     * @param {number} value
     */
    static roundP2(value) {
        return Math.round(value * 100) / 100;
    }
}

export default MathHelper;
