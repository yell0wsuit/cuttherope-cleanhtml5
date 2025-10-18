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
class PanelManagerClass {
    constructor() {
        this.panels = [];
        this.onShowPanel = null;
        this.currentPanelId = PanelId.MENU;

        // Fade parameters
        this.fadeInDur = 100;
        this.fadePause = 50;
        this.fadeOutDur = 100;
        this.fadeTo = 1.0;
        this.fadeToBlack = null;
        this.isFading = false;

        // Shadow parameters
        this.shadowIsRotating = false;
        this.shadowAngle = 15.0;
        this.shadowCanvas = null;
        this.shadowImage = null;
        this.shadowOpacity = 1.0;
        this.shadowIsVisible = false;
        this.shadowSpeedup = edition.shadowSpeedup || 1;
        this.shadowPanelElement = null;

        // create our panels
        this.panels.push(new Panel(PanelId.MENU, "menuPanel", "startBackground", true));
        this.panels.push(BoxPanel);
        this.panels.push(LevelPanel);

        // the game panel re-uses the panel doors in the levelBackground (actually in foreground)
        this.panels.push(new Panel(PanelId.GAME, null, "levelBackground", false));
        this.panels.push(new Panel(PanelId.GAMEMENU, null, null, false));
        this.panels.push(new Panel(PanelId.LEVELCOMPLETE, null, null, false));
        this.panels.push(new Panel(PanelId.GAMECOMPLETE, "gameCompletePanel", "menuBackground", true));
        this.panels.push(new Panel(PanelId.OPTIONS, "optionsPanel", "menuBackground", true));
        this.panels.push(new Panel(PanelId.CREDITS, null, null, false));
        this.panels.push(new Panel(PanelId.LEADERBOARDS, "leaderboardPanel", "menuBackground", true));
        this.panels.push(new Panel(PanelId.ACHIEVEMENTS, "achievementsPanel", "menuBackground", true));
        this.panels.push(PasswordPanel);
    }

    domReady() {
        this.fadeToBlack = document.getElementById("fadeToBlack");
        this.shadowCanvas = document.getElementById("shadowCanvas");
        this.shadowPanelElement = document.getElementById("shadowPanel");

        this.shadowCanvas = document.getElementById("shadowCanvas");
        this.shadowCanvas.width = resolution.uiScaledNumber(1024);
        this.shadowCanvas.height = resolution.uiScaledNumber(576);
    }

    appReady(onInitializePanel) {
        // we have to wait until the game is ready to run before initializing
        // panels because we need the fonts to be loaded

        this.shadowImage = new Image();
        this.shadowImage.src = platform.uiImageBaseUrl + "shadow.png";

        // initialize each of the panels
        if (onInitializePanel) {
            for (let i = 0, len = this.panels.length; i < len; i++) {
                onInitializePanel(this.panels[i].id);
            }
        }
    }

    // get a panel by id
    getPanelById(panelId) {
        for (let i = 0; i < this.panels.length; i++) {
            if (this.panels[i].id == panelId) return this.panels[i];
        }
        return null;
    }

    // show a panel by id
    showPanel(panelId, skipFade) {
        this.currentPanelId = panelId;

        const panel = this.getPanelById(panelId);
        const skip = skipFade == null ? false : skipFade;

        // enable / disable the shadow animation
        if (panel.showShadow) {
            this._showShadow();
        } else {
            this._hideShadow();
        }

        // we always use a timeout, even if we skip the animation, to keep the code clean
        const timeout = skip ? 0 : this.fadeInDur + this.fadePause;
        setTimeout(() => {
            // show the panel
            if (panel.bgDivId) {
                this._showElementById(panel.bgDivId);
            }
            if (panel.panelDivId) {
                this._showElementById(panel.panelDivId);
            }

            // hide other panels
            for (let i = 0; i < this.panels.length; i++) {
                const otherPanel = this.panels[i];

                if (otherPanel.panelDivId != null && otherPanel.panelDivId != panel.panelDivId) {
                    this._hideElementById(otherPanel.panelDivId);
                }

                if (otherPanel.bgDivId != null && otherPanel.bgDivId != panel.bgDivId) {
                    this._hideElementById(otherPanel.bgDivId);
                }
            }

            // run the "show" handler
            if (this.onShowPanel != null) {
                this.onShowPanel(panelId);
            }

            // fade back in
            if (!skip) {
                this.runBlackFadeOut();
            }
        }, timeout);

        // start the animation
        if (!skip) {
            this.runBlackFadeIn();
        }
    }

