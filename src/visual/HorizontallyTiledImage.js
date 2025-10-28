import ImageElement from "@/visual/ImageElement";
import Canvas from "@/utils/Canvas";
import Alignment from "@/core/Alignment";

class HorizontallyTiledImage extends ImageElement {
    constructor() {
        super();
    }

    /**
     * Set the texture for this image element
     * @param {Texture2D} texture
     */
    initTexture(texture) {
        super.initTexture(texture);

        /**
         * @type {number[]}
         */
        this.tiles = [];
        /**
         * @type {number[]}
         */
        this.offsets = [];
        this.align = Alignment.CENTER;
    }

    /**
     * @param {number} left
     * @param {number} center
     * @param {number} right
     */
    setTileHorizontally(left, center, right) {
        if (!this.tiles || this.tiles.length === 0) {
            return;
        }

        this.tiles[0] = left;
        this.tiles[1] = center;
        this.tiles[2] = right;

        const h1 = this.texture.rects[left].h;
        const h2 = this.texture.rects[center].h;
        const h3 = this.texture.rects[right].h;

        if (h1 >= h2 && h1 >= h3) {
            this.height = h1;
        } else if (h2 >= h1 && h2 >= h3) {
            this.height = h2;
        } else {
            this.height = h3;
        }

        if (!this.offsets || this.offsets.length === 0) {
            return;
        }

        this.offsets[0] = ~~((this.height - h1) / 2.0);
        this.offsets[1] = ~~((this.height - h2) / 2.0);
        this.offsets[2] = ~~((this.height - h3) / 2.0);
    }

    draw() {
        this.preDraw();

        if (!this.tiles || this.tiles.length === 0) {
            return;
        }

        const left = this.texture.rects[this.tiles[0]];
        const center = this.texture.rects[this.tiles[1]];
        const right = this.texture.rects[this.tiles[2]];
        const tileWidth = this.width - (~~left.w + ~~right.w);
        const ctx = Canvas.context;
        const dx = Math.round(this.drawX);
        const dy = Math.round(this.drawY);
        const leftCeilW = Math.ceil(left.w);
        const leftCeilH = Math.ceil(left.h);
        const rightCeilW = Math.ceil(right.w);
        const rightCeilH = Math.ceil(right.h);

        if (!ctx) {
            return;
        }

        if (!this.offsets || this.offsets.length === 0) {
            return;
        }

        if (tileWidth >= 0) {
            ctx.drawImage(
                this.texture.image,
                left.x,
                left.y,
                leftCeilW,
                leftCeilH,
                dx,
                dy + this.offsets[0],
                leftCeilW,
                leftCeilH
            );
            this.drawTiled(
                this.tiles[1],
                dx + leftCeilW,
                dy + this.offsets[1],
                tileWidth,
                center.h
            );
            ctx.drawImage(
                this.texture.image,
                right.x,
                right.y,
                rightCeilW,
                rightCeilH,
                dx + leftCeilW + tileWidth,
                dy + this.offsets[2],
                rightCeilW,
                rightCeilH
            );
        } else {
            const p1 = left.copy(),
                p2 = right.copy();
            p1.w = Math.min(p1.w, this.width / 2);
            p2.w = Math.min(p2.w, this.width - p1.w);
            p2.x += right.w - p2.w;

            ctx.drawImage(
                this.texture.image,
                p1.x,
                p1.y,
                p1.w,
                p1.h,
                dx,
                dy + this.offsets[0],
                p1.w,
                p1.h
            );
            ctx.drawImage(
                this.texture.image,
                p2.x,
                p2.y,
                p2.w,
                p2.h,
                dx + p1.w,
                dy + this.offsets[2],
                p2.w,
                p2.h
            );
        }

        this.postDraw();
    }

    /**
     * Draw the tile image to an offscreen canvas and return an Image
     * @return {HTMLImageElement | undefined}
     */
    getImage() {
        // save the existing canvas id and switch to the hidden canvas
        const existingCanvas = Canvas.element;

        // create a temporary canvas to use
        Canvas.setTarget(document.createElement("canvas"));

        // set the canvas width and height
        const canvas = Canvas.element;
        const imgWidth = Math.ceil(this.width);
        const imgHeight = Math.ceil(this.height);

        if (!canvas) {
            return;
        }

        canvas.width = imgWidth;
        canvas.height = imgHeight;

        this.draw();
        const imageData = canvas.toDataURL("image/png");
        const img = new Image();

        img.src = imageData;

        img.width = imgWidth;
        img.height = imgHeight;

        // restore the original canvas for the App
        if (existingCanvas) {
            Canvas.setTarget(existingCanvas);
        }

        return img;
    }
}

export default HorizontallyTiledImage;
