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

    /**
     * Normalizes an angle to the [0, 360) range
     * @param {number} angle
     * @return {number}
     */
    static normalizeAngle360(angle) {
        let a = angle % 360;
        if (a < 0) {
            a += 360;
        }
        return a;
    }

    /**
     * Finds the equivalent of targetAngle closest to currentAngle
     * @param {number} currentAngle
     * @param {number} targetAngle
     * @return {number}
     */
    static nearestAngleTo(currentAngle, targetAngle) {
        const current = MathHelper.normalizeAngle360(currentAngle);
        const base = MathHelper.normalizeAngle360(targetAngle);
        const candidates = [base, base - 360, base + 360];

        let closest = candidates[0];
        let minDiff = Math.abs(candidates[0] - current);

        for (let i = 1; i < candidates.length; i++) {
            const diff = Math.abs(candidates[i] - current);
            if (diff < minDiff) {
                minDiff = diff;
                closest = candidates[i];
            }
        }

        return closest;
    }

    /**
     * Computes the smallest absolute angle between two angles
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    static minAngleBetween(a, b) {
        let diff = Math.abs(a - b) % 360;
        if (diff > 180) {
            diff = 360 - diff;
        }
        return Math.abs(diff);
    }

    /**
     * Tests intersection between two oriented bounding boxes using SAT
     * @param {{x:number,y:number}} tl1
     * @param {{x:number,y:number}} tr1
     * @param {{x:number,y:number}} br1
     * @param {{x:number,y:number}} bl1
     * @param {{x:number,y:number}} tl2
     * @param {{x:number,y:number}} tr2
     * @param {{x:number,y:number}} br2
     * @param {{x:number,y:number}} bl2
     * @return {boolean}
     */
    static obbInOBB(tl1, tr1, br1, bl1, tl2, tr2, br2, bl2) {
        const poly1 = [tl1, tr1, br1, bl1];
        const poly2 = [tl2, tr2, br2, bl2];
        const axes = [
            MathHelper._edgeNormal(tl1, tr1),
            MathHelper._edgeNormal(tr1, br1),
            MathHelper._edgeNormal(tl2, tr2),
            MathHelper._edgeNormal(tr2, br2),
        ];

        for (let i = 0; i < axes.length; i++) {
            if (!MathHelper._overlapOnAxis(poly1, poly2, axes[i])) {
                return false;
            }
        }

        return true;
    }

    static _edgeNormal(p1, p2) {
        const edgeX = p2.x - p1.x;
        const edgeY = p2.y - p1.y;
        let normalX = -edgeY;
        let normalY = edgeX;
        const length = Math.hypot(normalX, normalY) || 1;
        normalX /= length;
        normalY /= length;
        return { x: normalX, y: normalY };
    }

    static _projectPolygon(points, axis) {
        let min = points[0].x * axis.x + points[0].y * axis.y;
        let max = min;

        for (let i = 1; i < points.length; i++) {
            const projection = points[i].x * axis.x + points[i].y * axis.y;
            if (projection < min) {
                min = projection;
            }
            if (projection > max) {
                max = projection;
            }
        }

        return { min, max };
    }

    static _overlapOnAxis(poly1, poly2, axis) {
        const proj1 = MathHelper._projectPolygon(poly1, axis);
        const proj2 = MathHelper._projectPolygon(poly2, axis);
        return proj1.max >= proj2.min && proj2.max >= proj1.min;
    }
}

export default MathHelper;
