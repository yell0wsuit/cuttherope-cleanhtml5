import Vector from "core/Vector";
import Quad2D from "core/Quad2D";
class Texture2D {
    constructor(image) {
        this.image = image;
        this.rects = [];
        this.offsets = [];
        this.preCutSize = Vector.newUndefined();

        // Get dimensions, waiting for image to load if necessary
        this.imageWidth = image.naturalWidth || image.width || 0;
        this.imageHeight = image.naturalHeight || image.height || 0;

        // If dimensions aren't available yet, try getting computed values
        if (!this.imageWidth || !this.imageHeight) {
            const computed = window.getComputedStyle(image);
            this.imageWidth = this.imageWidth || parseInt(computed.width, 10) || 0;
            this.imageHeight = this.imageHeight || parseInt(computed.height, 10) || 0;
        }

        this._invWidth = 1 / this.imageWidth;
        this._invHeight = 1 / this.imageHeight;

        // sometimes we need to adjust offsets to pixel align
        this.adjustmentMaxX = 0;
        this.adjustmentMaxY = 0;
    }
    addRect(rect) {
        this.rects.push(rect);
        this.offsets.push(new Vector(0, 0));
    }
    setOffset(index, x, y) {
        const offset = this.offsets[index];
        offset.x = x;
        offset.y = y;
    }
    getCoordinates(rect) {
        return new Quad2D(
            this._invWidth * rect.x,
            this._invHeight * rect.y,
            this._invWidth * rect.w,
            this._invHeight * rect.h
        );
    }
}

export default Texture2D;
