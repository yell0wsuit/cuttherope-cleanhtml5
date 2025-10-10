import PanelId from "@/ui/PanelId";
import Panel from "@/ui/Panel";
import Easing from "@/ui/Easing";
import PointerCapture from "@/utils/PointerCapture";
import resolution from "@/resolution";
import ZoomManager from "@/ZoomManager";
import platform from "@/platform";
import ScoreManager from "@/ui/ScoreManager";
import PubSub from "@/utils/PubSub";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Lang from "@/resources/Lang";
import Text from "@/visual/Text";
import MenuStringId from "@/resources/MenuStringId";
import Dialogs from "@/ui/Dialogs";
// BoxPanel displays the set of visible boxes (which may not include all boxes)

let boxes = [],
    currentBoxIndex = 0,
    currentOffset = 0,
    cancelSlideFlag = false,
    isBoxCentered = true,
    isAnimationActive = false,
    spacing = resolution.uiScaledNumber(600),
    centeroffset = resolution.uiScaledNumber(312),
    bouncebox = null,
    im = null,
    canvas,
    ctx,
    $navBack,
    $navForward;

const BoxPanel = new Panel(PanelId.BOXES, "boxPanel", "menuBackground", true);

// dom ready events
function initializeDOMElements() {
    canvas = document.getElementById("boxCanvas");
    ctx = canvas.getContext("2d");

    // size the canvas (only do this once)
    canvas.width = resolution.uiScaledNumber(1024);
    canvas.height = resolution.uiScaledNumber(576);

    // handles clicking on the prev box button
    $navBack = document.getElementById("boxNavBack");
    $navBack.addEventListener("click", function () {
        if (currentBoxIndex > 0) {
            slideToBox(currentBoxIndex - 1);
            SoundMgr.playSound(ResourceId.SND_TAP);
        }
    });

    // handles clicking on the next box button
    $navForward = document.getElementById("boxNavForward");
    $navForward.addEventListener("click", function () {
        if (currentBoxIndex < boxes.length - 1) {
            slideToBox(currentBoxIndex + 1);
            SoundMgr.playSound(ResourceId.SND_TAP);
        }
    });

    const boxUpgradePlate = document.getElementById("boxUpgradePlate");
    if (boxUpgradePlate) {
        boxUpgradePlate.addEventListener("click", function () {
            boxClicked(currentBoxIndex);
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDOMElements);
} else {
    initializeDOMElements();
}

PubSub.subscribe(PubSub.ChannelId.UpdateVisibleBoxes, function (visibleBoxes) {
    boxes = visibleBoxes;
    BoxPanel.redraw();
});

BoxPanel.init = function (interfaceManager) {
    im = interfaceManager;
};

BoxPanel.onShow = function () {
    this.activate();
};

BoxPanel.onHide = function () {
    this.deactivate();
};

BoxPanel.slideToNextBox = function () {
    slideToBox(currentBoxIndex + 1);
};

BoxPanel.bounceCurrentBox = function () {
    bounceCurrentBox();
};

// handles clicking on a box
function boxClicked(visibleBoxIndex) {
    if (visibleBoxIndex !== currentBoxIndex) {
        // only open the selected box (otherwise navigate to different box)
        return;
    }

    // we have to translate from visible box index to edition box index
    const box = boxes[visibleBoxIndex],
        editionBoxIndex = box.index;

    // make sure the box is clickable
    if (!box.isClickable()) {
        return;
    }

    SoundMgr.playSound(ResourceId.SND_TAP);

    if (box.purchased === false) {
        PubSub.publish(PubSub.ChannelId.PurchaseBoxesPrompt);
    } else if (ScoreManager.isBoxLocked(editionBoxIndex)) {
        showLockDialog(editionBoxIndex);
    } else {
        im.openLevelMenu(editionBoxIndex);
    }
}

function showLockDialog(boxIndex) {
    // create localized text images
    Text.drawBig({
        text: Lang.menuText(MenuStringId.CANT_UNLOCK_TEXT1),
        imgParentId: "missingLine1",
        scaleToUI: true,
    });
    Text.drawBig({
        text: ScoreManager.requiredStars(boxIndex) - ScoreManager.totalStars(),
        imgParentId: "missingCount",
        scaleToUI: true,
    });
    Text.drawBig({
        text: Lang.menuText(MenuStringId.CANT_UNLOCK_TEXT2),
        imgParentId: "missingLine2",
        scaleToUI: true,
    });
    Text.drawSmall({
        text: Lang.menuText(MenuStringId.CANT_UNLOCK_TEXT3),
        imgParentId: "missingLine3",
        // width: 260,
        scaleToUI: true,
    });

    Text.drawBig({
        text: Lang.menuText(MenuStringId.OK),
        imgParentId: "missingOkBtn",
        scaleToUI: true,
    });

    SoundMgr.playSound(ResourceId.SND_TAP);
    Dialogs.showPopup("missingStars");
}

function bounceCurrentBox() {
    if (bouncebox != null && ctx != null) {
        bouncebox.cancelBounce();
        bouncebox.bounce(ctx);
    }
}

// render the boxes with the given offset
function render(offset) {
    currentOffset = offset;

    // clear the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = centeroffset + offset,
        offsetY = resolution.uiScaledNumber(130);
    ctx.translate(offsetX, offsetY);

    let boxoffset = 0;

    for (let i = 0; i < boxes.length; i++) {
        let omnomoffset = null,
            relboxoffset = offset + boxoffset,
            box = boxes[i];

        if (box.visible) {
            // calculate location of omnom if the box in the middle
            if (
                relboxoffset > resolution.uiScaledNumber(-100) &&
                relboxoffset < resolution.uiScaledNumber(100)
            ) {
                omnomoffset =
                    (centeroffset + offset) * -1 - boxoffset + resolution.uiScaledNumber(452);
            }

            ctx.translate(boxoffset, 0);
            box.draw(ctx, omnomoffset);
            ctx.translate(-boxoffset, 0);

            boxoffset += spacing;
        }
    }

    ctx.translate(-offsetX, -offsetY);
}

let slideInProgress = false,
    from,
    to,
    startTime;

function slideToBox(index) {
    // clamp index
    if (index < 0) index = 0;
    if (index > boxes.length - 1) index = boxes.length - 1;

    // if we don't need to move the boxes, we still render them but only one frame
    const duration = index == currentBoxIndex ? 0 : 550;

    if (bouncebox && bouncebox != boxes[index] && bouncebox.onUnselected) {
        bouncebox.onUnselected();
    }

    // update the current boxindex
    currentBoxIndex = index;

    // publish new box index
    PubSub.publish(PubSub.ChannelId.SelectedBoxChanged, boxes[currentBoxIndex].index); // need to translate to edition box index

    from = currentOffset;
    to = -1.0 * spacing * index;
    startTime = Date.now();

    const renderSlide = function () {
        if (!slideInProgress) {
            return;
        }

        const elapsed = Date.now() - startTime;
        currentOffset = Easing.easeOutExpo(elapsed, from, to - from, duration);
        render(currentOffset);

        // We need to detect whether the box animation has completed for hit testing. If we
        // wait until the animaiton is completely done, though, it feels unresponsive
        const d = Math.abs(currentOffset - to);
        if (d < 5) isBoxCentered = true;

        if (elapsed >= duration) {
            if (bouncebox != boxes[currentBoxIndex]) {
                bouncebox = boxes[currentBoxIndex];
                bouncebox.bounce(ctx);
            }
            if (bouncebox && bouncebox.onSelected) {
                bouncebox.onSelected();
            }
            slideInProgress = false;
        } else {
            window.requestAnimationFrame(renderSlide);
        }
    };

    slideInProgress = true;
    renderSlide();

    // update the back/forward buttons
    const navBackDiv = $navBack.querySelector("div");
    const navForwardDiv = $navForward.querySelector("div");

    if (index <= 0) {
        navBackDiv.classList.add("boxNavDisabled");
    } else {
        navBackDiv.classList.remove("boxNavDisabled");
    }

    if (index >= boxes.length - 1) {
        navForwardDiv.classList.add("boxNavDisabled");
    } else {
        navForwardDiv.classList.remove("boxNavDisabled");
    }
}

// cancels any current animations
function cancelSlideToBox() {
    slideInProgress = false;

    if (bouncebox != null) {
        bouncebox.cancelBounce();
    }
}

function isMouseOverBox(x, y) {
    if (isBoxCentered && bouncebox != null && bouncebox.isClickable()) {
        if (
            x > resolution.uiScaledNumber(340) &&
            x < resolution.uiScaledNumber(680) &&
            y > resolution.uiScaledNumber(140) &&
            y < resolution.uiScaledNumber(460)
        ) {
            return true;
        }
    }
    return false;
}

let ismousedown = false,
    imousedragging = false,
    upoffset = 0,
    downoffset = 0,
    delta = 0,
    downx = null,
    downy = null;

function pointerDown(x, y) {
    if (ismousedown) {
        return;
    }
    //console.log('box canvas down: ' + x + ', ' + y);
    cancelSlideToBox();

    downx = x;
    downy = y;
    downoffset = currentOffset;
    ismousedown = true;
}

function pointerMove(x, y) {
    if (ismousedown) {
        cancelSlideToBox();
        delta = x - downx;
        if (Math.abs(delta) > 5) {
            //$navBack.hide();
            //$navForward.hide();

            isBoxCentered = false;
            render(downoffset + delta);
        }
    } else {
        if (isMouseOverBox(x, y)) {
            canvas.classList.add("ctrPointer");
        } else {
            canvas.classList.remove("ctrPointer");
        }
    }
}

function pointerUp(x, y) {
    //console.log('box canvas up: ' + x + ', ' + y);
    if (ismousedown) {
        cancelSlideToBox();
        delta = x - downx;

        if (Math.abs(delta) > spacing / 2) {
            // if we've passed the rounding threshold then snap to the nearest box (this is for drags)
            upoffset = currentOffset;
            const index = Math.round((-1 * upoffset) / spacing);

            //console.log('box canvas drag to box: ' + index);
            slideToBox(index);
        } else if (Math.abs(delta) > 5) {
            // otherwise, we look for an action more like a flick and go to the next box
            const max = resolution.uiScaledNumber(30),
                min = max * -1,
                targetBoxIndex =
                    delta > max
                        ? currentBoxIndex - 1
                        : delta < min
                          ? currentBoxIndex + 1
                          : currentBoxIndex;

            //console.log('box canvas flick to box: ' + targetBoxIndex);
            slideToBox(targetBoxIndex);
        } else {
            //console.log('box click: ' + currentBoxIndex);
            const currentBox = boxes[currentBoxIndex];
            if (currentBox.isClickable()) {
                if (!currentBox.islocked) {
                    slideToBox(currentBoxIndex);
                }

                if (isMouseOverBox(x, y)) {
                    boxClicked(currentBoxIndex);
                }
            }
        }
    }
    //$navBack.show();
    //$navForward.show();
    ismousedown = false;
}

function pointerOut(x, y) {
    //console.log('box canvas out: ' + x + ', ' + y);
    pointerUp(x, y);
}

BoxPanel.pointerCapture = null;
BoxPanel.activate = function () {
    // ensure capture helper exists to handle mouse+touch movements
    if (!this.pointerCapture) {
        this.pointerCapture = new PointerCapture({
            element: canvas,
            onStart: pointerDown.bind(this),
            onMove: pointerMove.bind(this),
            onEnd: pointerUp.bind(this),
            onOut: pointerOut.bind(this),
            getZoom: function () {
                return ZoomManager.getUIZoom();
            },
        });
    }

    this.pointerCapture.activate();
};

BoxPanel.deactivate = function () {
    if (this.pointerCapture) {
        this.pointerCapture.deactivate();
    }
};

BoxPanel.redraw = function () {
    slideToBox(currentBoxIndex);
};

export default BoxPanel;
