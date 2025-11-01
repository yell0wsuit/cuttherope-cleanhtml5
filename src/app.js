import PreLoader from "@/resources/PreLoader";
import { IS_XMAS } from "@/resources/ResData";
import resolution from "@/resolution";
import im from "@/ui/InterfaceManager";
import Canvas from "@/utils/Canvas";
import settings from "@/game/CTRSettings";
import ZoomManager from "@/ZoomManager";
import PubSub from "@/utils/PubSub";
import editionUI from "@/editionUI";

class App {
    constructor() {
        /**
         * @type {HTMLElement | null}
         */
        this.progressBar = null;
        /**
         * @type {HTMLElement | null}
         */
        this.betterLoader = null;
        /**
         * @type {HTMLElement | null}
         */
        this.gameFooterSocial = null;

        // Gives the app a chance to begin working before the DOM is ready
        PreLoader.start();
        PubSub.publish(PubSub.ChannelId.AppInit);
    }

    // Called by the loader when the DOM is loaded
    domReady() {
        this.progressBar = document.getElementById("progress");
        this.betterLoader = document.getElementById("betterLoader");
        this.gameFooterSocial = document.getElementById("gameFooterSocial");

        // disable text selection mode in IE9
        if (settings.disableTextSelection) {
            if (typeof document.body["onselectstart"] != "undefined") {
                document.body["onselectstart"] = () => {
                    return false;
                };
            }
        }

        // toggle the active css class when the user clicks
        const ctrCursors = document.querySelectorAll(".ctrCursor");
        ctrCursors.forEach((cursor) => {
            if (cursor instanceof HTMLElement) {
                cursor.addEventListener("mousedown", () => {
                    cursor.classList.toggle("ctrCursorActive");
                });
                cursor.addEventListener("mouseup", () => {
                    cursor.classList.toggle("ctrCursorActive");
                });
            }
        });

        document.body.classList.add(`ui-${resolution.UI_WIDTH}`);
        if (IS_XMAS) {
            document.body.classList.add("is-xmas");
        }

        Canvas.domReady("c");

        if (!Canvas.element) {
            throw new Error("Canvas element not found");
        }

        // set the canvas drawing dimensions
        Canvas.element.width = resolution.CANVAS_WIDTH;
        Canvas.element.height = resolution.CANVAS_HEIGHT;

        // set the screen (css) dimensions
        Canvas.element.style.width = `${resolution.CANVAS_WIDTH}px`;
        Canvas.element.style.height = `${resolution.CANVAS_HEIGHT}px`;

        if (ZoomManager.domReady) {
            ZoomManager.domReady();
        }

        PreLoader.domReady();
        im.gameFlow.domReady();
        PubSub.publish(PubSub.ChannelId.AppDomReady);
    }

    run() {
        // Called by the loader when the app is ready to run

        // Subscribe to preloader progress updates
        const progressSubscription = PubSub.subscribe(
            PubSub.ChannelId.PreloaderProgress,
            (/** @type {{ progress: number; }} */ data) => {
                if (this.progressBar && data && typeof data.progress === "number") {
                    const progress = Math.min(100, Math.max(0, data.progress));
                    this.progressBar.style.transition = "width 0.3s ease-out";
                    this.progressBar.style.width = `${progress}%`;
                }
            }
        );

        PreLoader.run(() => {
            // Unsubscribe from progress updates
            PubSub.unsubscribe(progressSubscription);

            // Ensure progress bar is at 100%
            if (this.progressBar) {
                this.progressBar.style.width = "100%";
            }

            // Hide the loader after a brief delay
            setTimeout(() => {
                if (this.betterLoader) {
                    this.betterLoader.style.transition = "opacity 0.5s";
                    this.betterLoader.style.opacity = "0";
                    setTimeout(() => {
                        this.betterLoader && (this.betterLoader.style.display = "none");
                    }, 500);
                }
            }, 200);

            im.gameFlow.appReady();
            PubSub.publish(PubSub.ChannelId.AppRun);

            // fade in the game
            const hideAfterLoad = document.querySelectorAll(".hideAfterLoad");
            hideAfterLoad.forEach((el) => {
                if (el instanceof HTMLElement) {
                    el.style.transition = "opacity 0.5s";
                    el.style.opacity = "0";
                    setTimeout(() => {
                        el.style.display = "none";
                    }, 500);
                }
            });

            const hideBeforeLoad = document.querySelectorAll(".hideBeforeLoad");
            hideBeforeLoad.forEach((el) => {
                if (el instanceof HTMLElement) {
                    // Make sure element is visible first
                    el.style.display = el.style.display || "block";
                    el.style.opacity = "0";
                    el.style.transition = "opacity 0.5s";
                    // Trigger reflow before starting fade
                    el.offsetHeight;
                    el.style.opacity = "1";
                }
            });

            // show hide behind the scenes when we first load
            im.gameFlow.updateDevLink();

            // put the social links back into the footer (need to be offscreen instead of hidden during load)

            if (this.gameFooterSocial) {
                this.gameFooterSocial.style.top = "0";
            }
        });
    }
}

export default new App();
