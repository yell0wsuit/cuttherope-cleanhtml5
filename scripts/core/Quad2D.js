define("core/Quad2D", [], function () {
  /**
   * Quad2D constructor
   * @constructor
   * @param x {number}
   * @param y {number}
   * @param w {number} width
   * @param h {number} height
   */
  function Quad2D(x, y, w, h) {
    var rightX = x + w,
      bottomY = y + h;

    // top left
    this.tlX = x;
    this.tlY = y;

    // top right
    this.trX = rightX;
    this.trY = y;

    // bottom left
    this.blX = x;
    this.blY = bottomY;

    // bottom right
    this.brX = rightX;
    this.brY = bottomY;
  }

  return Quad2D;
});
