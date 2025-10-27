import ResInfo from "@/ResInfo";
import RES_DATA from "@/resources/ResData";
import ResScaler from "@/resources/ResScale";
import ResourceType from "@/resources/ResourceType";
import resolution from "@/resolution";
import Font from "@/visual/Font";
import Texture2D from "@/core/Texture2D";
import Vector from "@/core/Vector";
import Rectangle from "@/core/Rectangle";
import Log from "@/utils/Log";
import { parseTexturePackerAtlas } from "@/resources/TextureAtlasParser";
const ResourceMgr = {
    init() {
        // merge info into resource entries
        const infos = ResInfo;
        ResScaler.scaleResourceInfos(infos, resolution.CANVAS_SCALE);
        for (let i = 0, len = infos.length; i < len; i++) {
            const info = infos[i];
            delete info.originalRects;
            delete info.offsetAdjustments;

            RES_DATA[info.id].info = info;
        }
    },
    onResourceLoaded(resId, img) {
        const resource = RES_DATA[resId];
        if (!resource) {
            return;
        }

        resource.pendingImage = img;
        this._finalizeTextureResource(resId);
    },
    onAtlasLoaded(resId, atlasData) {
        const resource = RES_DATA[resId];
        if (!resource) {
            return;
        }

        resource.info = this._parseAtlasForResource(resource, atlasData);
        resource._atlasFailed = false;
        this._finalizeTextureResource(resId);
    },
    onAtlasError(resId, error) {
        const resource = RES_DATA[resId];
        if (!resource) {
            return;
        }

        globalThis.console?.error?.("Failed to load atlas for resource", resId, error);
        resource._atlasFailed = true;
        this._finalizeTextureResource(resId);
    },
    _parseAtlasForResource(resource, atlasData) {
        const format = resource.atlasFormat || "texture-packer";
        const existingInfo = resource.info || {};

        switch (format) {
            case "texture-packer":
                return parseTexturePackerAtlas(atlasData, {
                    existingInfo,
                    frameOrder: resource.frameOrder,
                    offsetNormalization: resource.offsetNormalization,
                });
            default:
                globalThis.console?.warn?.("Unsupported atlas format", format);
                return existingInfo;
        }
    },
    _finalizeTextureResource(resId) {
        const resource = RES_DATA[resId];
        if (!resource || !resource.pendingImage) {
            return;
        }

        if (resource.atlasPath && !resource.info && !resource._atlasFailed) {
            return;
        }

        const img = resource.pendingImage;
        delete resource.pendingImage;

        switch (resource.type) {
            case ResourceType.IMAGE:
                resource.texture = new Texture2D(img);
                this.setQuads(resource);
                break;
            case ResourceType.FONT:
                resource.texture = new Texture2D(img);
                this.setQuads(resource);
                if (resource.info) {
                    const font = new Font(),
                        info = resource.info;
                    font.initWithVariableSizeChars(info.chars, resource.texture, info.kerning);
                    font.setOffsets(info.charOffset, info.lineOffset, info.spaceWidth);
                    resource.font = font;
                }
                break;
        }
    },
    /**
     * Sets texture quads from xml info
     * @param {ResEntry} resource
     */
    setQuads(resource) {
        if (!resource || !resource.texture) {
            return;
        }

        const t = resource.texture,
            imageWidth = t.imageWidth,
            imageHeight = t.imageHeight,
            info = resource.info || {},
            rects = info.rects,
            offsets = info.offsets;

        t.preCutSize = Vector.newUndefined();

        if (!rects) {
            return;
        }

        // we need to make sure our scaled quad doesn't slightly
        // exceed the dimensions of the image. we pad images with
        // offsets with 1 extra pixel because offsets are pixel aligned
        // so they might need to go slightly beyond the dimensions
        // specified in the rect
        t.adjustmentMaxX = info.adjustmentMaxX ? info.adjustmentMaxX : 0;
        t.adjustmentMaxY = info.adjustmentMaxY ? info.adjustmentMaxY : 0;

        for (let i = 0, len = rects.length; i < len; i++) {
            // convert it to a Rectangle object
            const rawRect = rects[i],
                rect = new Rectangle(rawRect.x, rawRect.y, rawRect.w, rawRect.h);

            if (rect.w + t.adjustmentMaxX > imageWidth) {
                rect.w = imageWidth - t.adjustmentMaxX;
            }
            if (rect.h + t.adjustmentMaxY > imageHeight) {
                rect.h = imageHeight - t.adjustmentMaxY;
            }

            t.addRect(rect);
        }

        if (offsets) {
            // set the offsets inside the texture
            const oCount = offsets.length;
            let i;
            for (i = 0; i < oCount; i++) {
                const offset = offsets[i];
                t.setOffset(i, offset.x, offset.y);
            }
        }

        // see if there is a pre-cut size specified
        if (info.preCutWidth && info.preCutHeight) {
            t.preCutSize.x = info.preCutWidth;
            t.preCutSize.y = info.preCutHeight;
        }
    },
    getTexture(resId) {
        const resEntry = RES_DATA[resId];
        if (resEntry.texture) {
            return resEntry.texture;
        }

        Log.debug(`Image not yet loaded: ${resEntry.path}`);
        return null;
    },
    getFont(resId) {
        const resEntry = RES_DATA[resId];
        if (resEntry.font) {
            return resEntry.font;
        }

        Log.debug(`Font not yet loaded: ${resEntry.path}`);
        return null;
    },
};

export default ResourceMgr;
