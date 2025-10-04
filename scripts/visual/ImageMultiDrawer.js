define("visual/ImageMultiDrawer", [
  "visual/BaseElement",
  "utils/Canvas",
  "utils/Constants",
  "core/Rectangle",
], function (BaseElement, Canvas, Constants, Rectangle) {
  /**
   * Holds the information necessary to draw multiple quads from a
   * shared source image texture
   */
  var ImageMultiDrawer = BaseElement.extend({
    init: function (texture) {
      this._super();

      this.texture = texture;
      this.numberOfQuadsToDraw = Constants.UNDEFINED;

      // holds the position in the texture that should be drawn
      this.texCoordinates = [];

      // holds the position on the canvas to render the texture quad
      this.vertices = [];

      // hold the alpha for each quad (if null then we assume alpha=1)
      this.alphas = [];

      // NOTE: in OpenGL its possible to draw multiple quads at once. In
      // canvas we'll just draw them sequentially (no need for indices buffer)
    },
    setTextureQuad: function (index, textureQuad, vertexQuad, alpha) {
      this.texCoordinates[index] = textureQuad;
      this.vertices[index] = vertexQuad;
      this.alphas[index] = alpha != null ? alpha : 1;
    },
    removeQuads: function (index) {
      this.texCoordinates.splice(index, 1);
      this.vertices.splice(index, 1);
      this.alphas.splice(index, 1);
    },
    mapTextureQuad: function (quadIndex, dx, dy, index) {
      this.texCoordinates[index] = Rectangle.copy(
        this.texture.rects[quadIndex],
      );

      var offset = this.texture.offsets[quadIndex],
        rect = this.texture.rects[quadIndex];
      this.vertices[index] = new Rectangle(
        dx + offset.x,
        dy + offset.y,
        rect.w,
        rect.h,
      );
      this.alphas[index] = 1;
    },
    drawNumberOfQuads: function (n) {
      if (n > this.texCoordinates.length) {
        n = this.texCoordinates.length;
      }

      //console.log("DRAW NO OF QUADS", n)
      var ctx = Canvas.context;
      for (var i = 0; i < n; i++) {
        var source = this.texCoordinates[i],
          dest = this.vertices[i],
          alpha = this.alphas[i],
          previousAlpha = ctx.globalAlpha,
          sourceW = Math.ceil(source.w),
          sourceH = Math.ceil(source.h);

        // verify we need to draw the source
        if (sourceW === 0 || sourceH === 0) {
          continue;
        }

        // change the alpha if necessary
        if (alpha == null) {
          // if alpha was not specified, we assume full opacity
          alpha = 1;
        } else if (alpha <= 0) {
          // no need to draw invisible images
          continue;
        } else if (alpha < 1) {
          ctx.globalAlpha = alpha;
        }

        // rotate the image if requested
        var checkRotation =
          this.rotationAngles && this.rotationAngles.length > i;
        if (checkRotation) {
          var rotationAngle = this.rotationAngles[i],
            rotationPosition = this.rotationPositions[i],
            rotateIsTranslated =
              rotationPosition.x !== 0 || rotationPosition.y !== 0;

          if (rotationAngle !== 0) {
            if (rotateIsTranslated) {
              ctx.translate(rotationPosition.x, rotationPosition.y);
            }
            ctx.rotate(rotationAngle);
            if (rotateIsTranslated) {
              ctx.translate(-rotationPosition.x, -rotationPosition.y);
            }
          }
        }

        // see if we need sub-pixel alignment
        var qx, qy, qw, qh;
        // if (this.drawPosIncrement) {
        //     qx = Math.round(dest.x / this.drawPosIncrement) * this.drawPosIncrement;
        //     qy = Math.round(dest.y / this.drawPosIncrement) * this.drawPosIncrement;
        //     qw = Math.round(dest.w / this.drawPosIncrement) * this.drawPosIncrement;
        //     qh = Math.round(dest.h / this.drawPosIncrement) * this.drawPosIncrement;
        // }
        // else {
        // otherwise by default we snap to pixel boundaries for perf
        qx = ~~dest.x;
        qy = ~~dest.y;

        // use ceil so that we match the source when scale is equal
        qw = 1 + ~~dest.w;
        qh = 1 + ~~dest.h;
        //}

        ctx.drawImage(
          this.texture.image,
          source.x,
          source.y,
          sourceW,
          sourceH, // source coordinates
          qx,
          qy,
          qw,
          qh,
        ); // destination coordinates

        // undo the rotation
        if (checkRotation && rotationAngle !== 0) {
          if (rotateIsTranslated) {
            ctx.translate(rotationPosition.x, rotationPosition.y);
          }
          ctx.rotate(-rotationAngle);
          if (rotateIsTranslated) {
            ctx.translate(-rotationPosition.x, -rotationPosition.y);
          }
        }

        // undo alpha changes
        if (alpha !== 1) {
          ctx.globalAlpha = previousAlpha;
        }
      }
    },
    draw: function () {
      this.preDraw();

      // only draw if the image is non-transparent
      if (this.color.a !== 0) {
        var ctx = Canvas.context,
          shouldTranslate = this.drawX !== 0 || this.drawY !== 0;

        if (shouldTranslate) {
          ctx.translate(this.drawX, this.drawY);
        }

        var count =
          this.numberOfQuadsToDraw === Constants.UNDEFINED
            ? this.texCoordinates.length
            : this.numberOfQuadsToDraw;
        this.drawNumberOfQuads(count);

        if (shouldTranslate) {
          ctx.translate(-this.drawX, -this.drawY);
        }
      }

      this.postDraw();
    },
  });

  return ImageMultiDrawer;
});
