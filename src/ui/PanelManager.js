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
const PanelManager = new (function () {
    const _this = this,
        panels = [];

    const getElementById = (id) => (id ? document.getElementById(id) : null);
    const showElementById = (id) => {
        const el = getElementById(id);
        if (el) el.style.display = "block";
    };
    const hideElementById = (id) => {
        const el = getElementById(id);
        if (el) el.style.display = "none";
    };
    const setElementOpacity = (el, value) => {
        if (el) el.style.opacity = String(value);
    };
    const setElementDisplay = (el, value) => {
        if (el) el.style.display = value;
    };

    this.onShowPanel = null;

    this.domReady = function () {
        fadeToBlack = document.getElementById("fadeToBlack");
        shadowCanvas = document.getElementById("shadowCanvas");
        shadowPanelElement = document.getElementById("shadowPanel");

        shadowCanvas = document.getElementById("shadowCanvas");
        shadowCanvas.width = resolution.uiScaledNumber(1024);
        shadowCanvas.height = resolution.uiScaledNumber(576);
    };

    this.appReady = function (onInitializePanel) {
        // we have to wait until the game is ready to run before initializing
        // panels because we need the fonts to be loaded

        shadowImage = new Image();
        shadowImage.src = platform.uiImageBaseUrl + "shadow.png";

        // initialize each of the panels
        if (onInitializePanel) {
            for (let i = 0, len = panels.length; i < len; i++) {
                onInitializePanel(panels[i].id);
            }
        }
    };

    // get a panel by id
    const getPanelById = (this.getPanelById = function (panelId) {
        for (let i = 0; i < panels.length; i++) {
            if (panels[i].id == panelId) return panels[i];
        }
        return null;
    });

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

    this.currentPanelId = PanelId.MENU;

    // show a panel by id
    this.showPanel = function (panelId, skipFade) {
        _this.currentPanelId = panelId;

        const panel = getPanelById(panelId);
        const skip = skipFade == null ? false : skipFade;

        // enable / disable the shadow animation
        if (panel.showShadow) {
             showShadow();
        }
        else {
             hideShadow();
        }

        // we always use a timeout, even if we skip the animation, to keep the code clean
        const timeout = skip ? 0 : fadeInDur + fadePause;
        setTimeout(function () {
            // show the panel
            if (panel.bgDivId) {
                showElementById(panel.bgDivId);
            }
            if (panel.panelDivId) {
                showElementById(panel.panelDivId);
            }

            // hide other panels
            for (let i = 0; i < panels.length; i++) {
                const otherPanel = panels[i];

                if (otherPanel.panelDivId != null && otherPanel.panelDivId != panel.panelDivId) {
                    hideElementById(otherPanel.panelDivId);
                }

                if (otherPanel.bgDivId != null && otherPanel.bgDivId != panel.bgDivId) {
                    hideElementById(otherPanel.bgDivId);
                }
            }

            // run the "show" handler
            if (_this.onShowPanel != null) {
                _this.onShowPanel(panelId);
            }

            // fade back in
            if (!skip) {
                _this.runBlackFadeOut();
            }
        }, timeout);

        // start the animation
        if (!skip) {
            _this.runBlackFadeIn();
        }
    };

    // fade parameters
    var fadeInDur = 100;
    var fadePause = 50;
    const fadeOutDur = 100;
    const fadeTo = 1.0;
    let fadeToBlack;
    let isFading = false;

    this.runBlackFadeIn = function (callback) {
        const startTime = Date.now();

        if (!fadeToBlack) {
            if (callback) callback();
            return;
        }

        isFading = true;

        setElementOpacity(fadeToBlack, 0);
        setElementDisplay(fadeToBlack, "block");

        // our loop
        function loop() {
            const now = Date.now(),
                diff = now - startTime,
                v = Easing.noEase(diff, 0, fadeTo, fadeInDur);

            setElementOpacity(fadeToBlack, v);

            if (diff < fadeInDur) {
                window.requestAnimationFrame(loop);
            } else {
                setElementOpacity(fadeToBlack, fadeTo);
                if (callback != null) callback();
            }
        }

        window.requestAnimationFrame(loop);
    };

    this.runBlackFadeOut = function () {
        if (!isFading || !fadeToBlack) return;
        const startTime = Date.now();

        function loop() {
            const now = Date.now(),
                diff = now - startTime,
                v = fadeTo - Easing.noEase(diff, 0, fadeTo, fadeInDur);

            setElementOpacity(fadeToBlack, v);

            if (diff < fadeInDur) {
                window.requestAnimationFrame(loop);
            } else {
                setElementOpacity(fadeToBlack, 0);
                setElementDisplay(fadeToBlack, "none");
                isFading = false;
            }
        }

        window.requestAnimationFrame(loop);
    };

    let shadowIsRotating = false;
    let shadowAngle = 15.0;
    let shadowCanvas = null;
    var shadowImage = null;
    let shadowOpacity = 1.0;
    let shadowIsVisible = false;
    const shadowSpeedup = edition.shadowSpeedup || 1;
    let shadowPanelElement = null;

    const showShadow = function () {
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
                shadowPanelElement.style.display = "block";
            }
            if (!shadowIsRotating) {
                beginRotateShadow();
            }
        }
    };

    const hideShadow = function () {
        shadowIsVisible = false;
        shadowIsRotating = false;
        if (shadowPanelElement) {
            shadowPanelElement.style.display = "none";
        }
    };

    // starts the shadow animation
    var beginRotateShadow = function () {
        if (!shadowCanvas) return;
        let ctx = shadowCanvas.getContext("2d"),
            requestAnimationFrame = window["requestAnimationFrame"],
            lastRotateTime = Date.now(),
            renderShadow = function () {
                if (!shadowIsRotating) {
                    return;
                }

                // move .1 radians every 25 msec
                const now = Date.now(),
                    delta = now - lastRotateTime;
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
})();

PubSub.subscribe(PubSub.ChannelId.BoxesUnlocked, function (isFirstUnlock) {
    const nextPanelId = isFirstUnlock ? PanelId.MENU : PanelId.BOXES;

    // switch back to the boxes panel after a short delay
    setTimeout(function () {
        PanelManager.showPanel(nextPanelId);
    }, 1000);
});

export default PanelManager;
