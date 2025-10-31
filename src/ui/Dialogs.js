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

class Dialogs {
    /** @type {WeakMap<HTMLElement, {frameId: number}>} */
    static ACTIVE_ANIMATIONS = new WeakMap();

    /** @type {number} */
    static FADE_DURATION_MS = 200;

    /** @type {{popupOuter: string, popupInner: string, popupWindow: string}} */
    static SELECTORS = {
        popupOuter: ".popupOuterFrame",
        popupInner: ".popupInnerFrame",
        popupWindow: "#popupWindow",
    };

    /**
     * Cancels a running fade animation on an element.
     * @param {HTMLElement} el
     * @param {number} [finalOpacity]
     */
    static cancelAnimation(el, finalOpacity) {
        const anim = Dialogs.ACTIVE_ANIMATIONS.get(el);
        if (anim) {
            cancelAnimationFrame(anim.frameId);
            Dialogs.ACTIVE_ANIMATIONS.delete(el);
        }
        if (typeof finalOpacity === "number") {
            el.style.opacity = finalOpacity.toString();
        }
    }

    /**
     * Fades an element's opacity between two values over a duration.
     * @param {HTMLElement} el
     * @param {{from?: number, to: number, duration: number, display?: string}} options
     * @returns {Promise<void>}
     */
    static async fadeElement(el, { from, to, duration, display }) {
        Dialogs.cancelAnimation(el);
        if (display !== undefined) el.style.display = display;

        const start =
            typeof from === "number" ? from : parseFloat(getComputedStyle(el).opacity || "0") || 0;
        const target = to;
        el.style.opacity = String(start);

        /**
         * @type {number}
         */
        let startTime;
        return new Promise((resolve) => {
            const step = (/** @type {number} */ timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const current = start + (target - start) * progress;
                el.style.opacity = String(current);

                if (progress < 1) {
                    const frameId = requestAnimationFrame(step);
                    Dialogs.ACTIVE_ANIMATIONS.set(el, { frameId });
                } else {
                    Dialogs.ACTIVE_ANIMATIONS.delete(el);
                    resolve();
                }
            };
            const frameId = requestAnimationFrame(step);
            Dialogs.ACTIVE_ANIMATIONS.set(el, { frameId });
        });
    }

    /**
     * Displays a popup dialog by ID with fade animation.
     * @param {string} contentId - The ID of the popup content element to display.
     * @returns {Promise<void>}
     */
    async showPopup(contentId) {
        RootController.pauseLevel();

        const popupWindow = document.querySelector(Dialogs.SELECTORS.popupWindow);
        if (!popupWindow) return;

        document
            .querySelectorAll(Dialogs.SELECTORS.popupOuter)
            .forEach((el) => Dialogs.cancelAnimation(el, 0));
        document
            .querySelectorAll(Dialogs.SELECTORS.popupInner)
            .forEach((el) => (el.style.display = "none"));

        popupWindow.style.display = "block";
        await Dialogs.fadeElement(popupWindow, {
            from: 0,
            to: 1,
            duration: Dialogs.FADE_DURATION_MS,
        });

        const content = document.getElementById(contentId);
        if (content) {
            content.style.display = "block";
            document.querySelectorAll(Dialogs.SELECTORS.popupOuter).forEach((el) => {
                Dialogs.cancelAnimation(el);
                el.style.display = "block";
                Dialogs.fadeElement(el, {
                    from: 0,
                    to: 1,
                    duration: Dialogs.FADE_DURATION_MS,
                });
            });
        }
    }

    /**
     * Closes the currently open popup with fade-out animation.
     * @returns {Promise<void>}
     */
    async closePopup() {
        SoundMgr.playSound(ResourceId.SND_TAP);

        const popupWindow = document.querySelector(Dialogs.SELECTORS.popupWindow);
        if (!popupWindow) return;

        Dialogs.cancelAnimation(popupWindow);
        const currentOpacity = parseFloat(getComputedStyle(popupWindow).opacity || "1") || 1;

        await Dialogs.fadeElement(popupWindow, {
            from: currentOpacity,
            to: 0,
            duration: Dialogs.FADE_DURATION_MS,
        });

        popupWindow.style.display = "none";
        RootController.resumeLevel();
    }

    /**
     * Opens the payment dialog popup.
     */
    showPayDialog() {
        SoundMgr.playSound(ResourceId.SND_TAP);
        this.showPopup("payDialog");
    }

    /**
     * Shows a "Slow Computer" popup with localized text and title.
     */
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

        this.showPopup("slowComputer");
    }

    /**
     * Initializes DOM event listeners for dialog buttons.
     */
    initEventListeners() {
        /** @type {[string, () => void][]} */
        const ids = [
            // ["payImg", this.onPayClick.bind(this)],
            // ["payBtn", this.onPayClick.bind(this)],
            // ["payClose", this.closePopup.bind(this)],
            ["slowComputerBtn", this.closePopup.bind(this)],
            ["missingOkBtn", this.closePopup.bind(this)],
            ["resetNoBtn", this.closePopup.bind(this)],
            ["holidayOkBtn", this.closePopup.bind(this)],
        ];

        ids.forEach(([id, handler]) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener("click", handler);
        });
    }

    /**
     * Handles payment confirmation click.
     * @private
     */
    onPayClick() {
        PubSub.publish(PubSub.ChannelId.PurchaseBoxesPrompt);
        this.closePopup();
    }

    /**
     * Localizes the text content of all dialog popups on language change.
     * Should be called once at startup.
     */
    initLocalization() {
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
    }

    /**
     * Initializes dialog system on DOM ready.
     */
    init() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.initEventListeners());
        } else {
            this.initEventListeners();
        }

        this.initLocalization();
    }
}

const dialogs = new Dialogs();
dialogs.init();

export default dialogs;
