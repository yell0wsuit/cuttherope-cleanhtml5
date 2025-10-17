import Vector from "@/core/Vector";
import Quad2D from "@/core/Quad2D";
class Texture2D {
    constructor(image) {
        this.image = image;
        this.rects = [];
        this.offsets = [];
        this.sourceSizes = [];
        this.pivots = [];
        this.preCutSize = Vector.newUndefined();
        this._hasPivotData = false;

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
        this.sourceSizes.push({ w: rect.w, h: rect.h });
        this.pivots.push(null);
    }
    setOffset(index, x, y) {
        const offset = this.offsets[index];
        offset.x = x;
        offset.y = y;
    }
    setSourceSize(index, width, height) {
        this.sourceSizes[index] = { w: width, h: height };
    }
    setPivot(index, x, y) {
        this.pivots[index] = { x, y };
        this._hasPivotData = true;
    }
    hasPivotData() {
        return this._hasPivotData;
    }
    getRotationCenterOffset(index, restoreCutTransparency) {
        if (!this._hasPivotData || index == null) {
            return null;
        }

        if (index < 0 || index >= this.rects.length) {
            return null;
        }

        const pivot = this.pivots[index];
        if (!pivot) {
            return null;
        }

        const rect = this.rects[index];
        const offset = this.offsets[index];
        const sourceSize = this.sourceSizes[index];

        const pivotOriginalX = pivot.x;
        const pivotOriginalY = pivot.y;

        if (restoreCutTransparency) {
            const hasPreCut =
                this.preCutSize &&
                this.preCutSize.x !== Vector.undefined.x &&
                this.preCutSize.y !== Vector.undefined.y;

            const baseWidth = hasPreCut ? this.preCutSize.x : sourceSize?.w ?? rect?.w ?? 0;
            const baseHeight = hasPreCut ? this.preCutSize.y : sourceSize?.h ?? rect?.h ?? 0;

            return {
                x: pivotOriginalX - baseWidth / 2,
                y: pivotOriginalY - baseHeight / 2,
            };
        }

        const rectWidth = rect?.w ?? sourceSize?.w ?? 0;
        const rectHeight = rect?.h ?? sourceSize?.h ?? 0;
        const offsetX = offset?.x ?? 0;
        const offsetY = offset?.y ?? 0;

        return {
            x: pivotOriginalX - offsetX - rectWidth / 2,
            y: pivotOriginalY - offsetY - rectHeight / 2,
        };
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
