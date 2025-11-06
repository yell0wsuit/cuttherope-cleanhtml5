/**
 * Quad2D constructor
 */
class Quad2D {
    public tlX: number;
    public tlY: number;
    public trX: number;
    public trY: number;
    public blX: number;
    public blY: number;
    public brX: number;
    public brY: number;

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
