define("visual/TileMap", [
  "visual/BaseElement",
  "visual/ImageMultiDrawer",
  "core/Rectangle",
  "resolution",
  "utils/Constants",
  "utils/MathHelper",
  "core/Vector",
], function (
  BaseElement,
  ImageMultiDrawer,
  Rectangle,
  resolution,
  Constants,
  MathHelper,
  Vector,
) {
  /**
   * An entry in the tile map
   * @constructor
   * @param drawerIndex {number}
   * @param quadIndex {number}
   */
  function TileEntry(drawerIndex, quadIndex) {
    this.drawerIndex = drawerIndex;
    this.quad = quadIndex;
  }

  var TileMap = BaseElement.extend({
    init: function (rows, columns) {
      this._super();

      this.rows = rows;
      this.columns = columns;

      this.cameraViewWidth = resolution.CANVAS_WIDTH;
      this.cameraViewHeight = resolution.CANVAS_HEIGHT;

      this.parallaxRatio = 1;

      this.drawers = [];
      this.tiles = [];

      this.matrix = [];
      for (var i = 0; i < columns; i++) {
        var column = (this.matrix[i] = []);
        for (var k = 0; k < rows; k++) {
          column[k] = Constants.UNDEFINED;
        }
      }

      this.repeatedVertically = TileMap.RepeatType.NONE;
      this.repeatedHorizontally = TileMap.RepeatType.NONE;
      this.horizontalRandom = false;
      this.verticalRandom = false;
      this.restoreTileTransparency = true;
      this.randomSeed = MathHelper.randomRange(1000, 2000);
    },
    addTile: function (texture, quadIndex) {
      if (quadIndex === Constants.UNDEFINED) {
        this.tileWidth = texture.imageWidth;
        this.tileHeight = texture.imageHeight;
      } else {
        var rect = texture.rects[quadIndex];
        this.tileWidth = rect.w;
        this.tileHeight = rect.h;
      }

      this.updateVars();

      var drawerId = Constants.UNDEFINED;
      for (var i = 0, len = this.drawers.length; i < len; i++) {
        if (this.drawers[i].texture === texture) {
          drawerId = i;
          break;
        }
      }

      if (drawerId === Constants.UNDEFINED) {
        var d = new ImageMultiDrawer(texture);
        drawerId = this.drawers.length;
        this.drawers.push(d);
      }

      var entry = new TileEntry(drawerId, quadIndex);
      this.tiles.push(entry);
    },
    updateVars: function () {
      this.maxColsOnScreen =
        2 + ~~(this.cameraViewWidth / (this.tileWidth + 1));
      this.maxRowsOnScreen =
        2 + ~~(this.cameraViewHeight / (this.tileHeight + 1));

      if (this.repeatedVertically === TileMap.RepeatType.NONE) {
        this.maxRowsOnScreen = Math.min(this.maxRowsOnScreen, this.rows);
      }

      if (this.repeatedHorizontally === TileMap.RepeatType.NONE) {
        this.maxColsOnScreen = Math.min(this.maxColsOnScreen, this.columns);
      }

      this.width = this.tileMapWidth = this.columns * this.tileWidth;
      this.height = this.tileMapHeight = this.rows * this.tileHeight;
    },
    /**
     * Fills the tilemap matrix with the specified tile entry index
     * @param startRow {number}
     * @param startCol {number}
     * @param numRows {number}
     * @param numCols {number}
     * @param tileIndex {number}
     */
    fill: function (startRow, startCol, numRows, numCols, tileIndex) {
      for (var i = startCol, colEnd = startCol + numCols; i < colEnd; i++) {
        for (var k = startRow, rowEnd = startRow + numRows; k < rowEnd; k++) {
          this.matrix[i][k] = tileIndex;
        }
      }
    },
    setParallaxRation: function (ratio) {
      this.parallaxRatio = ratio;
    },
    /**
     * @param repeatType {TileMap.RepeatType}
     */
    setRepeatHorizontally: function (repeatType) {
      this.repeatedHorizontally = repeatType;
      this.updateVars();
    },
    setRepeatVertically: function (repeatType) {
      this.repeatedVertically = repeatType;
      this.updateVars();
    },
    /**
     * Updates the tile map based on the current camera position
     * @param pos {Vector}
     */
    updateWithCameraPos: function (pos) {
      var mx = Math.round(pos.x / this.parallaxRatio),
        my = Math.round(pos.y / this.parallaxRatio),
        tileMapStartX = this.x,
        tileMapStartY = this.y,
        a,
        i,
        len,
        v;

      if (this.repeatedVertically !== TileMap.RepeatType.NONE) {
        var ys = tileMapStartY - my;
        a = ~~ys % this.tileMapHeight;
        if (ys < 0) {
          tileMapStartY = a + my;
        } else {
          tileMapStartY = a - this.tileMapHeight + my;
        }
      }

      if (this.repeatedHorizontally !== TileMap.RepeatType.NONE) {
        var xs = tileMapStartX - mx;
        a = ~~xs % this.tileMapWidth;
        if (xs < 0) {
          tileMapStartX = a + mx;
        } else {
          tileMapStartX = a - this.tileMapWidth + mx;
        }
      }

      // see if tile map is in the camera view
      if (
        !Rectangle.rectInRect(
          mx,
          my,
          mx + this.cameraViewWidth,
          my + this.cameraViewHeight,
          tileMapStartX,
          tileMapStartY,
          tileMapStartX + this.tileMapWidth,
          tileMapStartY + this.tileMapHeight,
        )
      ) {
        return;
      }

      var cameraInTilemap = Rectangle.rectInRectIntersection(
        tileMapStartX,
        tileMapStartY,
        this.tileMapWidth,
        this.tileMapHeight, // tile map rect
        mx,
        my,
        this.cameraViewWidth,
        this.cameraViewHeight,
      ); // camera rect

      var checkPoint = new Vector(
        Math.max(0, cameraInTilemap.x),
        Math.max(0, cameraInTilemap.y),
      );

      //noinspection JSSuspiciousNameCombination
      var startPos = new Vector(
        ~~(~~checkPoint.x / this.tileWidth),
        ~~(~~checkPoint.y / this.tileHeight),
      );

      var highestQuadY = tileMapStartY + startPos.y * this.tileHeight,
        currentQuadPos = new Vector(
          tileMapStartX + startPos.x * this.tileWidth,
          highestQuadY,
        );

      // reset the number of quads to draw
      for (i = 0, len = this.drawers.length; i < len; i++) {
        this.drawers[i].numberOfQuadsToDraw = 0;
      }

      var maxColumn = startPos.x + this.maxColsOnScreen - 1,
        maxRow = startPos.y + this.maxRowsOnScreen - 1;

      if (this.repeatedVertically === TileMap.RepeatType.NONE) {
        maxRow = Math.min(this.rows - 1, maxRow);
      }
      if (this.repeatedHorizontally === TileMap.RepeatType.NONE) {
        maxColumn = Math.min(this.columns - 1, maxColumn);
      }

      for (i = startPos.x; i <= maxColumn; i++) {
        currentQuadPos.y = highestQuadY;
        for (var j = startPos.y; j <= maxRow; j++) {
          if (currentQuadPos.y >= my + this.cameraViewHeight) {
            break;
          }

          // find intersection rectangle between camera rectangle and every tiled
          // texture rectangle
          var resScreen = Rectangle.rectInRectIntersection(
            mx,
            my,
            this.cameraViewWidth,
            this.cameraViewHeight,
            currentQuadPos.x,
            currentQuadPos.y,
            this.tileWidth,
            this.tileHeight,
          );

          var resTexture = new Rectangle(
            mx - currentQuadPos.x + resScreen.x,
            my - currentQuadPos.y + resScreen.y,
            resScreen.w,
            resScreen.h,
          );

          var ri = Math.round(i),
            rj = Math.round(j);

          if (this.repeatedVertically === TileMap.RepeatType.EDGES) {
            if (currentQuadPos.y < y) {
              rj = 0;
            } else if (currentQuadPos.y >= this.y + this.tileMapHeight) {
              rj = this.rows - 1;
            }
          }

          if (this.repeatedHorizontally === TileMap.RepeatType.EDGES) {
            if (currentQuadPos.x < this.x) {
              ri = 0;
            } else if (currentQuadPos.x >= this.x + this.tileMapWidth) {
              ri = this.columns - 1;
            }
          }

          if (this.horizontalRandom) {
            v = Math.sin(currentQuadPos.x) * this.randomSeed;
            ri = Math.abs(~~v % this.columns);
          }

          if (this.verticalRandom) {
            v = Math.sin(currentQuadPos.y) * this.randomSeed;
            rj = Math.abs(~~v % this.rows);
          }

          if (ri >= this.columns) {
            ri = ri % this.columns;
          }

          if (rj >= this.rows) {
            rj = rj % this.rows;
          }

          var tile = this.matrix[ri][rj];
          if (tile >= 0) {
            var entry = this.tiles[tile],
              drawer = this.drawers[entry.drawerIndex],
              texture = drawer.texture;

            if (entry.quad !== Constants.UNDEFINED) {
              var rect = texture.rects[entry.quad];
              resTexture.x += rect.x;
              resTexture.y += rect.y;
            }

            var vertRect = new Rectangle(
              pos.x + resScreen.x,
              pos.y + resScreen.y,
              resScreen.w,
              resScreen.h,
            );

            drawer.setTextureQuad(
              drawer.numberOfQuadsToDraw++,
              resTexture,
              vertRect,
            );
          }
          currentQuadPos.y += this.tileHeight;
        }
        currentQuadPos.x += this.tileWidth;

        if (currentQuadPos.x >= mx + this.cameraViewWidth) {
          break;
        }
      }
    },
    draw: function () {
      this.preDraw();
      for (var i = 0, len = this.drawers.length; i < len; i++) {
        this.drawers[i].draw();
      }
      this.postDraw();
    },
  });

  /**
   * @enum {number}
   */
  TileMap.RepeatType = {
    NONE: 0,
    ALL: 1,
    EDGES: 2,
  };

  return TileMap;
});
