import TileMap from "@/visual/TileMap";
import Vector from "@/core/Vector";

class BackgroundTileMap extends TileMap {
    lastCameraPos: Vector;

    constructor(rows: number, columns: number) {
        super(rows, columns);
        this.lastCameraPos = Vector.newUndefined();
    }

    updateWithCameraPos(pos: Vector) {
        if (!this.lastCameraPos.equals(pos)) {
            super.updateWithCameraPos(pos);
            this.lastCameraPos.copyFrom(pos);
        }
    }

    draw() {
        /* seems like this should be taken care of in BaseElement.preDraw?

             let rotationOffsetX = this.back.drawX + (this.back.width >> 1) + this.back.rotationCenterX,
             rotationOffsetY = this.back.drawY + (this.back.height >> 1) + this.back.rotationCenterY,
             ctx = Canvas.context;

             // TODO: skip scaling if unnecessary
             ctx.translate(rotationOffsetX, rotationOffsetY);
             ctx.scale(this.back.scaleX, this.back.scaleY);
             ctx.translate(-rotationOffsetX, -rotationOffsetY);
             */

        super.draw();
    }
}

export default BackgroundTileMap;
