import edition from "@/edition";
import resolution from "@/resolution";
import platform from "@/platform";
import PanelId from "@/ui/PanelId";
import PanelManager from "@/ui/PanelManager";
import settings from "@/game/CTRSettings";
import SoundMgr from "@/game/CTRSoundMgr";
import PubSub from "@/utils/PubSub";
import ScoreManager from "@/ui/ScoreManager";
const ensureVideoElement = function () {
    let vid = document.getElementById("vid");
    if (!vid) {
        try {
            vid = document.createElement("video");
        } catch (ex) {
            // creation of the video element occasionally fails in win8
            return null;
        }
        vid.id = "vid";
        vid.className = "ctrPointer";
        document.getElementById("video").appendChild(vid);
    }
    return vid;
};

const fadeIn = function (element, duration, callback) {
    element.style.opacity = 0;
    element.style.display = "block";
    let start = null;
    const animate = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else if (callback) {
            callback();
        }
    };
    requestAnimationFrame(animate);
};

const fadeOut = function (element, duration, callback) {
    element.style.opacity = 1;
    let start = null;
    const animate = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.max(1 - progress / duration, 0);
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = "none";
            if (callback) {
                callback();
            }
        }
    };
    requestAnimationFrame(animate);
};

let closeIntroCallback = null;

const VideoManager = {
    loadIntroVideo: function () {
        // only load the video if the first level hasn't been played
        const firstLevelStars = ScoreManager.getStars(0, 0) || 0;
        if (firstLevelStars === 0) {
            const vid = ensureVideoElement(),
                size = resolution.VIDEO_WIDTH,
                extension = platform.getVideoExtension(),
                baseUrl = platform.videoBaseUrl;
            if (vid != null && extension != null) {
                try {
                    vid.src = baseUrl + "intro_" + size + extension;
                    vid.load();
                } catch (ex) {
                    // loading the video sometimes causes an exception on win8
                }
            }
        }
    },

    removeIntroVideo: function () {
        // we want to remove the video element to free up resources
        // as suggested by the IE team
        const firstLevelStars = ScoreManager.getStars(0, 0) || 0;
        if (firstLevelStars > 0) {
            const vid = document.getElementById("vid");
            if (vid) {
                vid.remove();
            }
        }
    },

    playIntroVideo: function (callback) {
        // always show the intro video if the 1st level hasn't been played
        const firstLevelStars = ScoreManager.getStars(0, 0) || 0,
            // the video might not exist if the user just reset the game
            // (we don't want to replay it during the same app session)
            vid = document.getElementById("vid");

        closeIntroCallback = callback;

        if (firstLevelStars === 0 && vid) {
            // make sure we can play the video
            const readyState = vid["readyState"];
            if (
                readyState === 2 || // HAVE_CURRENT_DATA (loadeddata)
                readyState === 3 || // HAVE_FUTURE_DATA  (canplay)
                readyState === 4
            ) {
                // HAVE_ENOUGH_DATA  (canplaythrough)

                SoundMgr.pauseMusic();
                fadeIn(vid, 300, function () {
                    vid.play();
                });
                vid.addEventListener("ended", VideoManager.closeIntroVideo);
                vid.addEventListener("mousedown", VideoManager.closeIntroVideo);
                return;
            }
        }

        VideoManager.closeIntroVideo();
    },

    closeIntroVideo: function () {
        const vid = document.getElementById("vid");
        if (vid) {
            fadeOut(vid, 500, function () {
                vid.pause();
                vid.currentTime = 0;
            });
        }

        if (closeIntroCallback) {
            closeIntroCallback();
        }
    },

    loadOutroVideo: function () {
        // we can re-use the same video element used for the intro
        // because we only show the intro video once per session.

        // get the size and supported format extension
        const vid = ensureVideoElement(),
            size = resolution.VIDEO_WIDTH,
            extension = platform.getVideoExtension(),
            baseUrl = platform.videoBaseUrl;

        // start loading the video
        if (vid != null && extension != null) {
            try {
                vid.src = baseUrl + "outro_" + size + extension;
                vid.load();
            } catch (ex) {
                // loading the video sometimes causes an exception on win8
            }
        }
    },

    playOutroVideo: function () {
        const vid = document.getElementById("vid");
        if (vid) {
            // make sure we can play the video
            const readyState = vid["readyState"];
            if (
                readyState === 2 || // HAVE_CURRENT_DATA (loadeddata)
                readyState === 3 || // HAVE_FUTURE_DATA  (canplay)
                readyState === 4
            ) {
                // HAVE_ENOUGH_DATA  (canplaythrough)

                SoundMgr.pauseMusic();
                if (!SoundMgr.musicEnabled) {
                    vid.volume = 0;
                }
                fadeIn(vid, 300, function () {
                    vid.play();
                });
                vid.addEventListener("ended", VideoManager.closeOutroVideo);
                vid.addEventListener("mousedown", VideoManager.closeOutroVideo);
            } else {
                vid.remove();
                PanelManager.showPanel(PanelId.GAMECOMPLETE, false);
            }
        }
    },

    closeOutroVideo: function () {
        PanelManager.showPanel(PanelId.GAMECOMPLETE, true);
        const vid = document.getElementById("vid");
        if (vid) {
            fadeOut(vid, 500, function () {
                vid.pause();
                vid.currentTime = 0;
                vid.remove();
            });
        }
    },

    domReady: function () {
        this.loadIntroVideo();
    },
};

// reload the intro video when the game progress is cleared
PubSub.subscribe(PubSub.ChannelId.LoadIntroVideo, function () {
    VideoManager.loadIntroVideo();
});

export default VideoManager;
