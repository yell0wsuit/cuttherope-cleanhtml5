import BaseElement from "@/visual/BaseElement";
import Rectangle from "@/core/Rectangle";
import RES_DATA from "@/resources/ResData";
import Canvas from "@/utils/Canvas";
import Constants from "@/utils/Constants";
import Vector from "@/core/Vector";
import ActionType from "@/visual/ActionType";
import Log from "@/utils/Log";
// Note: This class is named Image in the iOS sources but we'll use
// ImageElement to avoid conflicts with the native JS Image class.

/**
 * Texture container with the ability to calculate and draw quads
 */
const ImageElement = BaseElement.extend({
    init: function () {
        this._super();
    },
    /**
     * Set the texture for this image element
     * @param texture {Texture2D}
     */
    initTexture: function (texture) {
        this.texture = texture;
        this.restoreCutTransparency = false;

        if (this.texture.rects.length > 0) this.setTextureQuad(0);
        else this.setDrawFullImage();
    },
    getTexture: function (resId) {
        // using the resMgr would create a circular dependency,
        // so we'll assume its been loaded and fetch directly
        const texture = RES_DATA[resId].texture;
        if (!texture) {
            Log.debug("Image not loaded: " + RES_DATA[resId].path);
        }
        return texture;
    },
    initTextureWithId: function (resId) {
        this.resId = resId;
        this.initTexture(this.getTexture(resId));
    },
    setTextureQuad: function (n) {
        this.quadToDraw = n;

        // don't set width / height to quad size if we cut transparency from each quad
        if (!this.restoreCutTransparency) {
            const rect = this.texture.rects[n];
            this.width = rect.w;
            this.height = rect.h;
        }
    },
    setDrawFullImage: function () {
        this.quadToDraw = Constants.UNDEFINED;
        this.width = this.texture.imageWidth;
        this.height = this.texture.imageHeight;
    },
    doRestoreCutTransparency: function () {
        if (this.texture.preCutSize.x !== Vector.undefined.x) {
            this.restoreCutTransparency = true;
            this.width = this.texture.preCutSize.x;
            this.height = this.texture.preCutSize.y;
        }
    },
    draw: function () {
        this.preDraw();

        // only draw if the image is non-transparent
        if (this.color.a !== 0 && this.texture) {
            if (this.quadToDraw === Constants.UNDEFINED) {
                const qx = this.drawX,
                    qy = this.drawY;

                Canvas.context.drawImage(this.texture.image, qx, qy);
            } else {
                this.drawQuad(this.quadToDraw);
            }
        }

        this.postDraw();
    },
    drawQuad: function (n) {
        let rect = this.texture.rects[n],
            quadWidth = rect.w,
            quadHeight = rect.h,
            qx = this.drawX,
            qy = this.drawY;

        if (this.restoreCutTransparency) {
            const offset = this.texture.offsets[n];
            if (offset) {
                qx += offset.x;
                qy += offset.y;

                // the sprites are generated with rounded offsets, so we
                // need to pad the width and height if there is an offset
                quadWidth += this.texture.adjustmentMaxX;
                quadHeight += this.texture.adjustmentMaxY;
            }
        }

        // if (this.drawSizeIncrement) {
        //     // we need sub-pixel size
        //     quadWidth = ~~(quadWidth / this.drawSizeIncrement) * this.drawSizeIncrement;
        //     quadHeight = ~~(quadHeight / this.drawSizeIncrement) * this.drawSizeIncrement;
        // }
        // else {
        // otherwise by default we snap to pixel boundaries for perf
        quadWidth = (1 + quadWidth) | 0;
        quadHeight = (1 + quadHeight) | 0;
        //}

        // if (this.drawPosIncrement) {
        //     console.log(this.drawPosIncrement, "WAT")
        //     // we need sub-pixel alignment
        //     qx = ~~(qx / this.drawPosIncrement) * this.drawPosIncrement;
        //     qy = ~~(qy / this.drawPosIncrement) * this.drawPosIncrement;
        // }
        //else {
        // otherwise by default we snap to pixel boundaries for perf
        qx = qx | 0;
        qy = qy | 0;
        //}

        Canvas.context.drawImage(
            this.texture.image,
            rect.x,
            rect.y,
            quadWidth,
            quadHeight, // source coordinates
            qx,
            qy,
            quadWidth,
            quadHeight
        ); // destination coordinates
    },
    drawTiled: function (q, x, y, width, height) {
        let ctx = Canvas.context,
            qx = 0,
            qy = 0,
            qw,
            qh,
            rect,
            yoff,
            xoff,
            wd,
            hg;

        if (q === Constants.UNDEFINED) {
            qw = this.texture.imageWidth;
            qh = this.texture.imageHeight;
        } else {
            rect = this.texture.rects[q];
            qx = rect.x;
            qy = rect.y;
            qw = rect.w;
            qh = rect.h;
        }

        let xInc = qw | 0,
            yInc = qh | 0,
            ceilW,
            ceilH;

        yoff = 0;
        while (yoff < height) {
            xoff = 0;
            while (xoff < width) {
                wd = width - xoff;
                if (wd > qw) {
                    wd = qw;
                }
                ceilW = Math.ceil(wd);

                hg = height - yoff;
                if (hg > qh) {
                    hg = qh;
                }
                ceilH = Math.ceil(hg);

                ctx.drawImage(
                    this.texture.image,
                    qx | 0,
                    qy | 0,
                    ceilW,
                    ceilH, // source coordinates
                    (x + xoff) | 0,
                    (y + yoff) | 0,
                    ceilW,
                    ceilH
                ); // dest coordinates

                xoff += xInc;
            }

            yoff += yInc;
        }
    },
    /**
     * Returns true if the point is inside the boundaries of the current quad
     * @param x
     * @param y
     */
    pointInDrawQuad: function (x, y) {
        if (this.quadToDraw === Constants.UNDEFINED) {
            return Rectangle.pointInRect(x, y, this.drawX, this.drawY, this.texture.width, this.texture.height);
        } else {
            let rect = this.texture.rects[this.quadToDraw],
                qx = this.drawX,
                qy = this.drawY;

            if (this.restoreCutTransparency) {
                const offset = this.texture.offsets[this.quadToDraw];
                qx += offset.x;
                qy += offset.y;
            }

            return Rectangle.pointInRect(x, y, qx, qy, rect.w, rect.h);
        }
    },
    /**
     * Returns true if the action was handled
     * @param actionData {ActionData}
     * @return {boolean}
     */
    handleAction: function (actionData) {
        if (this._super(actionData)) {
            return true;
        }

        if (actionData.actionName === ActionType.SET_DRAWQUAD) {
            this.setTextureQuad(actionData.actionParam);
        } else {
            return false;
        }

        return true;
    },
    setElementPositionWithOffset: function (resId, index) {
        const texture = this.getTexture(resId),
            offset = texture.offsets[index];
        this.x = offset.x;
        this.y = offset.y;
    },
    setElementPositionWithCenter: function (resId, index) {
        const texture = this.getTexture(resId),
            rect = texture.rects[index],
            offset = texture.offsets[index];
        this.x = offset.x + rect.w / 2;
        this.y = offset.y + rect.h / 2;
    },
});

ImageElement.create = function (resId, drawQuad) {
    const image = new ImageElement();
    image.initTextureWithId(resId);

    if (drawQuad != null) image.setTextureQuad(drawQuad);

    return image;
};

export default ImageElement;
