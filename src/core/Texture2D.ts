import Vector from "@/core/Vector";
import Quad2D from "@/core/Quad2D";

/**
 * @typedef {import("@/core/Rectangle").default} Rectangle
 */

const isHtmlImageElement = (/** @type {unknown} */ value) =>
    typeof HTMLImageElement !== "undefined" && value instanceof HTMLImageElement;

const getComputedDimension = (/** @type {HTMLImageElement} */ image) => {
    if (!image || typeof window === "undefined" || !window.getComputedStyle) {
        return { width: 0, height: 0 };
    }

    try {
        const computed = window.getComputedStyle(image);
        return {
            width: parseInt(computed.width, 10) || 0,
            height: parseInt(computed.height, 10) || 0,
        };
    } catch (error) {
        window.console?.warn?.("Failed to get computed style for image", error);
        return { width: 0, height: 0 };
    }
};

const normalizeImageInput = (
    /** @type {{ drawable: ImageBitmap; width: number; height: number; sourceUrl: string; }} */ input
) => {
    if (!input) {
        return {
            drawable: null,
            width: 0,
            height: 0,
            sourceUrl: "",
        };
    }

    if (typeof input === "object" && "drawable" in input) {
        const drawable = input.drawable;
        const width = input.width || drawable?.naturalWidth || drawable?.width || 0;
        const height = input.height || drawable?.naturalHeight || drawable?.height || 0;
        const sourceUrl = input.sourceUrl || drawable?.src || "";

        return {
            drawable,
            width,
            height,
            sourceUrl,
        };
    }

    const drawable = input;
    const width = drawable?.naturalWidth || drawable?.width || 0;
    const height = drawable?.naturalHeight || drawable?.height || 0;
    const sourceUrl = drawable?.src || "";

    return {
        drawable,
        width,
        height,
        sourceUrl,
    };
};

class Texture2D {
    /**
     * @type {ImageBitmap | null}
     */
    image;

    /**
     * @type {Rectangle[]}
     */
    rects;

    /**
     * @type {Vector[]}
     */
    offsets;

    /**
     * @type {Vector}
     */
    preCutSize;

    /**
     * @type {string}
     */
    imageSrc;

    /**
     * @private
     * @type {number}
     */
    _invWidth;

    /**
     * @private
     * @type {number}
     */
    _invHeight;

    /**
     * @param {{ drawable: ImageBitmap; width: number; height: number; sourceUrl: string; }} imageInput
     */
    constructor(imageInput) {
        const { drawable, width, height, sourceUrl } = normalizeImageInput(imageInput);

        this.image = drawable;

        this.rects = [];
        this.offsets = [];
        this.preCutSize = Vector.newUndefined();
        this.imageSrc = sourceUrl;

        let resolvedWidth = width;
        let resolvedHeight = height;

        if ((!resolvedWidth || !resolvedHeight) && isHtmlImageElement(drawable)) {
            const computed = getComputedDimension(drawable);
            resolvedWidth = resolvedWidth || computed.width;
            resolvedHeight = resolvedHeight || computed.height;
        }

        this.imageWidth = resolvedWidth || 0;
        this.imageHeight = resolvedHeight || 0;

        this._invWidth = this.imageWidth > 0 ? 1 / this.imageWidth : 0;
        this._invHeight = this.imageHeight > 0 ? 1 / this.imageHeight : 0;

        // sometimes we need to adjust offsets to pixel align
        this.adjustmentMaxX = 0;
        this.adjustmentMaxY = 0;
    }

    /**
     * @param {Rectangle} rect
     */
    addRect(rect) {
        this.rects.push(rect);
        this.offsets.push(new Vector(0, 0));
    }

    /**
     * @param {number} index
     * @param {number} x
     * @param {number} y
     */
    setOffset(index, x, y) {
        const offset = this.offsets[index];
        offset.x = x;
        offset.y = y;
    }

    /**
     * @param {Rectangle} rect
     */
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
