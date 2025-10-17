import TileMap from "@/visual/TileMap";
import Vector from "@/core/Vector";
const BackgroundTileMap = TileMap.extend({
    init: function (rows, columns) {
        this._super(rows, columns);
        this.lastCameraPos = Vector.newUndefined();
    },
    updateWithCameraPos: function (pos) {
        if (!this.lastCameraPos.equals(pos)) {
            this._super(pos);
            this.lastCameraPos.copyFrom(pos);
        }
    },
    draw: function () {
        /* seems like this should be taken care of in BaseElement.preDraw?

             let rotationOffsetX = this.back.drawX + (this.back.width >> 1) + this.back.rotationCenterX,
             rotationOffsetY = this.back.drawY + (this.back.height >> 1) + this.back.rotationCenterY,
             ctx = Canvas.context;

             // TODO: skip scaling if unnecessary
             ctx.translate(rotationOffsetX, rotationOffsetY);
             ctx.scale(this.back.scaleX, this.back.scaleY);
             ctx.translate(-rotationOffsetX, -rotationOffsetY);
             */

        this._super();
    },
});

export default BackgroundTileMap;
