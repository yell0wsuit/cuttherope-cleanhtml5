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

if ("serviceWorker" in navigator) {
    // Only load PWA registration when the plugin is enabled (not on Netlify)
    import("virtual:pwa-register")
        .then(({ registerSW }) => {
            registerSW({
                immediate: true,
                onOfflineReady() {
                    window.console?.info?.("Cut the Rope is ready for offline play.");
                },
            });
        })
        .catch(() => {
            // PWA plugin not available (e.g., on Netlify), silently ignore
        });
}
