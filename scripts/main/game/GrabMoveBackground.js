define("game/GrabMoveBackground", [
    "visual/ImageElement",
    "visual/HorizontallyTiledImage",
    "resolution",
    "resources/ResourceId",
    "core/Texture2D",
], function (ImageElement, HorizontallyTiledImage, resolution, ResourceId, Texture2D) {
    const IMG_OBJ_HOOK_MOVABLE_bottom_tile_left = 0;
    const IMG_OBJ_HOOK_MOVABLE_bottom_tile_right = 1;
    const IMG_OBJ_HOOK_MOVABLE_bottom_tile_middle = 2;

    const GrabMoveBackground = ImageElement.extend({
        init: function (length) {
            this._super();

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
        },
    });

    return GrabMoveBackground;
});
