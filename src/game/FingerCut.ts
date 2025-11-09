import type RGBAColor from "@/core/RGBAColor";
import type Vector from "@/core/Vector";

class FingerCut {
    start: Vector;
    end: Vector;
    startSize: number;
    endSize: number;
    color: RGBAColor;

    constructor(start: Vector, end: Vector, startSize: number, endSize: number, color: RGBAColor) {
        this.start = start;
        this.end = end;
        this.startSize = startSize;
        this.endSize = endSize;
        this.color = color;
    }
}

export default FingerCut;
