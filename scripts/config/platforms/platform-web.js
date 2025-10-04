define("config/platforms/platform-web", [
    "visual/Text",
    "resolution",
    "resources/Lang",
    "resources/MenuStringId",
    "core/Alignment",
    "edition",
], function (Text, resolution, Lang, MenuStringId, Alignment, edition) {
    // loc entries that are specific to the web platform
    var locEntries = {
        GAME_COMPLETE: {
            en: "I just finished playing Cut the Rope on the web with %d (out of %d possible) stars!",
            fr: "",
            de: "",
            ru: "",
        },
    };

    var WebPlatform = {
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
        resolutionBaseUrl: "images/" + resolution.UI_WIDTH + "/",
        uiImageBaseUrl: "images/" + resolution.UI_WIDTH + "/ui/",
        boxImageBaseUrl: "images/" + resolution.UI_WIDTH + "/" + (edition.boxDirectory || "ui/"),

        audioBaseUrl: "audio/",
        getAudioExtension: function () {
            return ".mp3";
        },

        videoBaseUrl: "video/",
        getVideoExtension: function () {
            return Modernizr.video.h264 ? ".mp4" : Modernizr.video.webm ? ".webm" : null;
        },

        getDrawingBaseUrl: function () {
            var loc = window.location,
                baseUrl = loc.protocol + "//" + loc.host;
            return baseUrl + "/images/" + resolution.UI_WIDTH + "/ui/";
        },
        getScoreImageBaseUrl: function () {
            var loc = window.location,
                baseUrl = loc.protocol + "//" + loc.host;
            return baseUrl + "/images/scores/";
        },
        setSoundButtonChange: function ($button, callback) {
            $button.click(callback);
        },
        setMusicButtonChange: function ($button, callback) {
            $button.click(callback);
        },
        updateSoundOption: function ($el, isSoundOn) {
            $el.toggleClass("disabled", !isSoundOn);
        },
        updateMusicOption: function ($el, isMusicOn) {
            $el.toggleClass("disabled", !isMusicOn);
        },
        toggleLangUI: function (show) {
            $("#langBtn").toggle(show);
        },
        setLangOptionClick: function (callback) {
            $("#langBtn").click(function (e) {
                var langId = null; // just advance to next supported language
                callback(langId);
            });
        },
        updateLangSetting: function () {
            WebPlatform.setOptionText($("#langBtn"), Lang.menuText(MenuStringId.LANGUAGE) + ":");

            // Chrome has a layout bug where the css offset on the flag
            // icon is not changed immediately. Retrieving the offset
            // forces the browser to query location which fixes layout.
            $("#flag").offset();
        },
        setCutOptionClick: function (callback) {
            $("#cutBtn").click(callback);
        },
        updateCutSetting: function (isClickToCut) {
            // fonts use game sized assets based on canvas size
            var textWidth = 400 * resolution.CANVAS_SCALE,
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
            $("#cutBtn").toggleClass("disabled", !isClickToCut);
        },
        setResetText: function ($el, text) {
            WebPlatform.setOptionText($el, text);
        },
        setOptionText: function ($button, text) {
            Text.drawBig({
                text: text,
                img: $button.find("img")[0],
                scaleToUI: true,
            });
        },
        getGameCompleteShareText: function (totalStars, possibleStars) {
            var text = Lang.getText(locEntries.GAME_COMPLETE)
                .replace("%d", totalStars)
                .replace("%d", possibleStars);
            return text;
        },
        meetsRequirements: function () {
            // does the browser have the HTML5 features we need?
            var meetsReqs =
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
                    load: "css!css/nosupport.css?RELEASE_TAG",
                });

                // remove youtube video if it exists
                $(function () {
                    $("#yt-video").remove();
                });

                // track views of the ugprade page
                _gaq.push(["_trackEvent", "Upgrade", "View"]);
            }
            return meetsReqs;
        },
    };

    return WebPlatform;
});
