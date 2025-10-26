import WebPlatform from "@/config/platforms/platform-web";
const GeckoPlatform = WebPlatform;

// override audio and video format choices

GeckoPlatform.getAudioExtension = function () {
    return ".ogg";
};

GeckoPlatform.getVideoExtension = function () {
    return ".mp4";
};

GeckoPlatform.disableSlowWarning = true;

export default GeckoPlatform;
