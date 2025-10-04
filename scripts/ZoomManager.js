define("ZoomManager", ["config/resolutions/ZoomManager", "resolution"], function (ZoomManager, resolution) {
    ZoomManager.domReady = function () {
        // no scaling, just center the game
        this.setElementId("gameContainer");

        this.nativeWidth = resolution.UI_WIDTH;
        this.nativeHeight = resolution.UI_HEIGHT;
        this.resize(true /* skipZoom */);
    };

    return ZoomManager;
});
