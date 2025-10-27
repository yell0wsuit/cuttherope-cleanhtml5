/**
 * @constructor
 * @param {Vector} start
 * @param {Vector} end
 * @param {number} startSize
 * @param {number} endSize
 * @param {RGBAColor} color
 */
class FingerCut {
    constructor(start, end, startSize, endSize, color) {
        this.start = start;
        this.end = end;
        this.startSize = startSize;
        this.endSize = endSize;
        this.color = color;
    }
}

export default FingerCut;
