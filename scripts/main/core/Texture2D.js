define("core/Texture2D", ["core/Vector", "core/Quad2D"], function (Vector, Quad2D) {
    const Texture2D = function (image) {
        this.image = image;
        this.rects = [];
        this.offsets = [];
        this.preCutSize = Vector.newUndefined();

        // use jquery to work around intermittent dimension issues with images
        const $img = $(image);
        this.imageWidth = image.width || $img.width();
        this.imageHeight = image.height || $img.height();
        this._invWidth = 1 / this.imageWidth;
        this._invHeight = 1 / this.imageHeight;

        // sometimes we need to adjust offsets to pixel align
        this.adjustmentMaxX = 0;
        this.adjustmentMaxY = 0;
    };

    Texture2D.prototype.addRect = function (rect) {
        this.rects.push(rect);
        this.offsets.push(new Vector(0, 0));
    };

    Texture2D.prototype.setOffset = function (index, x, y) {
        const offset = this.offsets[index];
        offset.x = x;
        offset.y = y;
    };

    Texture2D.prototype.getCoordinates = function (rect) {
        return new Quad2D(
            this._invWidth * rect.x,
            this._invHeight * rect.y,
            this._invWidth * rect.w,
            this._invHeight * rect.h
        );
    };

    return Texture2D;
});
