import RootController from "@/game/CTRRootController";
import PanelId from "@/ui/PanelId";
import Panel from "@/ui/Panel";
import resolution from "@/resolution";
import platform from "@/platform";
import ScoreManager from "@/ui/ScoreManager";
import BoxManager from "@/ui/BoxManager";
import PubSub from "@/utils/PubSub";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Lang from "@/resources/Lang";
import Text from "@/visual/Text";
import MenuStringId from "@/resources/MenuStringId";
import edition from "@/edition";
import Alignment from "@/core/Alignment";

const ACTIVE_ANIMATIONS = new WeakMap();
const FADE_DURATION_MS = 200;

function cancelAnimation(element, finalOpacity) {
    const current = ACTIVE_ANIMATIONS.get(element);
    if (current) {
        cancelAnimationFrame(current.frameId);
        ACTIVE_ANIMATIONS.delete(element);
    }
    if (typeof finalOpacity === "number") {
        element.style.opacity = finalOpacity.toString();
    }
}

function fadeElement(element, { from, to, duration, display }) {
    cancelAnimation(element);

    if (display !== undefined) {
        element.style.display = display;
    }

    const startOpacity = typeof from === "number" ? from : parseFloat(getComputedStyle(element).opacity || "0") || 0;
    const targetOpacity = to;
    element.style.opacity = startOpacity.toString();

    const startTimeRef = { value: null };

    return new Promise((resolve) => {
        function step(timestamp) {
            if (startTimeRef.value === null) {
                startTimeRef.value = timestamp;
            }

            const progress = Math.min((timestamp - startTimeRef.value) / duration, 1);
            const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
            element.style.opacity = currentOpacity.toString();

            if (progress < 1) {
                const frameId = requestAnimationFrame(step);
                ACTIVE_ANIMATIONS.set(element, { frameId });
            } else {
                ACTIVE_ANIMATIONS.delete(element);
                resolve();
            }
        }

        const frameId = requestAnimationFrame(step);
        ACTIVE_ANIMATIONS.set(element, { frameId });
    });
}

// show a popup
const Dialogs = {
    showPopup: function (contentDivId) {
        RootController.pauseLevel();
        document.querySelectorAll(".popupOuterFrame").forEach((el) => {
            cancelAnimation(el, 0);
            el.style.display = "none";
        });
        document.querySelectorAll(".popupInnerFrame").forEach((el) => (el.style.display = "none"));

        const popupWindow = document.getElementById("popupWindow");
        if (!popupWindow) {
            return;
        }

        cancelAnimation(popupWindow);

        popupWindow.style.display = "block";

        fadeElement(popupWindow, { from: 0, to: 1, duration: FADE_DURATION_MS }).then(() => {
            const content = document.getElementById(contentDivId);
            if (!content) return;
            content.style.display = "block";

            document.querySelectorAll(".popupOuterFrame").forEach((el) => {
                cancelAnimation(el);
                el.style.display = "block";
                fadeElement(el, { from: 0, to: 1, duration: FADE_DURATION_MS });
            });
        });
    },

    closePopup: function () {
        SoundMgr.playSound(ResourceId.SND_TAP);
        const popupWindow = document.getElementById("popupWindow");
        if (!popupWindow) {
            return;
        }
        cancelAnimation(popupWindow);

        fadeElement(popupWindow, {
            from: parseFloat(getComputedStyle(popupWindow).opacity || "1") || 1,
            to: 0,
            duration: FADE_DURATION_MS,
        }).then(() => {
            popupWindow.style.display = "none";
            RootController.resumeLevel();
        });
    },

    showPayDialog: function () {
        SoundMgr.playSound(ResourceId.SND_TAP);
        Dialogs.showPopup("payDialog");
    },

    showSlowComputerPopup: function () {
        // remove the text images
        const slowComputer = document.getElementById("slowComputer");
        slowComputer.querySelectorAll("img").forEach((img) => img.remove());

        // add the title and text
        const titleImg = Text.drawBig({
                text: Lang.menuText(MenuStringId.SLOW_TITLE),
                alignment: Alignment.CENTER,
                width: 1200 * resolution.CANVAS_SCALE,
                scale: 1.25 * resolution.UI_TEXT_SCALE,
            }),
            textImg = Text.drawBig({
                text: Lang.menuText(MenuStringId.SLOW_TEXT),
                width: 1200 * resolution.CANVAS_SCALE,
                scale: 0.8 * resolution.UI_TEXT_SCALE,
            });

        textImg.style.marginLeft = resolution.uiScaledNumber(30) + "px";
        slowComputer.appendChild(titleImg);
        slowComputer.appendChild(textImg);

        // shrink button text slightly so it will fit in RU and DE
        Text.drawBig({
            text: Lang.menuText(MenuStringId.LETS_PLAY),
            imgSel: "#slowComputerBtn img",
            scale: 0.8 * resolution.UI_TEXT_SCALE,
        });

        Dialogs.showPopup("slowComputer");
    },
};

function onPayClick() {
    PubSub.publish(PubSub.ChannelId.PurchaseBoxesPrompt);
    Dialogs.closePopup();
}

// localize dialog text
PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
    Text.drawBig({
        text: Lang.menuText(MenuStringId.UPGRADE_TO_FULL),
        imgParentId: "payMessage",
        width: resolution.uiScaledNumber(650),
        alignment: Alignment.CENTER,
        scale: 0.8 * resolution.UI_TEXT_SCALE,
    });

    Text.drawBig({
        text: Lang.menuText(MenuStringId.BUY_FULL_GAME),
        imgParentId: "payBtn",
        scale: 0.6 * resolution.UI_TEXT_SCALE,
    });
});

// DOM ready replacement
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEventListeners);
} else {
    initEventListeners();
}

function initEventListeners() {
    // trigger purchase when pay button is clicked
    const payImg = document.getElementById("payImg");
    const payBtn = document.getElementById("payBtn");
    const payClose = document.getElementById("payClose");
    const slowComputerBtn = document.getElementById("slowComputerBtn");
    const missingOkBtn = document.getElementById("missingOkBtn");
    const resetNoBtn = document.getElementById("resetNoBtn");

    if (payImg) payImg.addEventListener("click", onPayClick);
    if (payBtn) payBtn.addEventListener("click", onPayClick);
    if (payClose) payClose.addEventListener("click", Dialogs.closePopup);
    if (slowComputerBtn) slowComputerBtn.addEventListener("click", Dialogs.closePopup);
    if (missingOkBtn) missingOkBtn.addEventListener("click", Dialogs.closePopup);
    if (resetNoBtn) resetNoBtn.addEventListener("click", Dialogs.closePopup);
}

export default Dialogs;
