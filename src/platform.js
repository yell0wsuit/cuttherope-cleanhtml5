import WebPlatform from "@/config/platforms/platform-web";
const GeckoPlatform = WebPlatform;

// override audio and video format choices

GeckoPlatform.getAudioExtension = function () {
    return ".mp3";
};

GeckoPlatform.getVideoExtension = function () {
    return ".webm";
};

GeckoPlatform.disableSlowWarning = true;

export default GeckoPlatform;
