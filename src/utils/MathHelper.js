import Constants from "@/utils/Constants";
const MathHelper = {
    /**
     * Fits value v to [minV, maxV]
     * @param v {number} value
     * @param minV {number}
     * @param maxV {number}
     * @return {number}
     */
    fitToBoundaries(v, minV, maxV) {
        return Math.max(Math.min(v, maxV), minV);
    },
    /**
     * Returns true if values have the same sign
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    sameSign(x, y) {
        return x < 0 === y < 0;
    },
    /**
     * Returns a random integer from the interval
     * @param from {number}
     * @param to {number}
     */
    randomRange(from, to) {
        return ~~(Math.random() * (to - from + 1) + from);
    },
    randomBool() {
        return Math.random() > 0.5;
    },
    randomMinus1to1() {
        return Math.random() * 2 - 1;
    },
    /**
     * Returns the max of 4 numbers
     * @param v1 {number}
     * @param v2 {number}
     * @param v3 {number}
     * @param v4 {number}
     * @return {number}
     */
    maxOf4(v1, v2, v3, v4) {
        if (v1 >= v2 && v1 >= v3 && v1 >= v4) return v1;
        if (v2 >= v1 && v2 >= v3 && v2 >= v4) return v2;
        if (v3 >= v2 && v3 >= v1 && v3 >= v4) return v3;
        if (v4 >= v2 && v4 >= v3 && v4 >= v1) return v4;

        return Constants.UNDEFINED;
    },
    /**
     * Returns the minimum of 4 numbers
     * @param v1 {number}
     * @param v2 {number}
     * @param v3 {number}
     * @param v4 {number}
     * @return {number}
     */
    minOf4(v1, v2, v3, v4) {
        if (v1 <= v2 && v1 <= v3 && v1 <= v4) return v1;
        if (v2 <= v1 && v2 <= v3 && v2 <= v4) return v2;
        if (v3 <= v2 && v3 <= v1 && v3 <= v4) return v3;
        if (v4 <= v2 && v4 <= v3 && v4 <= v1) return v4;

        return Constants.UNDEFINED;
    },
    /**
     * @param x1 {number}
     * @param y1 {number}
     * @param x2 {number}
     * @param y2 {number}
     * @param x3 {number}
     * @param y3 {number}
     * @param x4 {number}
     * @param y4 {number}
     * @return {boolean}
     */
    lineInLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        //let DPx, DPy, QAx, QAy, QBx, QBy, d, la, lb;

        const DPx = x3 - x1 + x4 - x2,
            DPy = y3 - y1 + y4 - y2,
            QAx = x2 - x1,
            QAy = y2 - y1,
            QBx = x4 - x3,
            QBy = y4 - y3,
            d = QAy * QBx - QBy * QAx,
            la = QBx * DPy - QBy * DPx,
            lb = QAx * DPy - QAy * DPx;

        const absD = Math.abs(d);
        return Math.abs(la) <= absD && Math.abs(lb) <= absD;
    },

    // round to arbitrary precision
    roundPrecision(value, precision) {
        const scalar = Math.pow(10, precision);
        return Math.round(value * scalar) / scalar;
    },

    // round to 2 decimals of precision
    roundP2(value) {
        return Math.round(value * 100) / 100;
    },
};

export default MathHelper;
