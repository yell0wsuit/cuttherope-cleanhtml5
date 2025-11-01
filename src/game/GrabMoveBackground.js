import ImageElement from "@/visual/ImageElement";
import HorizontallyTiledImage from "@/visual/HorizontallyTiledImage";
import resolution from "@/resolution";
import ResourceId from "@/resources/ResourceId";
import Texture2D from "@/core/Texture2D";

const IMG_OBJ_HOOK_MOVABLE_bottom_tile_left = 0;
const IMG_OBJ_HOOK_MOVABLE_bottom_tile_right = 1;
const IMG_OBJ_HOOK_MOVABLE_bottom_tile_middle = 2;

class GrabMoveBackground extends ImageElement {
    /**
     * @param {number} length
     */
    constructor(length) {
        super();

        // render the tiled image once and cache the image
        const tiledImage = new HorizontallyTiledImage();
        tiledImage.initTextureWithId(ResourceId.IMG_OBJ_HOOK_MOVABLE);
        tiledImage.setTileHorizontally(
            IMG_OBJ_HOOK_MOVABLE_bottom_tile_left,
            IMG_OBJ_HOOK_MOVABLE_bottom_tile_middle,
            IMG_OBJ_HOOK_MOVABLE_bottom_tile_right
        );

        tiledImage.width = length + resolution.GRAB_MOVE_BG_WIDTH;

        const completeImage = tiledImage.getImage();
        this.initTexture(new Texture2D(completeImage));
    }
}

export default GrabMoveBackground;
