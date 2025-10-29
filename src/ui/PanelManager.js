import PanelId from "@/ui/PanelId";
import Panel from "@/ui/Panel";
import BoxPanel from "@/ui/BoxPanel";
import LevelPanel from "@/ui/LevelPanel";
import PasswordPanel from "@/ui/TimePasswordPanel";
import resolution from "@/resolution";
import platform from "@/platform";
import Easing from "@/ui/Easing";
import PubSub from "@/utils/PubSub";
import edition from "@/edition";
import dom from "@/utils/dom";

// Panel state
const panels = [];

// Fade parameters
const fadeInDur = 100;
const fadePause = 50;
const fadeOutDur = 100;
const fadeTo = 1.0;
let fadeToBlack = null;
let isFading = false;

// Shadow state
let shadowIsRotating = false;
let shadowAngle = 15.0;
let shadowCanvas = null;
let shadowImage = null;
let shadowOpacity = 1.0;
let shadowIsVisible = false;
const shadowSpeedup = edition.shadowSpeedup || 1;
let shadowPanelElement = null;

// get a panel by id
const getPanelById = (panelId) => {
    for (let i = 0; i < panels.length; i++) {
        if (panels[i].id == panelId) return panels[i];
    }
    return null;
};

// Shadow functions
const showShadow = () => {
    if (!shadowIsVisible) {
        if (shadowCanvas != null) {
            const ctx = shadowCanvas.getContext("2d");
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
            ctx.restore();
        }

        shadowOpacity = 0.0;
        shadowIsVisible = true;

        if (shadowPanelElement) {
            dom.show(shadowPanelElement, "block");
        }
        if (!shadowIsRotating) {
            beginRotateShadow();
        }
    }
};

const hideShadow = () => {
    shadowIsVisible = false;
    shadowIsRotating = false;
    if (shadowPanelElement) {
        dom.hide(shadowPanelElement);
    }
};

// starts the shadow animation
const beginRotateShadow = () => {
    if (!shadowCanvas) return;
    const ctx = shadowCanvas.getContext("2d");
    const requestAnimationFrame = window["requestAnimationFrame"];
    let lastRotateTime = Date.now();

    const renderShadow = () => {
        if (!shadowIsRotating) {
            return;
        }

        // move .1 radians every 25 msec
        const now = Date.now();
        const delta = now - lastRotateTime;
        shadowAngle += ((delta * 0.1) / 25) * shadowSpeedup;
        lastRotateTime = now;

        // clear the canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

        // update opacity
        if (shadowOpacity < 1.0) {
            shadowOpacity += 0.025;
            shadowOpacity = Math.min(shadowOpacity, 1.0);
            ctx.globalAlpha = shadowOpacity;
        }

        // rotate the context
        ctx.save();
        ctx.translate(shadowImage.width * 0.5, shadowImage.height * 0.5);
        ctx.translate(resolution.uiScaledNumber(-300), resolution.uiScaledNumber(-510));
        ctx.rotate((shadowAngle * Math.PI) / 180);
        ctx.translate(-shadowImage.width * 0.5, -shadowImage.height * 0.5);

        // draw the image and update the loop
        ctx.drawImage(shadowImage, 0, 0);
        ctx.restore();

        requestAnimationFrame(renderShadow);
    };

    shadowIsRotating = true;
    renderShadow();
};

// Fade functions
const runBlackFadeIn = (callback) => {
    const startTime = Date.now();

    if (!fadeToBlack) {
        if (callback) callback();
        return;
    }

    isFading = true;

    dom.setStyle(fadeToBlack, "opacity", "0");
    dom.show(fadeToBlack, "block");

    // our loop
    const loop = () => {
        const now = Date.now();
        const diff = now - startTime;
        const v = Easing.noEase(diff, 0, fadeTo, fadeInDur);

        dom.setStyle(fadeToBlack, "opacity", String(v));

        if (diff < fadeInDur) {
            window.requestAnimationFrame(loop);
        } else {
            dom.setStyle(fadeToBlack, "opacity", String(fadeTo));
            if (callback != null) callback();
        }
    };

    window.requestAnimationFrame(loop);
};

