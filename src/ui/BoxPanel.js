import PanelId from "@/ui/PanelId";
import Panel from "@/ui/Panel";
import Easing from "@/ui/Easing";
import PointerCapture from "@/utils/PointerCapture";
import resolution from "@/resolution";
import ZoomManager from "@/ZoomManager";
import platform from "@/config/platforms/platform-web";
import ScoreManager from "@/ui/ScoreManager";
import PubSub from "@/utils/PubSub";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Lang from "@/resources/Lang";
import Text from "@/visual/Text";
import MenuStringId from "@/resources/MenuStringId";
import { UIRegistry } from "@/ui/types";
import Alignment from "@/core/Alignment";
import BoxType from "@/ui/BoxType";
import { IS_XMAS } from "@/resources/ResData";

class BoxPanel extends Panel {
    constructor() {
        super(PanelId.BOXES, "boxPanel", "menuBackground", true);

        // Register this panel in the UI registry
        UIRegistry.registerBoxPanel(this);

        // State
        this.boxes = [];
        this.currentBoxIndex = this.getDefaultBoxIndex();
        this.currentOffset = 0;
        this.isBoxCentered = true;
        this.bounceBox = null;
        this.ctx = null;
        this.canvas = null;
        this.$navBack = null;
        this.$navForward = null;
        this.pointerCapture = null;
        this.im = null;

        // Slide animation
        this.slideInProgress = false;
        this.from = 0;
        this.to = 0;
        this.startTime = 0;

        // Constants
        this.spacing = resolution.uiScaledNumber(600);
        this.centerOffset = resolution.uiScaledNumber(312);

        // Pointer
        this.isMouseDown = false;
        this.downX = null;
        this.downY = null;
        this.delta = 0;
        this.downOffset = 0;

        this.initializeDOM();
        PubSub.subscribe(PubSub.ChannelId.UpdateVisibleBoxes, (visibleBoxes) => {
            this.boxes = visibleBoxes;
            this.redraw();
        });
    }

    getDefaultBoxIndex() {
        return IS_XMAS ? 0 : 1;
    }

    initializeDOM() {
        const start = () => {
            this.canvas = document.getElementById("boxCanvas");
            this.ctx = this.canvas?.getContext("2d");

            if (!this.canvas || !this.ctx) return;

            this.canvas.width = resolution.uiScaledNumber(1024);
            this.canvas.height = resolution.uiScaledNumber(576);

            this.$navBack = document.getElementById("boxNavBack");
            this.$navForward = document.getElementById("boxNavForward");

            this.$navBack?.addEventListener("click", () => {
                if (this.currentBoxIndex > 0) {
                    this.slideToBox(this.currentBoxIndex - 1);
                    SoundMgr.playSound(ResourceId.SND_TAP);
                }
            });

            this.$navForward?.addEventListener("click", () => {
                if (this.currentBoxIndex < this.boxes.length - 1) {
                    this.slideToBox(this.currentBoxIndex + 1);
                    SoundMgr.playSound(ResourceId.SND_TAP);
                }
            });

            const plate = document.getElementById("boxUpgradePlate");
            plate?.addEventListener("click", () => {
                this.boxClicked(this.currentBoxIndex);
            });
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
        } else {
            start();
        }
    }

    init(interfaceManager) {
        this.im = interfaceManager;
    }

    onShow() {
        this.activate();
    }

    onHide() {
        this.deactivate();
    }

    slideToNextBox() {
        this.slideToBox(this.currentBoxIndex + 1);
    }

    bounceCurrentBox() {
        this.doBounceCurrentBox();
    }

    boxClicked(visibleBoxIndex) {
        if (visibleBoxIndex !== this.currentBoxIndex) return;

        const box = this.boxes[visibleBoxIndex];
        const editionBoxIndex = box.index;

        if (!box.isClickable()) return;

        SoundMgr.playSound(ResourceId.SND_TAP);

        /*if (box.purchased === false) {
            PubSub.publish(PubSub.ChannelId.PurchaseBoxesPrompt);
        } else*/
        if (ScoreManager.isBoxLocked(editionBoxIndex)) {
            const isHolidayBox = box.type === BoxType.HOLIDAY;
            if (isHolidayBox && !IS_XMAS) {
                this.showHolidayUnavailableDialog();
            } else {
                this.showLockDialog(editionBoxIndex);
            }
        } else {
            this.im?.gameFlow.openLevelMenu(editionBoxIndex);
        }
    }

