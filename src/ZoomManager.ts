import ZoomManager from "@/config/resolutions/ZoomManager";
import resolution from "@/resolution";

ZoomManager.domReady = function () {
    this.setElementId("gameContainer");

    this.nativeWidth = resolution.UI_WIDTH;
    this.nativeHeight = resolution.UI_HEIGHT;
    // this.resize(true /* skipZoom */);

    // Enable auto-resizing instead of skipping zoom
    this.autoResize();
};

export default ZoomManager;
