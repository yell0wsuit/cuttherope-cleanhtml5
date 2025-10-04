define("resources/ResourceMgr", [
    "ResInfo",
    "resources/ResData",
    "resources/ResScale",
    "resources/ResourceType",
    "resolution",
    "visual/Font",
    "core/Texture2D",
    "core/Vector",
    "core/Rectangle",
    "utils/Log",
], function (
    ResInfo,
    RES_DATA,
    ResScaler,
    ResourceType,
    resolution,
    Font,
    Texture2D,
    Vector,
    Rectangle,
    Log
) {
    var ResourceMgr = {
        init: function () {
            // merge info into resource entries
            var infos = ResInfo;
            ResScaler.scaleResourceInfos(infos, resolution.CANVAS_SCALE);
            for (var i = 0, len = infos.length; i < len; i++) {
                var info = infos[i];
                delete info.originalRects;
                delete info.offsetAdjustments;

                RES_DATA[info.id].info = info;
            }
        },
        onResourceLoaded: function (resId, img) {
            // we store the resource id in the custom id
            var resource = RES_DATA[resId];
            switch (resource.type) {
                case ResourceType.IMAGE:
                    resource.texture = new Texture2D(img);
                    this.setQuads(resource);
                    break;
                case ResourceType.FONT:
                    resource.texture = new Texture2D(img);
                    this.setQuads(resource);
                    var font = new Font(),
                        info = resource.info;
                    font.initWithVariableSizeChars(info.chars, resource.texture, info.kerning);
                    font.setOffsets(info.charOffset, info.lineOffset, info.spaceWidth);
                    resource.font = font;
                    break;
            }
        },
        /**
         * Sets texture quads from xml info
         * @param resource {ResEntry}
         */
        setQuads: function (resource) {
            var t = resource.texture,
                imageWidth = t.imageWidth,
                imageHeight = t.imageHeight,
                info = resource.info,
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

            for (var i = 0, len = rects.length; i < len; i++) {
                // convert it to a Rectangle object
                var rawRect = rects[i],
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
                var oCount = offsets.length;
                for (i = 0; i < oCount; i++) {
                    var offset = offsets[i];
                    t.setOffset(i, offset.x, offset.y);
                }
            }

            // see if there is a pre-cut size specified
            if (info.preCutWidth && info.preCutHeight) {
                t.preCutSize.x = info.preCutWidth;
                t.preCutSize.y = info.preCutHeight;
            }
        },
        getTexture: function (resId) {
            var resEntry = RES_DATA[resId];
            if (resEntry.texture) {
                return resEntry.texture;
            }

            Log.debug("Image not yet loaded:" + resEntry.path);
            return null;
        },
        getFont: function (resId) {
            var resEntry = RES_DATA[resId];
            if (resEntry.font) {
                return resEntry.font;
            }

            Log.debug("Font not yet loaded:" + resEntry.path);
            return null;
        },
    };

    return ResourceMgr;
});
