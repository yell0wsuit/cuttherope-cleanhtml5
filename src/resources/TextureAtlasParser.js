import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";

const createFrameEntries = (frames) => {
    if (!frames) {
        return [];
    }

    if (Array.isArray(frames)) {
        return frames.map((frame, index) => ({
            name: frame?.filename ?? frame?.name ?? String(index),
            data: frame,
        }));
    }

    return Object.keys(frames).map((name) => ({
        name,
        data: frames[name],
    }));
};

const orderFrameEntries = (entries, frameOrder) => {
    if (!frameOrder || frameOrder.length === 0) {
        return entries;
    }

    const orderMap = new Map();
    frameOrder.forEach((name, index) => {
        orderMap.set(name, index);
    });

    return entries.slice().sort((a, b) => {
        const indexA = orderMap.has(a.name) ? orderMap.get(a.name) : Number.MAX_SAFE_INTEGER;
        const indexB = orderMap.has(b.name) ? orderMap.get(b.name) : Number.MAX_SAFE_INTEGER;

        if (indexA === indexB) {
            return a.name.localeCompare(b.name);
        }

        return indexA - indexB;
    });
};

export const parseTexturePackerAtlas = (atlasData, options = {}) => {
    const { existingInfo = {}, frameOrder, offsetNormalization } = options;

    if (!atlasData || !atlasData.frames) {
        return existingInfo || {};
    }

    let entries = createFrameEntries(atlasData.frames);

    if (frameOrder && frameOrder.length) {
        entries = orderFrameEntries(entries, frameOrder);
    }

    if (entries.length === 0) {
        return existingInfo || {};
    }

    const info = { ...existingInfo };
    const rects = [];
    const offsets = [];
    const rectSizes = [];
    const frameKeys = [];
    let hasNonZeroOffset = false;
    let preCutWidth = info.preCutWidth ?? 0;
    let preCutHeight = info.preCutHeight ?? 0;

    entries.forEach((entry, index) => {
        const frameInfo = entry.data || {};
        const frameRect = frameInfo.frame;

        if (!frameRect) {
            return;
        }

        if (frameInfo.rotated) {
            globalThis.console?.warn?.(
                `TexturePacker frame "${entry.name}" is rotated, which is not currently supported.`
            );
        }

        rects.push(new Rectangle(frameRect.x, frameRect.y, frameRect.w, frameRect.h));
        rectSizes.push({ w: frameRect.w, h: frameRect.h });

        const spriteSourceSize = frameInfo.spriteSourceSize;
        if (spriteSourceSize) {
            const offset = new Vector(spriteSourceSize.x || 0, spriteSourceSize.y || 0);
            offsets.push(offset);
            if (offset.x !== 0 || offset.y !== 0) {
                hasNonZeroOffset = true;
            }
        } else {
            offsets.push(new Vector(0, 0));
        }

        const sourceSize = frameInfo.sourceSize;
        if (sourceSize) {
            preCutWidth = Math.max(preCutWidth, sourceSize.w || 0);
            preCutHeight = Math.max(preCutHeight, sourceSize.h || 0);
        }

        frameKeys.push(entry.name ?? String(index));
    });

    info.rects = rects.map((rect) => ({ x: rect.x, y: rect.y, w: rect.w, h: rect.h }));

    // Optionally normalize offsets so each frame is perfectly centered
    if (offsetNormalization === "center") {
        const centeredOffsets = rectSizes.map((size) => {
            const cx = Math.round(((preCutWidth || size.w) - size.w) / 2);
            const cy = Math.round(((preCutHeight || size.h) - size.h) / 2);
            return new Vector(cx, cy);
        });

        // Replace offsets with centered values
        for (let i = 0; i < centeredOffsets.length; i++) {
            offsets[i] = centeredOffsets[i];
        }

        // If any centered offset is non-zero, mark flag
        hasNonZeroOffset = centeredOffsets.some((o) => o.x !== 0 || o.y !== 0);
    }

    if (offsets.length && (hasNonZeroOffset || info.offsets)) {
        info.offsets = offsets.map((offset) => ({ x: offset.x, y: offset.y }));
    } else {
        delete info.offsets;
    }

    if (preCutWidth && preCutHeight) {
        info.preCutWidth = preCutWidth;
        info.preCutHeight = preCutHeight;
    }

    info.frameKeys = frameKeys;
    info.frameIndexByName = frameKeys.reduce((accumulator, name, index) => {
        accumulator[name] = index;
        return accumulator;
    }, {});

    // When frames are trimmed and carry offsets, pad the drawn quad by 1px
    // so restored transparency aligns perfectly with the untrimmed size.
    // ResourceMgr will clamp source rects to avoid sampling outside atlas.
    if (hasNonZeroOffset) {
        info.adjustmentMaxX = info.adjustmentMaxX ?? 1;
        info.adjustmentMaxY = info.adjustmentMaxY ?? 1;
    }

    info.atlasMeta = atlasData.meta || null;

    return info;
};

export default parseTexturePackerAtlas;
