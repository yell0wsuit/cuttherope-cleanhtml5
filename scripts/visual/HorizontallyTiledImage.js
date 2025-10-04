define("visual/HorizontallyTiledImage", [
  "visual/ImageElement",
  "utils/Canvas",
  "core/Alignment",
], function (ImageElement, Canvas, Alignment) {
  var HorizontallyTiledImage = ImageElement.extend({
    init: function () {
      this._super();
    },
    /**
     * Set the texture for this image element
     * @param texture {Texture2D}
     */
    initTexture: function (texture) {
      this._super(texture);

      this.tiles = [];
      this.offsets = [];
      this.align = Alignment.CENTER;
    },
    setTileHorizontally: function (left, center, right) {
      this.tiles[0] = left;
      this.tiles[1] = center;
      this.tiles[2] = right;

      var h1 = this.texture.rects[left].h,
        h2 = this.texture.rects[center].h,
        h3 = this.texture.rects[right].h;

      if (h1 >= h2 && h1 >= h3) {
        this.height = h1;
      } else if (h2 >= h1 && h2 >= h3) {
        this.height = h2;
      } else {
        this.height = h3;
      }

      this.offsets[0] = ~~((this.height - h1) / 2.0);
      this.offsets[1] = ~~((this.height - h2) / 2.0);
      this.offsets[2] = ~~((this.height - h3) / 2.0);
    },
    draw: function () {
      this.preDraw();

      var left = this.texture.rects[this.tiles[0]],
        center = this.texture.rects[this.tiles[1]],
        right = this.texture.rects[this.tiles[2]],
        tileWidth = this.width - (~~left.w + ~~right.w),
        ctx = Canvas.context,
        dx = Math.round(this.drawX),
        dy = Math.round(this.drawY),
        leftCeilW = Math.ceil(left.w),
        leftCeilH = Math.ceil(left.h),
        rightCeilW = Math.ceil(right.w),
        rightCeilH = Math.ceil(right.h);

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
          leftCeilH,
        );
        this.drawTiled(
          this.tiles[1],
          dx + leftCeilW,
          dy + this.offsets[1],
          tileWidth,
          center.h,
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
          rightCeilH,
        );
      } else {
        var p1 = left.copy(),
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
          p1.h,
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
          p2.h,
        );
      }

      this.postDraw();
    },

    /**
     * Draw the tile image to an offscreen canvas and return an Image
     */
    getImage: function () {
      // save the existing canvas id and switch to the hidden canvas
      var existingCanvas = Canvas.element;

      // create a temporary canvas to use
      Canvas.setTarget(document.createElement("canvas"));

      // set the canvas width and height
      var canvas = Canvas.element,
        imgWidth = Math.ceil(this.width),
        imgHeight = Math.ceil(this.height);
      canvas.width = imgWidth;
      canvas.height = imgHeight;

      this.draw();
      var imageData = canvas.toDataURL("image/png"),
        img = new Image();

      img.src = imageData;

      // NOTE: important to use jQuery to avoid intermittent dimension issues
      $(img).width(imgWidth).height(imgHeight);

      // restore the original canvas for the App
      if (existingCanvas) {
        Canvas.setTarget(existingCanvas);
      }

      return img;
    },
  });

  return HorizontallyTiledImage;
});