    showLockDialog(boxIndex) {
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
            scaleToUI: true,
        });
        Text.drawBig({
            text: Lang.menuText(MenuStringId.OK),
            imgParentId: "missingOkBtn",
            scaleToUI: true,
        });
        SoundMgr.playSound(ResourceId.SND_TAP);
        UIRegistry.getDialogs()?.showPopup("missingStars");
    }

    showHolidayUnavailableDialog() {
        const titleImg = Text.drawBig({
            text: Lang.menuText(MenuStringId.HOLIDAY_LEVELS_UNAVAILABLE_TITLE),
            imgParentId: "holidayLine1",
            alignment: Alignment.CENTER,
            scaleToUI: true,
        });
        if (titleImg) {
            Object.assign(titleImg.style, {
                display: "block",
                margin: "0 auto",
            });
        }

        const bodyImg = Text.drawSmall({
            text: Lang.menuText(MenuStringId.HOLIDAY_LEVELS_UNAVAILABLE_TEXT),
            imgParentId: "holidayLine2",
            alignment: Alignment.CENTER,
            width: resolution.uiScaledNumber(420),
            scaleToUI: true,
        });
        if (bodyImg) {
            Object.assign(bodyImg.style, {
                display: "block",
                margin: `${resolution.uiScaledNumber(16)}px auto 0`,
            });
        }

        Text.drawBig({
            text: Lang.menuText(MenuStringId.OK),
            imgParentId: "holidayOkBtn",
            scaleToUI: true,
        });

        const okBtn = document.getElementById("holidayOkBtn");
        if (okBtn) {
            Object.assign(okBtn.style, {
                display: "block",
                margin: `${resolution.uiScaledNumber(24)}px auto 0`,
                textAlign: "center",
            });
            const img = okBtn.querySelector("img");
            if (img) {
                Object.assign(img.style, {
                    display: "block",
                    margin: "0 auto",
                });
            }
        }

        SoundMgr.playSound(ResourceId.SND_TAP);
        UIRegistry.getDialogs()?.showPopup("holidayUnavailable");
    }

    doBounceCurrentBox() {
        if (this.bounceBox && this.ctx) {
            this.bounceBox.cancelBounce();
            this.bounceBox.bounce(this.ctx);
        }
    }

    render(offset) {
        if (!this.ctx || !this.canvas) return;
        this.currentOffset = offset;

        const { ctx, canvas, boxes, spacing, centerOffset } = this;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const offsetX = centerOffset + offset;
        const offsetY = resolution.uiScaledNumber(130);
        ctx.translate(offsetX, offsetY);

        let boxOffset = 0;

        for (const box of boxes) {
            let omnomOffset = null;
            const relBoxOffset = offset + boxOffset;

            if (box.visible) {
                if (
                    relBoxOffset > resolution.uiScaledNumber(-100) &&
                    relBoxOffset < resolution.uiScaledNumber(100)
                ) {
                    omnomOffset =
                        (centerOffset + offset) * -1 - boxOffset + resolution.uiScaledNumber(452);
                }

                ctx.translate(boxOffset, 0);
                box.draw(ctx, omnomOffset);
                ctx.translate(-boxOffset, 0);

                boxOffset += spacing;
            }
        }

        ctx.translate(-offsetX, -offsetY);
    }

    slideToBox(index) {
        if (!this.ctx) return;

        index = Math.max(0, Math.min(index, this.boxes.length - 1));
        const duration = index === this.currentBoxIndex ? 0 : 550;

        if (this.bounceBox && this.bounceBox !== this.boxes[index] && this.bounceBox.onUnselected) {
            this.bounceBox.onUnselected();
        }

        this.currentBoxIndex = index;
        PubSub.publish(PubSub.ChannelId.SelectedBoxChanged, this.boxes[index].index);

        this.from = this.currentOffset;
        this.to = -1.0 * this.spacing * index;
        this.startTime = Date.now();
        this.slideInProgress = true;

        const renderSlide = () => {
            if (!this.slideInProgress) return;
            const elapsed = Date.now() - this.startTime;
            this.currentOffset = Easing.easeOutExpo(
                elapsed,
                this.from,
                this.to - this.from,
                duration
            );
            this.render(this.currentOffset);

            const d = Math.abs(this.currentOffset - this.to);
            if (d < 5) this.isBoxCentered = true;

            if (elapsed >= duration) {
                if (this.bounceBox !== this.boxes[this.currentBoxIndex]) {
                    this.bounceBox = this.boxes[this.currentBoxIndex];
                    this.bounceBox.bounce(this.ctx);
                }
                if (this.bounceBox?.onSelected) {
                    this.bounceBox.onSelected();
                }
                this.slideInProgress = false;
            } else {
                window.requestAnimationFrame(renderSlide);
            }
        };

        renderSlide();
        this.updateNavButtons();
    }

    updateNavButtons() {
        if (!this.$navBack || !this.$navForward) return;

        const backDiv = this.$navBack.querySelector("div");
        const forwardDiv = this.$navForward.querySelector("div");

        if (this.currentBoxIndex <= 0) {
            backDiv.classList.add("boxNavDisabled");
        } else {
            backDiv.classList.remove("boxNavDisabled");
        }

        if (this.currentBoxIndex >= this.boxes.length - 1) {
            forwardDiv.classList.add("boxNavDisabled");
        } else {
            forwardDiv.classList.remove("boxNavDisabled");
        }
    }

    cancelSlideToBox() {
        this.slideInProgress = false;
        this.bounceBox?.cancelBounce();
    }

    isMouseOverBox(x, y) {
        if (
            this.isBoxCentered &&
            this.bounceBox &&
            this.bounceBox.isClickable() &&
            x > resolution.uiScaledNumber(340) &&
            x < resolution.uiScaledNumber(680) &&
            y > resolution.uiScaledNumber(140) &&
            y < resolution.uiScaledNumber(460)
        ) {
            return true;
        }
        return false;
    }

    pointerDown(x, y) {
        if (this.isMouseDown) return;
        this.cancelSlideToBox();
        this.downX = x;
        this.downY = y;
        this.downOffset = this.currentOffset;
        this.isMouseDown = true;
    }

    pointerMove(x, y) {
        if (!this.canvas) return;
        if (this.isMouseDown) {
            this.cancelSlideToBox();
            this.delta = x - this.downX;
            if (Math.abs(this.delta) > 5) {
                this.isBoxCentered = false;
                this.render(this.downOffset + this.delta);
            }
        } else {
            if (this.isMouseOverBox(x, y)) {
                this.canvas.classList.add("ctrPointer");
            } else {
                this.canvas.classList.remove("ctrPointer");
            }
        }
    }

    pointerUp(x, y) {
        if (!this.isMouseDown) return;

        this.cancelSlideToBox();
        this.delta = x - this.downX;

        if (Math.abs(this.delta) > this.spacing / 2) {
            const upOffset = this.currentOffset;
            const index = Math.round((-1 * upOffset) / this.spacing);
            this.slideToBox(index);
        } else if (Math.abs(this.delta) > 5) {
            const max = resolution.uiScaledNumber(30);
            const targetIndex =
                this.delta > max
                    ? this.currentBoxIndex - 1
                    : this.delta < -max
                      ? this.currentBoxIndex + 1
                      : this.currentBoxIndex;
            this.slideToBox(targetIndex);
        } else if (this.isMouseOverBox(x, y)) {
            this.boxClicked(this.currentBoxIndex);
        }

        this.isMouseDown = false;
    }

    pointerOut(x, y) {
        this.pointerUp(x, y);
    }

    activate() {
        if (!this.pointerCapture) {
            this.pointerCapture = new PointerCapture({
                element: this.canvas,
                onStart: this.pointerDown.bind(this),
                onMove: this.pointerMove.bind(this),
                onEnd: this.pointerUp.bind(this),
                onOut: this.pointerOut.bind(this),
                getZoom: () => ZoomManager.getUIZoom(),
            });
        }
        this.pointerCapture.activate();
    }

    deactivate() {
        this.pointerCapture?.deactivate();
    }

    redraw() {
        this.slideToBox(this.currentBoxIndex);
    }
}

export default new BoxPanel();
