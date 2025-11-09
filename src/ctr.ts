import App from "@/app";
import platform from "@/config/platforms/platform-web";
import "@/game/CTRRootController";
import "@/game/CTRSoundMgr";

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
});

const boot = (): void => {
    if (!platform.meetsRequirements()) {
        return;
    }

    App.domReady();
    App.run();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
    boot();
}