const runBlackFadeOut = () => {
    if (!isFading || !fadeToBlack) return;
    const startTime = Date.now();

    const loop = () => {
        const now = Date.now();
        const diff = now - startTime;
        const v = fadeTo - Easing.noEase(diff, 0, fadeTo, fadeInDur);

        dom.setStyle(fadeToBlack, "opacity", String(v));

        if (diff < fadeInDur) {
            window.requestAnimationFrame(loop);
        } else {
            dom.setStyle(fadeToBlack, "opacity", "0");
            dom.hide(fadeToBlack);
            isFading = false;
        }
    };

    window.requestAnimationFrame(loop);
};

// create our panels
panels.push(new Panel(PanelId.MENU, "menuPanel", "startBackground", true));
panels.push(BoxPanel);
panels.push(LevelPanel);

// the game panel re-uses the panel doors in the levelBackground (actually in foreground)
panels.push(new Panel(PanelId.GAME, null, "levelBackground", false));
panels.push(new Panel(PanelId.GAMEMENU, null, null, false));
panels.push(new Panel(PanelId.LEVELCOMPLETE, null, null, false));
panels.push(new Panel(PanelId.GAMECOMPLETE, "gameCompletePanel", "menuBackground", true));
panels.push(new Panel(PanelId.OPTIONS, "optionsPanel", "menuBackground", true));
panels.push(new Panel(PanelId.CREDITS, null, null, false));
panels.push(new Panel(PanelId.LEADERBOARDS, "leaderboardPanel", "menuBackground", true));
panels.push(new Panel(PanelId.ACHIEVEMENTS, "achievementsPanel", "menuBackground", true));
panels.push(PasswordPanel);

const PanelManager = {
    /** @type {((panelId: number) => void) | null} */
    onShowPanel: null,
    currentPanelId: PanelId.MENU,

    domReady: () => {
        fadeToBlack = document.getElementById("fadeToBlack");
        shadowCanvas = document.getElementById("shadowCanvas");
        shadowPanelElement = document.getElementById("shadowPanel");

        shadowCanvas = document.getElementById("shadowCanvas");
        shadowCanvas.width = resolution.uiScaledNumber(1024);
        shadowCanvas.height = resolution.uiScaledNumber(576);
    },

    appReady: (onInitializePanel) => {
        // we have to wait until the game is ready to run before initializing
        // panels because we need the fonts to be loaded

        shadowImage = new Image();
        shadowImage.src = `${platform.uiImageBaseUrl}shadow.png`;

        // initialize each of the panels
        if (onInitializePanel) {
            for (let i = 0, len = panels.length; i < len; i++) {
                onInitializePanel(panels[i].id);
            }
        }
    },

    getPanelById,

    // show a panel by id
    showPanel(panelId, skipFade) {
        this.currentPanelId = panelId;

        const panel = getPanelById(panelId);
        const skip = skipFade == null ? false : skipFade;

        // enable / disable the shadow animation
        if (panel.showShadow) {
            showShadow();
        } else {
            hideShadow();
        }

        // we always use a timeout, even if we skip the animation, to keep the code clean
        const timeout = skip ? 0 : fadeInDur + fadePause;
        setTimeout(() => {
            // show the panel
            if (panel.bgDivId) {
                dom.show(`#${panel.bgDivId}`, "block");
            }
            if (panel.panelDivId) {
                dom.show(`#${panel.panelDivId}`, "block");
            }

            // hide other panels
            for (let i = 0; i < panels.length; i++) {
                const otherPanel = panels[i];

                if (otherPanel.panelDivId != null && otherPanel.panelDivId != panel.panelDivId) {
                    dom.hide(`#${otherPanel.panelDivId}`);
                }

                if (otherPanel.bgDivId != null && otherPanel.bgDivId != panel.bgDivId) {
                    dom.hide(`#${otherPanel.bgDivId}`);
                }
            }

            // run the "show" handler
            if (this.onShowPanel != null) {
                this.onShowPanel(panelId);
            }

            // fade back in
            if (!skip) {
                runBlackFadeOut();
            }
        }, timeout);

        // start the animation
        if (!skip) {
            runBlackFadeIn();
        }
    },

    runBlackFadeIn,
    runBlackFadeOut,
};

PubSub.subscribe(PubSub.ChannelId.BoxesUnlocked, (isFirstUnlock) => {
    const nextPanelId = isFirstUnlock ? PanelId.MENU : PanelId.BOXES;

    // switch back to the boxes panel after a short delay
    setTimeout(() => {
        PanelManager.showPanel(nextPanelId);
    }, 1000);
});

export default PanelManager;
