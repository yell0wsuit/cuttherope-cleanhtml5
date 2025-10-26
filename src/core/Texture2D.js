import Vector from "@/core/Vector";
import Quad2D from "@/core/Quad2D";
import Rectangle from "@/core/Rectangle";

/**
 * Type guard to check if value is an HTMLImageElement
 * @param {unknown} value
 * @returns {value is HTMLImageElement}
 */
const isHtmlImageElement = (value) => {
    console.log(value);
    return typeof HTMLImageElement !== "undefined" && value instanceof HTMLImageElement;
};

const getComputedDimension = (/** @type {Element} */ image) => {
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

/**
 * Normalizes image input to a standard format
 * @param {HTMLImageElement | ImageBitmap | { drawable: HTMLImageElement | ImageBitmap; width?: number; height?: number; sourceUrl?: string; }} input
 * @returns {{ drawable: HTMLImageElement | ImageBitmap | null; width: number; height: number; sourceUrl: string; }}
 */
const normalizeImageInput = (input) => {
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
        const width =
            input.width ||
            (isHtmlImageElement(drawable) ? drawable.naturalWidth : drawable?.width) ||
            0;
        const height =
            input.height ||
            (isHtmlImageElement(drawable) ? drawable.naturalHeight : drawable?.height) ||
            0;
        const sourceUrl =
            input.sourceUrl || (isHtmlImageElement(drawable) ? drawable.src : "") || "";

        return {
            drawable,
            width,
            height,
            sourceUrl,
        };
    }

    const drawable = input;
    const width = isHtmlImageElement(drawable) ? drawable.naturalWidth : drawable?.width || 0;
    const height = isHtmlImageElement(drawable) ? drawable.naturalHeight : drawable?.height || 0;
    const sourceUrl = isHtmlImageElement(drawable) ? drawable.src : "";

    return {
        drawable,
        width,
        height,
        sourceUrl,
    };
};

class Texture2D {
    /** @type {HTMLImageElement | ImageBitmap | null} */
    image;

    /** @type {number} */
    imageWidth;

    /** @type {number} */
    imageHeight;

    /** @type {number} */
    _invWidth;

    /** @type {number} */
    _invHeight;

    /** @type {string} */
    imageSrc;

    /** @type {Rectangle[]} */
    rects;

    /** @type {Vector[]} */
    offsets;

    /** @type {Vector} */
    preCutSize;

    /** @type {number} */
    adjustmentMaxX;

    /** @type {number} */
    adjustmentMaxY;

    /**
     * @param {HTMLImageElement | ImageBitmap | { drawable: HTMLImageElement | ImageBitmap; width?: number; height?: number; sourceUrl?: string; }} imageInput
     */
    constructor(imageInput) {
        const { drawable, width, height, sourceUrl } = normalizeImageInput(imageInput);

        this.image = drawable;

        /**
         * @type {Rectangle[]}
         */
        this.rects = [];
        /**
         * @type {Vector[]}
         */
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
     * @param {{ x: number; y: number; w: number; h: number; }} rect
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
