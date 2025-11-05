import App from "@/app.js";
import platform from "@/config/platforms/platform-web";
import RootController from "@/game/CTRRootController";
import SoundMgr from "@/game/CTRSoundMgr";

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
});

const boot = () => {
    if (!platform.meetsRequirements()) return;
    App.domReady();
    App.run();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
    boot();
}
