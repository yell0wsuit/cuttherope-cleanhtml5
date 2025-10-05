import app from "./app.js";
import platform from "./platform.js";
import "./ctrExports.js";

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

const GLOBAL_ZOOM = matchMedia("(min-width: 960px)").matches ? 2 : 1;

document.addEventListener("visibilitychange", () => {
    if (!window.sounds__) return;
    const hidden = document.hidden;
    Object.values(window.sounds__).forEach((sound) => {
        if (!sound) return;
        if (hidden) {
            sound._wasPlaying = !sound.paused;
            sound.pause();
        } else if (sound._wasPlaying) {
            sound.play();
        }
    });
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
