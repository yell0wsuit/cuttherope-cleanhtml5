import app from "@/app.js";
import platform from "@/platform.js";
import "./ctrExports.js";
import RootController from "@/game/CTRRootController";
import SoundMgr from "@/game/CTRSoundMgr";

document.addEventListener("blur", () => {
    document.body.style.transform = "rotate(90deg)";
    setTimeout(() => {
        document.body.style.transform = "rotate(0deg)";
    }, 1000);
});

document.addEventListener("focus", () => {
    document.body.style.transform = "rotate(0deg)";
});

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
});

let levelPausedByVisibility = false;
let audioPausedByVisibility = false;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (RootController.isLevelActive()) {
            RootController.pauseLevel();
            levelPausedByVisibility = true;
            audioPausedByVisibility = false;
        } else if (!SoundMgr.audioPaused) {
            SoundMgr.pauseAudio();
            audioPausedByVisibility = true;
            levelPausedByVisibility = false;
        } else {
            // Already paused, don't do anything on return
            levelPausedByVisibility = false;
            audioPausedByVisibility = false;
        }
    } else {
        // Only resume if we were the ones who paused it
        if (levelPausedByVisibility) {
            RootController.resumeLevel();
            levelPausedByVisibility = false;
        } else if (audioPausedByVisibility) {
            SoundMgr.resumeAudio();
            audioPausedByVisibility = false;
        }
        // If neither flag is set, don't resume anything
    }
});

const boot = () => {
    if (!platform.meetsRequirements()) return;
    app.init();
    app.domReady();
    app.run();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
    boot();
}
