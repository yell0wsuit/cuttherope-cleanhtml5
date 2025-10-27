/**
 * Quad2D constructor
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} w width
 * @param {number} h height
 */
class Quad2D {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */

    constructor(x, y, w, h) {
        const rightX = x + w,
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
}

export default Quad2D;
