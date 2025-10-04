define("ui/GameBorder", ["platform", "edition"], function (platform, edition) {
    let $border = null,
        GAME_COMPLETE_CLASS = "gameComplete";

    const GameBorder = {
        domReady: function () {
            $border = $("#gameBorder");
        },
        setBoxBorder: function (boxIndex) {
            const borderFile = edition.boxBorders[boxIndex],
                backgroundUrl = borderFile ? platform.uiImageBaseUrl + borderFile : "";

            $border
                .removeClass(GAME_COMPLETE_CLASS)
                .css("background-image", "url(" + backgroundUrl + ")");
        },
        setGameCompleteBorder: function () {
            $border.css("background-image", "").addClass(GAME_COMPLETE_CLASS);
        },
        hide: function () {
            $border.hide();
        },
        show: function () {
            $border.show();
        },
        fadeIn: function (duration, delay) {
            delay = delay || 0;
            $border.delay(delay).fadeIn(duration);
        },
        fadeOut: function (duration, delay) {
            delay = delay || 0;
            $border.delay(delay).fadeOut(duration);
        },
    };

    return GameBorder;
});
