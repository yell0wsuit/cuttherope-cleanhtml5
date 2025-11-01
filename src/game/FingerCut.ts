import type RGBAColor from "@/core/RGBAColor";
import type Vector from "@/core/Vector";

class FingerCut {
    /** @type {Vector} */
    start: Vector;

    /** @type {Vector} */
    end: Vector;

    /** @type {number} */
    startSize: number;

    /** @type {number} */
    endSize: number;

    /** @type {RGBAColor} */
    color: RGBAColor;

    /**
     * @param {Vector} start
     * @param {Vector} end
     * @param {number} startSize
     * @param {number} endSize
     * @param {RGBAColor} color
     */
    constructor(start: Vector, end: Vector, startSize: number, endSize: number, color: RGBAColor) {
        this.start = start;
        this.end = end;
        this.startSize = startSize;
        this.endSize = endSize;
        this.color = color;
    }
}

export default FingerCut;
