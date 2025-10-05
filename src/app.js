import preloader from "@/resources/PreLoader";
import resolution from "@/resolution";
import im from "@/ui/InterfaceManager";
import Canvas from "@/utils/Canvas";
import settings from "@/game/CTRSettings";
import ZoomManager from "@/ZoomManager";
import PubSub from "@/utils/PubSub";
import editionUI from "@/editionUI";
const App = {
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
        const ctrCursors = document.querySelectorAll(".ctrCursor");
        ctrCursors.forEach(function (cursor) {
            cursor.addEventListener("mousedown", function () {
                this.classList.toggle("ctrCursorActive");
            });
            cursor.addEventListener("mouseup", function () {
                this.classList.toggle("ctrCursorActive");
            });
        });

        document.body.classList.add("ui-" + resolution.UI_WIDTH);

        Canvas.domReady("c");

        // set the canvas drawing dimensions
        Canvas.element.width = resolution.CANVAS_WIDTH;
        Canvas.element.height = resolution.CANVAS_HEIGHT;

        // set the screen (css) dimensions
        Canvas.element.style.width = resolution.CANVAS_WIDTH + "px";
        Canvas.element.style.height = resolution.CANVAS_HEIGHT + "px";

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
            const hideAfterLoad = document.querySelectorAll(".hideAfterLoad");
            hideAfterLoad.forEach(function (el) {
                el.style.transition = "opacity 0.5s";
                el.style.opacity = "0";
                setTimeout(function () {
                    el.style.display = "none";
                }, 500);
            });

            const hideBeforeLoad = document.querySelectorAll(".hideBeforeLoad");
            hideBeforeLoad.forEach(function (el) {
                // Make sure element is visible first
                el.style.display = el.style.display || "block";
                el.style.opacity = "0";
                el.style.transition = "opacity 0.5s";
                // Trigger reflow before starting fade
                el.offsetHeight;
                el.style.opacity = "1";
            });

            let start = 10;
            let inc;
            const progressBar = document.getElementById("progress");
            const betterLoader = document.getElementById("betterLoader");

            const interval = setInterval(function () {
                inc = (Math.random() * 15) | 0;
                start += inc;

                if (start > 100) {
                    start = 100;
                    betterLoader.style.transition = "opacity 0.5s";
                    betterLoader.style.opacity = "0";
                    setTimeout(function () {
                        betterLoader.style.display = "none";
                    }, 500);
                    clearInterval(interval);
                }

                progressBar.style.transition = "width 0.05s";
                progressBar.style.width = start + "%";
            }, 100);

            // show hide behind the scenes when we first load
            im.updateDevLink();

            // put the social links back into the footer (need to be offscreen instead of hidden during load)
            const gameFooterSocial = document.getElementById("gameFooterSocial");
            if (gameFooterSocial) {
                gameFooterSocial.style.top = "0";
            }
        });
    },
};

export default App;
