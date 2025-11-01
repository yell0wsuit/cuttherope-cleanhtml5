import resolution from "@/resolution";
import edition from "@/config/editions/net-edition";
import platform from "@/config/platforms/platform-web";
import BoxManager from "@/ui/BoxManager";
import Easing from "@/ui/Easing";

/**
 * Helper function to check if an image is ready
 * @param {HTMLImageElement} img - The image element to check
 * @returns {boolean} Whether the image is loaded and ready
 */
const isImageReady = (img) => img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;

/**
 * Manages the box door animations and rendering
 */
class BoxDoors {
    /** @type {HTMLImageElement[]} */
    static #doorImages = [];
    /** @type {HTMLImageElement} */
    static #tapeImgL = new Image();
    /** @type {HTMLImageElement} */
    static #tapeImgR = new Image();

    /** @type {HTMLCanvasElement | null} */
    static canvasLeft = null;
    /** @type {HTMLCanvasElement | null} */
    static canvasRight = null;
    /** @type {number | null} */
    static currentIndex = null;
    /** @type {boolean} */
    static showTape = true;

    /**
     * Initialize the door canvases
     */
    static initializeDoors() {
        BoxDoors.canvasLeft = /** @type {HTMLCanvasElement} */ (
            document.getElementById("levelCanvasLeft")
        );
        BoxDoors.canvasRight = /** @type {HTMLCanvasElement} */ (
            document.getElementById("levelCanvasRight")
        );

        BoxDoors.canvasLeft.width = (resolution.uiScaledNumber(1024) / 2) | 0;
        BoxDoors.canvasRight.width = (resolution.uiScaledNumber(1024) / 2) | 0;

        BoxDoors.canvasLeft.height = resolution.uiScaledNumber(576);
        BoxDoors.canvasRight.height = resolution.uiScaledNumber(576);

        BoxDoors.currentIndex = BoxManager.currentBoxIndex;
        BoxDoors.showTape = true;
    }

    /**
     * Called when the app is ready to cache door and tape images
     */
    static appReady() {
        // cache the door and tape images (which have already been preloaded)
        for (let i = 0, len = edition.boxDoors.length; i < len; i++) {
            const doorImg = new Image();
            doorImg.src = platform.uiImageBaseUrl + edition.boxDoors[i];
            BoxDoors.#doorImages[i] = doorImg;
        }

        BoxDoors.#tapeImgL.src = `${platform.uiImageBaseUrl}leveltape_left.png`;
        BoxDoors.#tapeImgR.src = `${platform.uiImageBaseUrl}leveltape_right.png`;

        BoxDoors.preRenderDoors();
    }

