define("platform", ["config/platforms/platform-web"], function (WebPlatform) {
    const GeckoPlatform = WebPlatform;

    // override audio and video format choices

    GeckoPlatform.getAudioExtension = function () {
        return ".mp3";
    };

    GeckoPlatform.getVideoExtension = function () {
        return ".webm";
    };

    GeckoPlatform.disableSlowWarning = true;

    return GeckoPlatform;
});
