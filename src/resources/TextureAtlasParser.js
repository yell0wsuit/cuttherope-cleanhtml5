import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";

/**
 * A single frame entry (after parsing).
 * @typedef {Object} FrameEntry
 * @property {string} name - The frame’s identifier or filename.
 * @property {FrameData} data - Frame metadata.
 */

/**
 * Frame data structure from TexturePacker JSON.
 * @typedef {Object} FrameData
 * @property {Rectangle} frame - Frame rectangle within atlas.
 * @property {boolean} [rotated] - Whether the frame was rotated.
 * @property {Rectangle} [spriteSourceSize] - Original source rect before trimming.
 * @property {{w:number, h:number}} [sourceSize] - Original full image size.
 * @property {boolean} [trimmed] - Whether the frame was trimmed.
 * @property {string} [filename] - Frame filename.
 * @property {string} [name] - Optional alternate name.
 */

/**
 * Metadata block from TexturePacker JSON.
 * @typedef {Object} TexturePackerMeta
 * @property {string} app
 * @property {string} version
 * @property {string} image
 * @property {string} format
 * @property {{w:number, h:number}} size
 * @property {string} scale
 * @property {string} [smartupdate]
 */

/**
 * Complete TexturePacker JSON structure.
 * @typedef {Object} TexturePackerAtlas
 * @property {Record<string, FrameData> | FrameData[]} frames
 * @property {TexturePackerMeta} [meta]
 */

/**
 * Extra options for parseTexturePackerAtlas.
 * @typedef {Object} ParseAtlasOptions
 * @property {object} [existingInfo] - Optional previously parsed data to merge.
 * @property {"center"} [offsetNormalization] - Optional normalization behavior.
 */

/**
 * Parsed result info.
 * @typedef {Object} ParsedAtlasInfo
 * @property {Rectangle[]} rects
 * @property {{x:number, y:number}[]} [offsets]
 * @property {number} [preCutWidth]
 * @property {number} [preCutHeight]
 * @property {string[]} frameKeys
 * @property {Record<string, number>} frameIndexByName
 * @property {number} [adjustmentMaxX]
 * @property {number} [adjustmentMaxY]
 * @property {TexturePackerMeta|null} [atlasMeta]
 */

/**
 * Builds frame entries from the TexturePacker frames block.
 * @param {Record<string, FrameData> | FrameData[]} frames
 * @returns {FrameEntry[]}
 */
const createFrameEntries = (frames) => {
    if (!frames) return [];

    // If frames is an array, preserve its natural order
    if (Array.isArray(frames)) {
        return frames.map((frame, index) => ({
            name: frame.filename ?? frame.name ?? String(index),
            data: frame,
        }));
    }

    // If frames is an object (unordered), sort alphabetically for stability
    return Object.keys(frames)
        .sort()
        .map((name) => ({
            name,
            data: frames[name],
        }));
};

/**
 * Orders frame entries according to a defined sequence.
 * @param {FrameEntry[]} entries
 * @param {string[]} [frameOrder]
 * @returns {FrameEntry[]}
 */
const orderFrameEntries = (entries, frameOrder) => {
    if (!frameOrder || frameOrder.length === 0) return entries;

    const orderMap = new Map(frameOrder.map((name, i) => [name, i]));

    return entries.slice().sort((a, b) => {
        const indexA = orderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
        const indexB = orderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
        return indexA === indexB ? a.name.localeCompare(b.name) : indexA - indexB;
    });
};

/**
 * Parses a TexturePacker JSON atlas into a normalized info object.
 * @param {TexturePackerAtlas} atlasData
 * @param {ParseAtlasOptions} [options]
 * @returns {ParsedAtlasInfo}
 */
export const parseTexturePackerAtlas = (atlasData, options = {}) => {
    const { existingInfo = {}, offsetNormalization } = options;

    if (!atlasData || !atlasData.frames) return /** @type {ParsedAtlasInfo} */ (existingInfo);

    // Auto-detect order directly from JSON array if available
    let autoFrameOrder = null;
    if (Array.isArray(atlasData.frames)) {
        autoFrameOrder = atlasData.frames
            .map((f) => f.filename ?? f.name)
            .filter((name) => typeof name === "string");
    }

    let entries = createFrameEntries(atlasData.frames);
    if (autoFrameOrder) entries = orderFrameEntries(entries, autoFrameOrder);
    if (entries.length === 0) return /** @type {ParsedAtlasInfo} */ (existingInfo);

    /** @type {ParsedAtlasInfo} */
    const info = {
        ...existingInfo,
        rects: [],
        frameKeys: [],
        frameIndexByName: {},
    };

    /** @type {Rectangle[]} */
    const rects = [];
    /** @type {Vector[]} */
    const offsets = [];
    /** @type {{w:number,h:number}[]} */
    const rectSizes = [];
    /** @type {string[]} */
    const frameKeys = [];

    let hasNonZeroOffset = false;
    let preCutWidth = info.preCutWidth ?? 0;
    let preCutHeight = info.preCutHeight ?? 0;

    entries.forEach((entry, index) => {
        const frameInfo = entry.data;
        const frameRect = frameInfo.frame;
        if (!frameRect) return;

        if (frameInfo.rotated) {
            console.warn(`TexturePacker frame "${entry.name}" is rotated — not supported.`);
        }

        rects.push(new Rectangle(frameRect.x, frameRect.y, frameRect.w, frameRect.h));
        rectSizes.push({ w: frameRect.w, h: frameRect.h });

        const spriteSourceSize = frameInfo.spriteSourceSize;
        if (spriteSourceSize) {
            const offset = new Vector(spriteSourceSize.x || 0, spriteSourceSize.y || 0);
            offsets.push(offset);
            if (offset.x !== 0 || offset.y !== 0) hasNonZeroOffset = true;
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

    info.rects = rects.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h }));

    // Optional center normalization
    if (offsetNormalization === "center") {
        const centered = rectSizes.map((s) => {
            const cx = Math.round(((preCutWidth || s.w) - s.w) / 2);
            const cy = Math.round(((preCutHeight || s.h) - s.h) / 2);
            return new Vector(cx, cy);
        });
        for (let i = 0; i < centered.length; i++) offsets[i] = centered[i];
        hasNonZeroOffset = centered.some((o) => o.x || o.y);
    }

    if (offsets.length && hasNonZeroOffset) {
        info.offsets = offsets.map((o) => ({ x: o.x, y: o.y }));
    }

    if (preCutWidth && preCutHeight) {
        info.preCutWidth = preCutWidth;
        info.preCutHeight = preCutHeight;
    }

    info.frameKeys = frameKeys;
    info.frameIndexByName = frameKeys.reduce((acc, name, i) => {
        acc[name] = i;
        return acc;
    }, /** @type {Record<string, number>} */ ({}));

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
