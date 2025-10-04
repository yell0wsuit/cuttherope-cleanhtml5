define("resources/ResScale", ["core/Vector", "core/Rectangle"], function (Vector, Rectangle) {
    // scales a number and rounds to 4 decimals places of precision
    const scaleNumber = function (value, scale) {
        return Math.round(value * scale * 10000) / 10000;
    };

    const ResScaler = {
        scaleResourceInfos: function (infos, canvasScale) {
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
        },

        scaleResourceInfo: function (info, scale) {
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
            if (info.rects) {
                info.originalRects = this.parseOriginalRects(info.rects);
                const extra = false;

                info.rects = this.scaleRects(info.originalRects, scale, info.id);
            }
            info.adjustmentMaxX = 0;
            info.adjustmentMaxX = 0;
            if (info.offsets) {
                info.originalOffsets = this.parseOriginalOffsets(info.offsets);
                this.scaleOffsets(info, scale);
            }
        },

        parseOriginalRects: function (rects) {
            let i = 0,
                len = rects.length,
                originalRects = [];
            while (i < len) {
                const rect = new Rectangle(rects[i++], rects[i++], rects[i++], rects[i++]);
                originalRects.push(rect);
            }
            return originalRects;
        },

        scaleRects: function (originalRects, scale, id) {
            let PADDING = 4,
                newRects = [],
                maxWidth = 0,
                currentY = 0,
                numRects = originalRects.length;

            if (id === 5) {
                PADDING = 11.25;
                scale *= 1.6;
            }

            if (id === 68) {
                PADDING = 2.78;
                scale *= 1.5;
            }

            for (let j = 0; j < numRects; j++) {
                const oldRect = originalRects[j],
                    newRect = new Rectangle(
                        0,
                        currentY,
                        scaleNumber(oldRect.w, scale),
                        scaleNumber(oldRect.h, scale)
                    );

                newRects.push(newRect);
                currentY += Math.ceil(newRect.h) + PADDING;
            }
            return newRects;
        },

        parseOriginalOffsets: function (offsets) {
            let i = 0,
                len = offsets.length,
                originalOffsets = [];
            while (i < len) {
                const rect = new Vector(offsets[i++], offsets[i++]);
                originalOffsets.push(rect);
            }
            return originalOffsets;
        },

        scaleOffsets: function (info, scale) {
            // Previously we chopped the decimal portion of offsets and then
            // offset the image by that amount when scaling the sprite sheet.
            // That allows us to always have round offsets to avoid twitchy
            // pixels when we snap to pixel boundaries when drawing for perf.
            // Unfortunately, the GDI+ sprite resizer can't accurately handle
            // the floating point offsets so we'll disable offset adjust for
            // now. Instead we'll use high precision drawing coords (instead
            // of rounding) for moving and animated elements.
            const ALLOW_OFFSET_ADJUSTMENT = false;

            let adjustments = [], // how much to offset the offsets :)
                oldOffsets = info.originalOffsets,
                newOffsets = [],
                scaledOffset,
                adjustment,
                i,
                len;
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
        },
    };

    return ResScaler;
});
