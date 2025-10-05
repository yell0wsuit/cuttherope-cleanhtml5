define("resolution", [
    "game/CTRSettings",
    "config/resolutions/scale",
    "config/resolutions/480x270",
    "config/resolutions/768x432",
], function (settings, scaleResolution, res480, res768) {
    // decide which resolution to target
    let resolution;

    // Use 480px (for testing in desktop browser)
    resolution = res480;

    scaleResolution(resolution);
    resolution.isHD = false;

    return resolution;
});