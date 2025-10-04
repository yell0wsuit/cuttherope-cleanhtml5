define("app", [
    "jquery",
    "resources/PreLoader",
    "resolution",
    "ui/InterfaceManager",
    "utils/Canvas",
    "game/CTRSettings",
    "ZoomManager",
    "utils/PubSub",
    "editionUI",
], function ($, preloader, resolution, im, Canvas, settings, ZoomManager, PubSub, editionUI) {
    var App = {
        // Gives the app a chance to begin working before the DOM is ready
        init: function () {
            preloader.init();
            im.init();
            PubSub.publish(PubSub.ChannelId.AppInit);
        },

        // Called by the loader when the DOM is loaded
        domReady: function () {
            // disable text selection mode in IE9
            if (settings.disableTextSelection) {
                if (typeof document.body["onselectstart"] != "undefined") {
                    document.body["onselectstart"] = function () {
                        return false;
                    };
                }
            }

            // toggle the active css class when the user clicks
            $(".ctrCursor").on("mousedown mouseup", function () {
                $(this).toggleClass("ctrCursorActive");
            });

            $("body").addClass("ui-" + resolution.UI_WIDTH);

            Canvas.domReady("c");

            // set the canvas drawing dimensions
            Canvas.element.width = resolution.CANVAS_WIDTH;
            Canvas.element.height = resolution.CANVAS_HEIGHT;

            // set the screen (css) dimensions
            $(Canvas.element).width(resolution.CANVAS_WIDTH).height(resolution.CANVAS_HEIGHT);

            if (ZoomManager.domReady) {
                ZoomManager.domReady();
            }

            preloader.domReady();
            im.domReady();
            PubSub.publish(PubSub.ChannelId.AppDomReady);
        },

        run: function () {
            // Called by the loader when the app is ready to run
            preloader.run(function () {
                im.appReady();
                PubSub.publish(PubSub.ChannelId.AppRun);

                // fade in the game
                $(".hideAfterLoad").fadeOut(500);
                $(".hideBeforeLoad").fadeIn(500);

                var start = 10;
                var inc;
                var interval = setInterval(function () {
                    inc = (Math.random() * 15) | 0;
                    start += inc;

                    if (start > 100) {
                        start = 100;
                        $("#betterLoader").fadeOut(500);
                        clearInterval(interval);
                    }
                    $("#progress").animate({ width: start + "%" }, 50);
                }, 100);

                // show hide behind the scenes when we first load
                im.updateDevLink();

                // put the social links back into the footer (need to be offscreen instead of hidden during load)
                $("#gameFooterSocial").css("top", 0);
            });
        },
    };

    return App;
});
