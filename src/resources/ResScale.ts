import Vector from "@/core/Vector";
import Rectangle from "@/core/Rectangle";

export interface ResourceInfo {
    charOffset?: number;
    lineOffset?: number;
    spaceWidth?: number;
    preCutWidth?: number;
    preCutHeight?: number;
    rects?: number[] | Rectangle[];
    originalRects?: Rectangle[];
    id?: number;
    adjustmentMaxX?: number;
    adjustmentMaxY?: number;
    offsets?: number[] | Vector[];
    originalOffsets?: Vector[];
    offsetAdjustments?: Vector[];
    skipOffsetAdjustment?: boolean;
    resScale?: number;
    chars?: string;
    kerning?: Record<string, number>;
}

/**
 * Scales a number and rounds to 4 decimal places of precision
 */
const scaleNumber = (value: number, scale: number): number => {
    return Math.round(value * scale * 10000) / 10000;
};

/**
 * Handles scaling of resource information for different canvas resolutions
 */
class ResScaler {
    /**
     * Scales multiple resource infos
     */
    scaleResourceInfos(infos: ResourceInfo[], canvasScale: number) {
        // the canvas scale is ratio of the canvas target size compared
        // to the resolution the original assets were designed for. The
        // resource scale handles resources that were designed for a
        // different resolution. Most of the assets were designed for
        // 2560 x 1440 but a few of the later sprites target 2048 x 1080

        for (let i = 0, len = infos.length; i < len; i++) {
            const info = infos[i]!;
            const resScale = info.resScale || 1;
            this.scaleResourceInfo(info, scaleNumber(canvasScale, resScale));
        }
    }

    /**
     * Scales a single resource info object
     */
    scaleResourceInfo(info: ResourceInfo, scale: number) {
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
            info.originalRects = this.parseOriginalRects(info.rects as number[]);
            const extra = false;

            info.rects = this.scaleRects(info.originalRects, scale, info.id ?? 0);
        }
        info.adjustmentMaxX = 0;
        info.adjustmentMaxX = 0;
        if (info.offsets && Array.isArray(info.offsets) && typeof info.offsets[0] === "number") {
            info.originalOffsets = this.parseOriginalOffsets(info.offsets as number[]);
            this.scaleOffsets(info, scale);
        }
    }

    /**
     * Parses rectangles from flat array format
     */
    parseOriginalRects(rects: number[]): Rectangle[] {
        let i = 0;
        const len = rects.length;
        const originalRects: Rectangle[] = [];
        while (i < len) {
            const rect = new Rectangle(rects[i++]!, rects[i++]!, rects[i++]!, rects[i++]!);
            originalRects.push(rect);
        }
        return originalRects;
    }

    /**
     * Scales rectangles for sprite sheet layout
     */
    scaleRects(originalRects: Rectangle[], scale: number, id: number): Rectangle[] {
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
            const oldRect = originalRects[j]!;

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
     */
    parseOriginalOffsets(offsets: number[]): Vector[] {
        let i = 0;
        const len = offsets.length;
        const originalOffsets: Vector[] = [];
        while (i < len) {
            const rect = new Vector(offsets[i++]!, offsets[i++]!);
            originalOffsets.push(rect);
        }
        return originalOffsets;
    }

    /**
     * Scales offsets with optional adjustments
     */
    scaleOffsets(info: ResourceInfo, scale: number) {
        // Previously we chopped the decimal portion of offsets and then
        // offset the image by that amount when scaling the sprite sheet.
        // That allows us to always have round offsets to avoid twitchy
        // pixels when we snap to pixel boundaries when drawing for perf.
        // Unfortunately, the GDI+ sprite resizer can't accurately handle
        // the floating point offsets so we'll disable offset adjust for
        // now. Instead we'll use high precision drawing coords (instead
        // of rounding) for moving and animated elements.
        const ALLOW_OFFSET_ADJUSTMENT = false;

        const adjustments: Vector[] = []; // how much to offset the offsets :)
        const oldOffsets = info.originalOffsets!;
        const newOffsets: Vector[] = [];
        for (let i = 0, len = oldOffsets.length; i < len; i++) {
            const scaledOffset = oldOffsets[i]!.copy();
            scaledOffset.x = scaleNumber(scaledOffset.x, scale);
            scaledOffset.y = scaleNumber(scaledOffset.y, scale);

            const adjustment: Vector =
                !ALLOW_OFFSET_ADJUSTMENT || info.skipOffsetAdjustment
                    ? new Vector(0, 0)
                    : new Vector(
                          scaleNumber((scaledOffset.x - scaledOffset.x) | 0, 1),
                          scaleNumber((scaledOffset.y - scaledOffset.y) | 0, 1)
                      );

            if (ALLOW_OFFSET_ADJUSTMENT && !info.skipOffsetAdjustment) {
                // remember the biggest adjust we made
                info.adjustmentMaxX = Math.max(info.adjustmentMaxX ?? 0, Math.ceil(adjustment.x));
                info.adjustmentMaxY = Math.max(info.adjustmentMaxY ?? 0, Math.ceil(adjustment.y));

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
