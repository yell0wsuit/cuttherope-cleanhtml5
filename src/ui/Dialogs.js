import RootController from "@/game/CTRRootController";
import PanelId from "@/ui/PanelId";
import resolution from "@/resolution";
import platform from "@/config/platforms/platform-web";
import ScoreManager from "@/ui/ScoreManager";
import BoxManager from "@/ui/BoxManager";
import PubSub from "@/utils/PubSub";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Lang from "@/resources/Lang";
import Text from "@/visual/Text";
import MenuStringId from "@/resources/MenuStringId";
import edition from "@/config/editions/net-edition";
import Alignment from "@/core/Alignment";

const ACTIVE_ANIMATIONS = new WeakMap();
const FADE_DURATION_MS = 200;
const SELECTORS = {
    popupOuter: ".popupOuterFrame",
    popupInner: ".popupInnerFrame",
    popupWindow: "#popupWindow",
};

// ---------- Animation Helpers ----------
function cancelAnimation(el, finalOpacity) {
    const anim = ACTIVE_ANIMATIONS.get(el);
    if (anim) {
        cancelAnimationFrame(anim.frameId);
        ACTIVE_ANIMATIONS.delete(el);
    }
    if (typeof finalOpacity === "number") el.style.opacity = finalOpacity.toString();
}

async function fadeElement(el, { from, to, duration, display }) {
    cancelAnimation(el);
    if (display !== undefined) el.style.display = display;

    const start =
        typeof from === "number" ? from : parseFloat(getComputedStyle(el).opacity || "0") || 0;
    const target = to;
    el.style.opacity = start;

    let startTime;
    return new Promise((resolve) => {
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = start + (target - start) * progress;
            el.style.opacity = current;
            if (progress < 1) {
                const frameId = requestAnimationFrame(step);
                ACTIVE_ANIMATIONS.set(el, { frameId });
            } else {
                ACTIVE_ANIMATIONS.delete(el);
                resolve();
            }
        };
        const frameId = requestAnimationFrame(step);
        ACTIVE_ANIMATIONS.set(el, { frameId });
    });
}

// ---------- Dialog Logic ----------
const Dialogs = {
    async showPopup(contentId) {
        RootController.pauseLevel();

        const popupWindow = document.querySelector(SELECTORS.popupWindow);
        if (!popupWindow) return;

        document.querySelectorAll(SELECTORS.popupOuter).forEach((el) => cancelAnimation(el, 0));
        document
            .querySelectorAll(SELECTORS.popupInner)
            .forEach((el) => (el.style.display = "none"));

        popupWindow.style.display = "block";
        await fadeElement(popupWindow, { from: 0, to: 1, duration: FADE_DURATION_MS });

        const content = document.getElementById(contentId);
        if (content) {
            content.style.display = "block";
            document.querySelectorAll(SELECTORS.popupOuter).forEach((el) => {
                cancelAnimation(el);
                el.style.display = "block";
                fadeElement(el, { from: 0, to: 1, duration: FADE_DURATION_MS });
            });
        }
    },

    async closePopup() {
        SoundMgr.playSound(ResourceId.SND_TAP);
        const popupWindow = document.querySelector(SELECTORS.popupWindow);
        if (!popupWindow) return;

        cancelAnimation(popupWindow);
        const currentOpacity = parseFloat(getComputedStyle(popupWindow).opacity || "1") || 1;

        await fadeElement(popupWindow, {
            from: currentOpacity,
            to: 0,
            duration: FADE_DURATION_MS,
        });

        popupWindow.style.display = "none";
        RootController.resumeLevel();
    },

    showPayDialog() {
        SoundMgr.playSound(ResourceId.SND_TAP);
        Dialogs.showPopup("payDialog");
    },

    showSlowComputerPopup() {
        const slowComputer = document.getElementById("slowComputer");
        if (!slowComputer) return;

        slowComputer.querySelectorAll("img").forEach((img) => img.remove());

        const titleImg = Text.drawBig({
            text: Lang.menuText(MenuStringId.SLOW_TITLE),
            alignment: Alignment.CENTER,
            width: 1200 * resolution.CANVAS_SCALE,
            scale: 1.25 * resolution.UI_TEXT_SCALE,
        });
        const textImg = Text.drawBig({
            text: Lang.menuText(MenuStringId.SLOW_TEXT),
            width: 1200 * resolution.CANVAS_SCALE,
            scale: 0.8 * resolution.UI_TEXT_SCALE,
        });

        textImg.style.marginLeft = `${resolution.uiScaledNumber(30)}px`;
        slowComputer.append(titleImg, textImg);

        Text.drawBig({
            text: Lang.menuText(MenuStringId.LETS_PLAY),
            imgSel: "#slowComputerBtn img",
            scale: 0.8 * resolution.UI_TEXT_SCALE,
        });

        Dialogs.showPopup("slowComputer");
    },
};

// ---------- Event Logic ----------
function onPayClick() {
    PubSub.publish(PubSub.ChannelId.PurchaseBoxesPrompt);
    Dialogs.closePopup();
}

function initEventListeners() {
    const ids = [
        ["payImg", onPayClick],
        ["payBtn", onPayClick],
        ["payClose", Dialogs.closePopup],
        ["slowComputerBtn", Dialogs.closePopup],
        ["missingOkBtn", Dialogs.closePopup],
        ["resetNoBtn", Dialogs.closePopup],
        ["holidayOkBtn", Dialogs.closePopup],
    ];

    ids.forEach(([id, handler]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", handler);
    });
}

// localize dialog text
PubSub.subscribe(PubSub.ChannelId.LanguageChanged, () => {
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

// DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEventListeners);
} else {
    initEventListeners();
}

export default Dialogs;
