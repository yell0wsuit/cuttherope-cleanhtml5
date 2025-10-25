/**
 * Quad2D constructor
 * @constructor
 * @param x {number}
 * @param y {number}
 * @param w {number} width
 * @param h {number} height
 */
class Quad2D {
    tlX: number;
    tlY: number;
    trX: number;
    trY: number;
    blX: number;
    blY: number;
    brX: number;
    brY: number;

    constructor(x: number, y: number, w: number, h: number) {
        const rightX = x + w;
        const bottomY = y + h;

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
