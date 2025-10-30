import Vector from "@/core/Vector";
import Rectangle from "@/core/Rectangle";

/**
 * @typedef {Object} ResourceInfo
 * @property {number} [charOffset] - Character offset for font rendering
 * @property {number} [lineOffset] - Line offset for font rendering
 * @property {number} [spaceWidth] - Width of space character
 * @property {number} [preCutWidth] - Width before cutting
 * @property {number} [preCutHeight] - Height before cutting
 * @property {(number[] | Rectangle[])} [rects] - Flat array of rectangle coordinates or Rectangle array
 * @property {Rectangle[]} [originalRects] - Parsed rectangle objects
 * @property {number} [id] - Resource identifier
 * @property {number} [adjustmentMaxX] - Maximum X adjustment
 * @property {number} [adjustmentMaxY] - Maximum Y adjustment
 * @property {(number[] | Vector[])} [offsets] - Flat array of offset coordinates or Vector array
 * @property {Vector[]} [originalOffsets] - Parsed offset vectors
 * @property {Vector[]} [offsetAdjustments] - Offset adjustment vectors
 * @property {boolean} [skipOffsetAdjustment] - Whether to skip offset adjustment
 * @property {number} [resScale] - Resource-specific scale factor
 */

/**
 * Scales a number and rounds to 4 decimal places of precision
 * @param {number} value - The value to scale
 * @param {number} scale - The scale factor
 * @returns {number} The scaled and rounded value
 */
const scaleNumber = (value, scale) => {
    return Math.round(value * scale * 10000) / 10000;
};

/**
 * Handles scaling of resource information for different canvas resolutions
 */
class ResScaler {
    /**
     * Scales multiple resource infos
     * @param {ResourceInfo[]} infos - Array of resource info objects
     * @param {number} canvasScale - The canvas scale factor
     */
    scaleResourceInfos(infos, canvasScale) {
        // the canvas scale is ratio of the canvas target size compared
        // to the resolution the original assets were designed for. The
        // resource scale handles resources that were designed for a
        // different resolution. Most of the assets were designed for
        // 2560 x 1440 but a few of the later sprites target 2048 x 1080

        let resScale, i, len, info;
        for (i = 0, len = infos.length; i < len; i++) {
            info = infos[i];
            resScale = info.resScale || 1;
            this.scaleResourceInfo(infos[i], scaleNumber(canvasScale, resScale));
        }
    }

    /**
     * Scales a single resource info object
     * @param {ResourceInfo} info - Resource info object to scale
     * @param {number} scale - Scale factor to apply
     */
    scaleResourceInfo(info, scale) {
        if (info.charOffset) {
            info.charOffset = scaleNumber(info.charOffset, scale);
        }
        if (info.lineOffset) {
            info.lineOffset = scaleNumber(info.lineOffset, scale);
        }
        if (info.spaceWidth) {
            info.spaceWidth = scaleNumber(info.spaceWidth, scale);
        }
        if (info.preCutWidth) {
            info.preCutWidth = Math.ceil(scaleNumber(info.preCutWidth, scale));
        }
        if (info.preCutHeight) {
            info.preCutHeight = Math.ceil(scaleNumber(info.preCutHeight, scale));
        }
        if (info.rects && Array.isArray(info.rects) && typeof info.rects[0] === "number") {
            info.originalRects = this.parseOriginalRects(/** @type {number[]} */ (info.rects));
            const extra = false;

            info.rects = this.scaleRects(info.originalRects, scale, info.id);
        }
        info.adjustmentMaxX = 0;
        info.adjustmentMaxX = 0;
        if (info.offsets && Array.isArray(info.offsets) && typeof info.offsets[0] === "number") {
            info.originalOffsets = this.parseOriginalOffsets(
                /** @type {number[]} */ (info.offsets)
            );
            this.scaleOffsets(info, scale);
        }
    }

    /**
     * Parses rectangles from flat array format
     * @param {number[]} rects - Flat array of rectangle coordinates
     * @returns {Rectangle[]} Array of Rectangle objects
     */
    parseOriginalRects(rects) {
        let i = 0;
        const len = rects.length,
            originalRects = [];
        while (i < len) {
            const rect = new Rectangle(rects[i++], rects[i++], rects[i++], rects[i++]);
            originalRects.push(rect);
        }
        return originalRects;
    }