    runBlackFadeIn(callback) {
        const startTime = Date.now();

        if (!this.fadeToBlack) {
            if (callback) callback();
            return;
        }

        this.isFading = true;

        this._setElementOpacity(this.fadeToBlack, 0);
        this._setElementDisplay(this.fadeToBlack, "block");

        // our loop
        const loop = () => {
            const now = Date.now(),
                diff = now - startTime,
                v = Easing.noEase(diff, 0, this.fadeTo, this.fadeInDur);

            this._setElementOpacity(this.fadeToBlack, v);

            if (diff < this.fadeInDur) {
                window.requestAnimationFrame(loop);
            } else {
                this._setElementOpacity(this.fadeToBlack, this.fadeTo);
                if (callback != null) callback();
            }
        };

        window.requestAnimationFrame(loop);
    }

    runBlackFadeOut() {
        if (!this.isFading || !this.fadeToBlack) return;
        const startTime = Date.now();

        const loop = () => {
            const now = Date.now(),
                diff = now - startTime,
                v = this.fadeTo - Easing.noEase(diff, 0, this.fadeTo, this.fadeInDur);

            this._setElementOpacity(this.fadeToBlack, v);

            if (diff < this.fadeInDur) {
                window.requestAnimationFrame(loop);
            } else {
                this._setElementOpacity(this.fadeToBlack, 0);
                this._setElementDisplay(this.fadeToBlack, "none");
                this.isFading = false;
            }
        };

        window.requestAnimationFrame(loop);
    }

    // Helper methods
    _getElementById(id) {
        return id ? document.getElementById(id) : null;
    }

    _showElementById(id) {
        const el = this._getElementById(id);
        if (el) el.style.display = "block";
    }

    _hideElementById(id) {
        const el = this._getElementById(id);
        if (el) el.style.display = "none";
    }

    _setElementOpacity(el, value) {
        if (el) el.style.opacity = String(value);
    }

    _setElementDisplay(el, value) {
        if (el) el.style.display = value;
    }

    _showShadow() {
        if (!this.shadowIsVisible) {
            if (this.shadowCanvas != null) {
                const ctx = this.shadowCanvas.getContext("2d");
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, this.shadowCanvas.width, this.shadowCanvas.height);
                ctx.restore();
            }

            this.shadowOpacity = 0.0;
            this.shadowIsVisible = true;

            if (this.shadowPanelElement) {
                this.shadowPanelElement.style.display = "block";
            }
            if (!this.shadowIsRotating) {
                this._beginRotateShadow();
            }
        }
    }

    _hideShadow() {
        this.shadowIsVisible = false;
        this.shadowIsRotating = false;
        if (this.shadowPanelElement) {
            this.shadowPanelElement.style.display = "none";
        }
    }

    // starts the shadow animation
    _beginRotateShadow() {
        if (!this.shadowCanvas) return;
        const ctx = this.shadowCanvas.getContext("2d"),
            requestAnimationFrame = window["requestAnimationFrame"];
        let lastRotateTime = Date.now();
        const renderShadow = () => {
            if (!this.shadowIsRotating) {
                return;
            }

            // move .1 radians every 25 msec
            const now = Date.now(),
                delta = now - lastRotateTime;
            this.shadowAngle += ((delta * 0.1) / 25) * this.shadowSpeedup;
            lastRotateTime = now;

            // clear the canvas
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.shadowCanvas.width, this.shadowCanvas.height);

            // update opacity
            if (this.shadowOpacity < 1.0) {
                this.shadowOpacity += 0.025;
                this.shadowOpacity = Math.min(this.shadowOpacity, 1.0);
                ctx.globalAlpha = this.shadowOpacity;
            }

            // rotate the context
            ctx.save();
            ctx.translate(this.shadowImage.width * 0.5, this.shadowImage.height * 0.5);
            ctx.translate(resolution.uiScaledNumber(-300), resolution.uiScaledNumber(-510));
            ctx.rotate((this.shadowAngle * Math.PI) / 180);
            ctx.translate(-this.shadowImage.width * 0.5, -this.shadowImage.height * 0.5);

            // draw the image and update the loop
            ctx.drawImage(this.shadowImage, 0, 0);
            ctx.restore();

            requestAnimationFrame(renderShadow);
        };

        this.shadowIsRotating = true;
        renderShadow();
    }
}

const PanelManager = new PanelManagerClass();

PubSub.subscribe(PubSub.ChannelId.BoxesUnlocked, function (isFirstUnlock) {
    const nextPanelId = isFirstUnlock ? PanelId.MENU : PanelId.BOXES;

    // switch back to the boxes panel after a short delay
    setTimeout(function () {
        PanelManager.showPanel(nextPanelId);
    }, 1000);
});

export default PanelManager;
