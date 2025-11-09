import ImageElement from "@/visual/ImageElement";
import HorizontallyTiledImage from "@/visual/HorizontallyTiledImage";
import resolution from "@/resolution";
import ResourceId from "@/resources/ResourceId";
import Texture2D from "@/core/Texture2D";

const IMG_OBJ_HOOK_MOVABLE_bottom_tile_left = 0;
const IMG_OBJ_HOOK_MOVABLE_bottom_tile_right = 1;
const IMG_OBJ_HOOK_MOVABLE_bottom_tile_middle = 2;

class GrabMoveBackground extends ImageElement {
    constructor(length: number) {
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
        const generatedWidth = Math.ceil(tiledImage.width);
        const generatedHeight = Math.ceil(tiledImage.height);

        const textureSource = completeImage
            ? {
                  drawable: completeImage,
                  width: generatedWidth,
                  height: generatedHeight,
              }
            : null;

        this.initTexture(new Texture2D(textureSource));
    }
}

export default GrabMoveBackground;
