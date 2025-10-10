import app from "@/app.js";
import platform from "@/platform.js";
import "./ctrExports.js";
import RootController from "@/game/CTRRootController";
import SoundMgr from "@/game/CTRSoundMgr";

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
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
