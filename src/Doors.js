import resolution from "@/resolution";
import edition from "@/edition";
import platform from "@/platform";
import BoxManager from "@/ui/BoxManager";
import Easing from "@/ui/Easing";
import PubSub from "@/utils/PubSub";
import Canvas from "@/utils/Canvas";
const doorImages = [];
const tapeImgL = new Image();
const tapeImgR = new Image();

const BoxDoors = {};

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDoors);
} else {
    initializeDoors();
}

function initializeDoors() {
    BoxDoors.canvasLeft = document.getElementById("levelCanvasLeft");
    BoxDoors.canvasRight = document.getElementById("levelCanvasRight");

    BoxDoors.canvasLeft.width = (resolution.uiScaledNumber(1024) / 2) | 0;
    BoxDoors.canvasRight.width = (resolution.uiScaledNumber(1024) / 2) | 0;

    BoxDoors.canvasLeft.height = resolution.uiScaledNumber(576);
    BoxDoors.canvasRight.height = resolution.uiScaledNumber(576);

    BoxDoors.currentIndex = BoxManager.currentBoxIndex;
    BoxDoors.showTape = true;
}

BoxDoors.appReady = function () {
    // cache the door and tape images (which have already been preloaded)
    for (let i = 0, len = edition.boxDoors.length; i < len; i++) {
        const doorImg = new Image();
        doorImg.src = platform.uiImageBaseUrl + edition.boxDoors[i];
        doorImages[i] = doorImg;
    }

    tapeImgL.src = platform.uiImageBaseUrl + "leveltape_left.png";
    tapeImgR.src = platform.uiImageBaseUrl + "leveltape_right.png";

    BoxDoors.preRenderDoors();
};

BoxDoors.preRenderDoors = function () {
    const doorImg = doorImages[BoxManager.currentBoxIndex];
    const leftCtx = BoxDoors.canvasLeft.getContext("2d");
    const rightCtx = BoxDoors.canvasRight.getContext("2d");

    leftCtx.drawImage(doorImg, 0, 0);

    rightCtx.save();
    rightCtx.translate(doorImg.width, doorImg.height);
    rightCtx.rotate(Math.PI);
    rightCtx.drawImage(doorImg, 0, 0);
    rightCtx.restore();

    if (BoxDoors.showTape) {
        //draw the left side tape
        leftCtx.drawImage(
            tapeImgL,
            BoxDoors.canvasLeft.width - resolution.uiScaledNumber(26),
            resolution.uiScaledNumber(10)
        );

        rightCtx.drawImage(tapeImgR, 0, resolution.uiScaledNumber(10));
    }
};

BoxDoors.renderDoors = function (showTape, percentOpen) {
    //do another prerender
    if (BoxDoors.currentIndex !== BoxManager.currentBoxIndex || BoxDoors.showTape !== showTape) {
        BoxDoors.currentIndex = BoxManager.currentBoxIndex;
        BoxDoors.showTape = showTape;
        BoxDoors.preRenderDoors(showTape);
    }

    //calculations
    const p = percentOpen || 0.0;
    const dw = BoxDoors.canvasLeft.width; //door width
    const offset = dw - dw * (1 - p); //512 - (512 * (1 - 0.1))

    //use css3 transformations
    BoxDoors.canvasLeft.style.transform = `translateX(${-1 * offset}px)`;
    BoxDoors.canvasRight.style.transform = `translateX(${dw + offset}px)`;
};

