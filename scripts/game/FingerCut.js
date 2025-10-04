define("game/FingerCut", [], function () {
    /**
     * @constructor
     * @param start {Vector}
     * @param end {Vector}
     * @param startSize {number}
     * @param endSize {number}
     * @param color {RGBAColor}
     */
    function FingerCut(start, end, startSize, endSize, color) {
        this.start = start;
        this.end = end;
        this.startSize = startSize;
        this.endSize = endSize;
        this.color = color;
    }

    return FingerCut;
});
