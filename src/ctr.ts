import app from "@/app.js";
import platform from "@/platform.js";
import "./ctrExports.js";
import RootController from "@/game/CTRRootController";
import SoundMgr from "@/game/CTRSoundMgr";
import { registerSW } from "virtual:pwa-register";

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

if ("serviceWorker" in navigator) {
    registerSW({
        immediate: true,
        onOfflineReady() {
            window.console?.info?.("Cut the Rope is ready for offline play.");
        },
    });
}
