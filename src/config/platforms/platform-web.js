import Text from "@/visual/Text";
import resolution from "@/resolution";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import Alignment from "@/core/Alignment";
import edition from "@/edition";

// loc entries that are specific to the web platform
const locEntries = {
    GAME_COMPLETE: {
        en: "I just finished playing Cut the Rope on the web with %d (out of %d possible) stars!",
        fr: "",
        de: "",
        ru: "",
    },
};

const baseUrl = `${window.location.protocol}//${window.location.host}`;
const langBtn = document.getElementById("langBtn");
const flag = document.getElementById("flag");
const cutBtn = document.getElementById("cutBtn");

const WebPlatform = {
    /**
     * @const
     * @type {boolean}
     */
    ENABLE_ANALYTICS: true,

    /**
     * @const
     * @type {boolean}
     */
    ENABLE_ZOOM: false,

    ZOOM_BOX_CANVAS: false,

    imageBaseUrl: "images/",
    resolutionBaseUrl: `images/${resolution.UI_WIDTH}/`,
    uiImageBaseUrl: `images/${resolution.UI_WIDTH}/ui/`,
    boxImageBaseUrl: `images/${resolution.UI_WIDTH}/${edition.boxDirectory || "ui/"}`,

    audioBaseUrl: "audio/",
    getAudioExtension: () => {
        return ".ogg";
    },

    videoBaseUrl: "video/",
    getVideoExtension: () => {
        return ".mp4";
    },

    getDrawingBaseUrl: () => {
        return `${baseUrl}/images/${resolution.UI_WIDTH}/ui/`;
    },
    getScoreImageBaseUrl: () => {
        return `${baseUrl}/images/scores/`;
    },
    setSoundButtonChange: (button, callback) => {
        button.addEventListener("click", callback);
    },
    setMusicButtonChange: (button, callback) => {
        button.addEventListener("click", callback);
    },
    updateSoundOption: (el, isSoundOn) => {
        el.classList.toggle("disabled", !isSoundOn);
    },
    updateMusicOption: (el, isMusicOn) => {
        el.classList.toggle("disabled", !isMusicOn);
    },
    toggleLangUI: (show) => {
        if (langBtn) {
            langBtn.style.display = show ? "" : "none";
        }
    },
    setLangOptionClick: (callback) => {
        if (langBtn) {
            langBtn.addEventListener("click", () => {
                const langId = null; // just advance to next supported language
                callback(langId);
            });
        }
    },
    updateLangSetting: () => {
        if (langBtn) {
            WebPlatform.setOptionText(langBtn, `${Lang.menuText(MenuStringId.LANGUAGE)}:`);
        }

        // Chrome has a layout bug where the css offset on the flag
        // icon is not changed immediately. Retrieving the offset
        // forces the browser to query location which fixes layout.

        if (flag) {
            flag.offsetTop; // Force layout recalculation
        }
    },
    setCutOptionClick: (callback) => {
        if (cutBtn) {
            cutBtn.addEventListener("click", callback);
        }
    },
    updateCutSetting: (isClickToCut) => {
        // fonts use game sized assets based on canvas size
        const textWidth = 400 * resolution.CANVAS_SCALE,
            // scale need to take UI size into account
            scale = 0.8 * resolution.UI_TEXT_SCALE,
            alignment = Alignment.HCENTER;

        // we update the drag text because language changes just
        // reset the current click state
        Text.drawSmall({
            text: Lang.menuText(MenuStringId.DRAG_TO_CUT),
            width: textWidth,
            imgId: "dragText",
            scale: scale,
            alignment: alignment,
        });

        // now update the click-to-cut text and check mark
        Text.drawSmall({
            text: Lang.menuText(MenuStringId.CLICK_TO_CUT),
            width: textWidth,
            imgId: "cutText",
            scale: scale,
            alignment: alignment,
        });
        if (cutBtn) {
            cutBtn.classList.toggle("disabled", !isClickToCut);
        }
    },
    setResetText: (el, text) => {
        WebPlatform.setOptionText(el, text);
    },
    setOptionText: (button, text) => {
        const img = button.querySelector("img");
        if (img) {
            Text.drawBig({
                text: text,
                img: img,
                scaleToUI: true,
            });
        }
    },
    getGameCompleteShareText: (totalStars, possibleStars) => {
        const text = Lang.getText(locEntries.GAME_COMPLETE)
            .replace("%d", totalStars)
            .replace("%d", possibleStars);
        return text;
    },
    meetsRequirements: () => {
        // does the browser have the HTML5 features we need?
        /*const meetsReqs =
            Modernizr.canvas &&
            Modernizr.audio &&
            Modernizr.video &&
            Modernizr.localstorage &&
            Modernizr.rgba &&
            Modernizr.opacity &&
            Modernizr.fontface &&
            Modernizr.csstransforms &&
            Modernizr.hq;

        if (!meetsReqs) {
            // load the css for the downlevel experience
            Modernizr.load({
                load: "css!css/nosupport.css",
            });

            // remove youtube video if it exists
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", function () {
                    const ytVideo = document.getElementById("yt-video");
                    if (ytVideo) {
                        ytVideo.remove();
                    }
                });
            } else {
                const ytVideo = document.getElementById("yt-video");
                if (ytVideo) {
                    ytVideo.remove();
                }
            }

            // track views of the ugprade page
            _gaq.push(["_trackEvent", "Upgrade", "View"]);
        }*/

        return true;
    },
};

export default WebPlatform;