BoxDoors.openDoors = function (showTape, callback, runInReverse) {
    const r = runInReverse != null ? runInReverse : false;

    const begin = Date.now();
    const dur = 750;
    // Draw the door animation on the main game canvas
    const ctx = document.getElementById("c").getContext("2d");
    const easing = runInReverse ? Easing.easeOutCubic : Easing.easeInOutCubic;
    const levelPanel = document.getElementById("levelPanel");

    function openBoxDoors() {
        const now = Date.now();
        const p = now - begin;
        const v = easing(p, 0, 1, dur);

        if (v < 1) {
            BoxDoors.renderDoors(showTape, r ? 1 - v : v, ctx);
            window.requestAnimationFrame(openBoxDoors);
        } else {
            BoxDoors.renderDoors(showTape, r ? 0 : 1, ctx);

            if (r) {
                levelPanel.style.display = "block";
            } else {
                levelPanel.style.display = "none";
            }

            if (callback != null) callback();
        }
    }

    window.requestAnimationFrame(openBoxDoors);
};

BoxDoors.closeDoors = function (showTape, callback) {
    BoxDoors.openDoors(showTape, callback, true);
};

BoxDoors.closeBoxAnimation = function (callback) {
    // animating to level select
    // box already closed, just needs to be taped and then redirected
    const tapeRoll = document.getElementById("tapeRoll");
    const tapeSlice = document.getElementById("levelTape");
    const levelResults = document.getElementById("levelResults");

    // Fade out level results
    fadeOut(levelResults, 400, () => {
        tapeRoll.style.top = resolution.uiScaledNumber(0) + "px";

        // Delay and fade in
        setTimeout(() => {
            fadeIn(tapeRoll, 200, () => {
                const offset = resolution.uiScaledNumber(650);
                const offsetH = resolution.uiScaledNumber(553);
                const b = Date.now();
                const from = parseInt(tapeRoll.style.top, 10);
                const fromH = resolution.uiScaledNumber(63);
                const d = 1000;

                tapeSlice.style.height = fromH + "px";
                tapeSlice.style.display = "block";

                function rollTape() {
                    const now = Date.now();
                    const diff = now - b;
                    const v = Easing.easeInOutCubic(diff, from, offset - from, d);
                    const vH = Easing.easeInOutCubic(diff, fromH, offset - fromH, d);

                    tapeRoll.style.top = v + "px";
                    tapeSlice.style.height = vH + "px";

                    if (diff < d) {
                        window.requestAnimationFrame(rollTape);
                    } else {
                        // hide the tape slice and re-render the doors with tape
                        tapeSlice.style.display = "none";
                        BoxDoors.renderDoors(true);

                        //fade out tape and switch panels
                        fadeOut(tapeRoll, 400, () => {
                            // Reset levelResults opacity for next time
                            levelResults.style.opacity = "1";
                            setTimeout(callback, 200);
                        });
                    }
                }

                window.requestAnimationFrame(rollTape);
            });
        }, 400);
    });
};

BoxDoors.openBoxAnimation = function (callback) {
    // make sure the doors are rendered closed initially
    BoxDoors.renderDoors(true, 0);

    // make sure the gradient (time edition) is removed
    BoxDoors.hideGradient();

    //cut box open with boxCutter
    const boxCutter = document.getElementById("boxCutter");
    boxCutter.style.top = resolution.uiScaledNumber(371) + "px";

    setTimeout(() => {
        fadeIn(boxCutter, 200, () => {
            const offset = resolution.uiScaledNumber(-255);
            const b = Date.now();
            const from = parseInt(boxCutter.style.top, 10);
            const d = 1000;

            function cutBox() {
                const now = Date.now();
                const diff = now - b;
                const v = Easing.easeInOutCubic(diff, from, offset - from, d);

                boxCutter.style.top = v + "px";

                if (diff < d) {
                    window.requestAnimationFrame(cutBox);
                } else {
                    //fade out cutter and open doors
                    fadeOut(boxCutter, 300, callback);
                }
            }

            window.requestAnimationFrame(cutBox);
        });
    }, 200);
};

BoxDoors.showGradient = function () {};
BoxDoors.hideGradient = function () {};

// Helper functions for animations
function fadeOut(element, duration, callback) {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = "0";

    setTimeout(() => {
        element.style.display = "none";
        element.style.transition = "";
        if (callback) callback();
    }, duration);
}

function fadeIn(element, duration, callback) {
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
}

export default BoxDoors;