    /**
     * Scales rectangles for sprite sheet layout
     * @param {Rectangle[]} originalRects - Original rectangle array
     * @param {number} scale - Scale factor
     * @param {number} [id] - Resource ID
     * @returns {Rectangle[]} Scaled and repositioned rectangles
     */
    scaleRects(originalRects, scale, id) {
        const PADDING = 2; // Changed from 4 to 2 to match minified version
        const newRects = [];
        const numRects = originalRects.length;
        const numColumns = Math.ceil(Math.sqrt(numRects)); // Calculate number of columns
        let columnIndex = 0;
        let currentX = 0;
        let currentY = 2; // Start Y at 2 (padding)
        let maxColumnWidth = 0;

        // Special cases for specific IDs
        //if (id === 5) { // small fonts
        //    PADDING = 11.25;
        //    scale *= 1.6;
        //}

        //if (id === 68) { // star HUD
        //    PADDING = 2.78;
        //    scale *= 1.5;
        //}

        for (let j = 0; j < numRects; j++) {
            const oldRect = originalRects[j];

            // Move to next column when we've filled the current one
            columnIndex = (columnIndex + 1) % numColumns;

            if (columnIndex === 1) {
                // Starting a new column
                currentX += maxColumnWidth + PADDING;
                currentY = PADDING;
                maxColumnWidth = 0;
            }

            const newRect = new Rectangle(
                currentX,
                currentY,
                scaleNumber(oldRect.w, scale),
                scaleNumber(oldRect.h, scale)
            );

            newRects.push(newRect);
            currentY += Math.ceil(newRect.h) + PADDING;
            maxColumnWidth = Math.max(maxColumnWidth, Math.ceil(newRect.w));
        }

        return newRects;
    }

    /**
     * Parses offsets from flat array format
     * @param {number[]} offsets - Flat array of offset coordinates
     * @returns {Vector[]} Array of Vector objects
     */
    parseOriginalOffsets(offsets) {
        let i = 0;
        const len = offsets.length,
            originalOffsets = [];
        while (i < len) {
            const rect = new Vector(offsets[i++], offsets[i++]);
            originalOffsets.push(rect);
        }
        return originalOffsets;
    }

    /**
     * Scales offsets with optional adjustments
     * @param {ResourceInfo} info - Resource info object with offsets
     * @param {number} scale - Scale factor to apply
     */
    scaleOffsets(info, scale) {
        // Previously we chopped the decimal portion of offsets and then
        // offset the image by that amount when scaling the sprite sheet.
        // That allows us to always have round offsets to avoid twitchy
        // pixels when we snap to pixel boundaries when drawing for perf.
        // Unfortunately, the GDI+ sprite resizer can't accurately handle
        // the floating point offsets so we'll disable offset adjust for
        // now. Instead we'll use high precision drawing coords (instead
        // of rounding) for moving and animated elements.
        const ALLOW_OFFSET_ADJUSTMENT = false;

        const adjustments = []; // how much to offset the offsets :)
        const oldOffsets = info.originalOffsets;
        const newOffsets = [];
        let scaledOffset, adjustment, i, len;
        for (i = 0, len = oldOffsets.length; i < len; i++) {
            scaledOffset = oldOffsets[i].copy();
            scaledOffset.x = scaleNumber(scaledOffset.x, scale);
            scaledOffset.y = scaleNumber(scaledOffset.y, scale);

            if (!ALLOW_OFFSET_ADJUSTMENT || info.skipOffsetAdjustment) {
                // the backgrounds use offsets to place other elements, so
                // we don't always want to pixel adjust the offset because
                // the c# resizer can only safely adjust the current image.
                adjustment = new Vector(0, 0);
            } else {
                // find the amount we need to adjust the offset by
                adjustment = new Vector(
                    scaleNumber((scaledOffset.x - scaledOffset.x) | 0, 1),
                    scaleNumber((scaledOffset.y - scaledOffset.y) | 0, 1)
                );

                // remember the biggest adjust we made
                info.adjustmentMaxX = Math.max(info.adjustmentMaxX, Math.ceil(adjustment.x));
                info.adjustmentMaxY = Math.max(info.adjustmentMaxY, Math.ceil(adjustment.y));

                // chop off the decimal portion of the offset
                scaledOffset.x = scaledOffset.x | 0;
                scaledOffset.y = scaledOffset.y | 0;
            }

            adjustments.push(adjustment);
            newOffsets.push(scaledOffset);
        }

        info.offsets = newOffsets;
        info.offsetAdjustments = adjustments;
        delete info.originalOffsets;
    }
}

export default new ResScaler();