    /**
     * Pre-renders the door images onto canvases
     */
    static preRenderDoors() {
        const doorImg = BoxDoors.#doorImages[BoxManager.currentBoxIndex];
        const leftCtx = BoxDoors.canvasLeft?.getContext("2d");
        const rightCtx = BoxDoors.canvasRight?.getContext("2d");

        if (!leftCtx || !rightCtx || !BoxDoors.canvasLeft || !BoxDoors.canvasRight) {
            return;
        }

        if (!doorImg) {
            leftCtx.clearRect(0, 0, BoxDoors.canvasLeft.width, BoxDoors.canvasLeft.height);
            rightCtx.clearRect(0, 0, BoxDoors.canvasRight.width, BoxDoors.canvasRight.height);
            return;
        }

        const imagesToWaitFor = [doorImg];

        if (BoxDoors.showTape) {
            imagesToWaitFor.push(BoxDoors.#tapeImgL, BoxDoors.#tapeImgR);
        }

        const pendingImages = imagesToWaitFor.filter((img) => !isImageReady(img));

        if (pendingImages.length > 0) {
            pendingImages.forEach((img) => {
                if (!img) {
                    return;
                }
                img.addEventListener("load", BoxDoors.preRenderDoors, { once: true });
            });
            return;
        }

        leftCtx.clearRect(0, 0, BoxDoors.canvasLeft.width, BoxDoors.canvasLeft.height);
        rightCtx.clearRect(0, 0, BoxDoors.canvasRight.width, BoxDoors.canvasRight.height);

        leftCtx.drawImage(doorImg, 0, 0);

        rightCtx.save();
        rightCtx.translate(doorImg.width, doorImg.height);
        rightCtx.rotate(Math.PI);
        rightCtx.drawImage(doorImg, 0, 0);
        rightCtx.restore();

        if (BoxDoors.showTape) {
            //draw the left side tape
            leftCtx.drawImage(
                BoxDoors.#tapeImgL,
                BoxDoors.canvasLeft.width - resolution.uiScaledNumber(26),
                resolution.uiScaledNumber(10)
            );

            rightCtx.drawImage(BoxDoors.#tapeImgR, 0, resolution.uiScaledNumber(10));
        }
    }

    /**
     * Renders the doors at a specific open percentage
     * @param {boolean} [showTape] - Whether to show tape on the doors
     * @param {number} [percentOpen] - How far open the doors are (0-1)
     */
    static renderDoors(showTape, percentOpen) {
        //do another prerender
        if (
            BoxDoors.currentIndex !== BoxManager.currentBoxIndex ||
            BoxDoors.showTape !== showTape
        ) {
            BoxDoors.currentIndex = BoxManager.currentBoxIndex;
            BoxDoors.showTape = showTape ?? true;
            BoxDoors.preRenderDoors();
        }

        //calculations
        const p = percentOpen || 0.0;
        const dw = BoxDoors.canvasLeft?.width ?? 0; //door width
        const offset = dw - dw * (1 - p); //512 - (512 * (1 - 0.1))

        if (!BoxDoors.canvasLeft || !BoxDoors.canvasRight) {
            return;
        }

        //use css3 transformations
        BoxDoors.canvasLeft.style.transform = `translateX(${-1 * offset}px)`;
        BoxDoors.canvasRight.style.transform = `translateX(${dw + offset}px)`;
    }

    /**
     * Animates opening the doors
     * @param {boolean} showTape - Whether to show tape on the doors
     * @param {(() => void) | null | undefined} callback - Function to call when animation completes
     * @param {boolean} [runInReverse] - Whether to run the animation in reverse
     */
    static openDoors(showTape, callback, runInReverse) {
        const r = runInReverse != null ? runInReverse : false;

        const begin = Date.now();
        const dur = 750;
        const easing = runInReverse ? Easing.easeOutCubic : Easing.easeInOutCubic;
        const levelPanel = document.getElementById("levelPanel");

        const openBoxDoors = () => {
            const now = Date.now();
            const p = now - begin;
            const v = easing(p, 0, 1, dur);

            if (v < 1) {
                BoxDoors.renderDoors(showTape, r ? 1 - v : v);
                window.requestAnimationFrame(openBoxDoors);
            } else {
                BoxDoors.renderDoors(showTape, r ? 0 : 1);

                if (levelPanel) {
                    if (r) {
                        levelPanel.style.display = "block";
                    } else {
                        levelPanel.style.display = "none";
                    }
                }

                if (callback != null) callback();
            }
        };

        window.requestAnimationFrame(openBoxDoors);
    }

    /**
     * Animates closing the doors
     * @param {boolean} showTape - Whether to show tape on the doors
     * @param {(() => void) | null | undefined} callback - Function to call when animation completes
     */
    static closeDoors(showTape, callback) {
        BoxDoors.openDoors(showTape, callback, true);
    }

    /**
     * Animates closing the box with tape animation
     * @param {(() => void) | null | undefined} callback - Function to call when animation completes
     */
    static closeBoxAnimation(callback) {
        // animating to level select
        // box already closed, just needs to be taped and then redirected
        const tapeRoll = document.getElementById("tapeRoll");
        const tapeSlice = document.getElementById("levelTape");
        const levelResults = document.getElementById("levelResults");

        if (!tapeRoll || !tapeSlice || !levelResults) {
            return;
        }

        // Fade out level results
        fadeOut(levelResults, 400, () => {
            tapeRoll.style.top = `${resolution.uiScaledNumber(0)}px`;

            // Delay and fade in
            setTimeout(() => {
                fadeIn(tapeRoll, 200, () => {
                    const offset = resolution.uiScaledNumber(650);
                    const offsetH = resolution.uiScaledNumber(553);
                    const b = Date.now();
                    const from = parseInt(tapeRoll.style.top, 10);
                    const fromH = resolution.uiScaledNumber(63);
                    const d = 1000;

                    tapeSlice.style.height = `${fromH}px`;
                    tapeSlice.style.display = "block";

                    const rollTape = () => {
                        const now = Date.now();
                        const diff = now - b;
                        const v = Easing.easeInOutCubic(diff, from, offset - from, d);
                        const vH = Easing.easeInOutCubic(diff, fromH, offset - fromH, d);

                        tapeRoll.style.top = `${v}px`;
                        tapeSlice.style.height = `${vH}px`;

                        if (diff < d) {
                            window.requestAnimationFrame(rollTape);
                        } else {
                            // hide the tape slice and re-render the doors with tape
                            tapeSlice.style.display = "none";
                            BoxDoors.renderDoors(true);

                            //fade out tape and switch panels
                            fadeOut(tapeRoll, 400, () => {
                                // Reset levelResults opacity for next time
                                if (levelResults) {
                                    levelResults.style.opacity = "1";
                                }
                                if (callback) {
                                    setTimeout(callback, 200);
                                }
                            });
                        }
                    };

                    window.requestAnimationFrame(rollTape);
                });
            }, 400);
        });
    }

    /**
     * Animates opening the box with box cutter animation
     * @param {(() => void) | null | undefined} callback - Function to call when animation completes
     */
    static openBoxAnimation(callback) {
        // make sure the doors are rendered closed initially
        BoxDoors.renderDoors(true, 0);

        // make sure the gradient (time edition) is removed
        BoxDoors.hideGradient();

        //cut box open with boxCutter
        const boxCutter = document.getElementById("boxCutter");

        if (!boxCutter) {
            return;
        }

        boxCutter.style.top = `${resolution.uiScaledNumber(371)}px`;

        setTimeout(() => {
            fadeIn(boxCutter, 200, () => {
                const offset = resolution.uiScaledNumber(-255);
                const b = Date.now();
                const from = parseInt(boxCutter.style.top, 10);
                const d = 1000;

                const cutBox = () => {
                    const now = Date.now();
                    const diff = now - b;
                    const v = Easing.easeInOutCubic(diff, from, offset - from, d);

                    boxCutter.style.top = `${v}px`;

                    if (diff < d) {
                        window.requestAnimationFrame(cutBox);
                    } else {
                        //fade out cutter and open doors
                        fadeOut(boxCutter, 300, callback);
                    }
                };

                window.requestAnimationFrame(cutBox);
            });
        }, 200);
    }

    /**
     * Show gradient effect (time edition)
     */
    static showGradient() {}

    /**
     * Hide gradient effect (time edition)
     */
    static hideGradient() {}
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => BoxDoors.initializeDoors());
} else {
    BoxDoors.initializeDoors();
}

// Helper functions for animations
/**
 * Fade out an element
 * @param {HTMLElement} element - The element to fade out
 * @param {number} duration - Duration in milliseconds
 * @param {(() => void) | null | undefined} [callback] - Optional callback when complete
 */
const fadeOut = (element, duration, callback) => {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = "0";

    setTimeout(() => {
        element.style.display = "none";
        element.style.transition = "";
        if (callback) callback();
    }, duration);
};

/**
 * Fade in an element
 * @param {HTMLElement} element - The element to fade in
 * @param {number} duration - Duration in milliseconds
 * @param {(() => void) | null | undefined} [callback] - Optional callback when complete
 */
const fadeIn = (element, duration, callback) => {
    element.style.opacity = "0";
    element.style.display = "block";
    element.style.transition = `opacity ${duration}ms`;

    // Force reflow
    element.offsetHeight;

    element.style.opacity = "1";

    setTimeout(() => {
        element.style.transition = "";
        if (callback) callback();
    }, duration);
};

export default BoxDoors;
