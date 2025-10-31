import Box from "@/ui/Box";
import QueryStrings from "@/ui/QueryStrings";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import PubSub from "@/utils/PubSub";
import edition from "@/config/editions/net-edition";
import Text from "@/visual/Text";
import platform from "@/platform";
import analytics from "@/analytics";
import resolution from "@/resolution";
import SettingStorage from "@/core/SettingStorage";

/**
 * @enum {number}
 */
const PinnedStates = {
    UNDEFINED: -1, // unknown pinned state
    HIDDEN: 0, // hidden, probably because the OS d
    VISIBLE: 1, // visible and completely playable
    PROMPT_IE: 2, // visible but with a prompt to install IE
    PROMPT_PIN: 3, // visible but with a prompt to pin the game
};

// Helper functions for animations
function fadeIn(element, duration = 400, delay = 0) {
    if (!element) return Promise.resolve();

    return new Promise((resolve) => {
        setTimeout(() => {
            element.style.opacity = "0";
            element.style.display = "";

            let start = null;
            function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.min(progress / duration, 1);

                element.style.opacity = opacity.toString();

                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            requestAnimationFrame(animate);
        }, delay);
    });
}

function fadeOut(element, duration = 400, delay = 0) {
    if (!element) return Promise.resolve();

    return new Promise((resolve) => {
        setTimeout(() => {
            let start = null;
            const initialOpacity = parseFloat(window.getComputedStyle(element).opacity) || 1;

            function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.max(initialOpacity - progress / duration, 0);

                element.style.opacity = opacity.toString();

                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = "none";
                    resolve();
                }
            }
            requestAnimationFrame(animate);
        }, delay);
    });
}

function animateProperty(element, props, duration, easing = "linear", delay = 0) {
    if (!element) return Promise.resolve();

    return new Promise((resolve) => {
        setTimeout(() => {
            const startValues = {};
            const endValues = {};

            // Get initial values
            for (const prop in props) {
                if (prop === "scale") {
                    startValues[prop] = parseFloat(
                        element.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || "1"
                    );
                    endValues[prop] = parseFloat(props[prop]);
                } else {
                    const computed = window.getComputedStyle(element);
                    startValues[prop] = parseFloat(computed[prop]) || 0;
                    endValues[prop] = parseFloat(props[prop]);
                }
            }

            let start = null;
            function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                const easedProgress = applyEasing(progress, easing);

                for (const prop in props) {
                    const value =
                        startValues[prop] + (endValues[prop] - startValues[prop]) * easedProgress;
                    if (prop === "scale") {
                        element.style.transform = `scale(${value})`;
                    } else {
                        element.style[prop] = `${value}px`;
                    }
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            requestAnimationFrame(animate);
        }, delay);
    });
}

function applyEasing(t, easing) {
    switch (easing) {
        case "easeInOutCirc":
            return t < 0.5
                ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
                : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
        case "easeInOutBack": {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        }
        default:
            return t;
    }
}

class PinnedBox extends Box {
    constructor(boxIndex, bgimg, reqstars, islocked, type) {
        super(boxIndex, bgimg, reqstars, islocked, type);
        this.pinnedState = PinnedStates.UNDEFINED;
        this.promptId = null;

        // dom ready init

        function initialize() {
            const showMeBtn = document.getElementById("showMeBtn");
            if (showMeBtn) {
                showMeBtn.addEventListener("click", () => {
                    if (analytics.onShowPinning) {
                        analytics.onShowPinning();
                    }
                    this.showMePinning();
                });
            }

            // We'll only get download links for vista and win7. For win8
            // the url is null and we will hide the button (since the user
            // already has IE10 installed)
            const getIeButton = document.getElementById("installieBtn");
            const ieDownload = getIE9DownloadUrl();

            const getIE9DownloadUrl = () => {
                console.log("stubbed");
            };

            if (getIeButton) {
                if (ieDownload) {
                    getIeButton.addEventListener("click", function (e) {
                        if (analytics.onDownloadIE) {
                            analytics.onDownloadIE();
                        }
                        window.location.href = ieDownload;
                    });

                    PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
                        const img = getIeButton.querySelector("img");
                        if (img) {
                            Text.drawBig({
                                text: Lang.menuText(MenuStringId.FREE_DOWNLOAD),
                                img: img,
                                scaleToUI: true,
                            });
                        }
                    });
                } else {
                    getIeButton.style.display = "none";
                }
            }
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initialize);
        } else {
            initialize();
        }
    }

    isRequired() {
        // returns true if the box is enabled on the platform. this doesn't always
        // mean it is unlocked. For example, in Chrome on Windows, we'll tell
        // the user to install IE. On IE, they need to pin the game first. However
        // there is no IE on mac so the box is completely disabled.

        return this.pinnedState !== PinnedStates.HIDDEN;
    }

    initPinnedState() {
        // returns the version of Internet Explorer or a -1 if another browser
        const getIEVersion = function () {
            const rv = -1; // Return value assumes failure.
            return rv;
            /*if (
                navigator.appName == "Microsoft Internet Explorer" ||
                navigator.appName == "MSAppHost/1.0"
            ) {
                const ua = navigator.userAgent,
                    re = new RegExp("MSIE ([0-9]?[0-9]{1,}[.0-9]{0,})"),
                    matches = re.exec(ua);
                if (matches != null && matches.length > 1) {
                    // first entry is the original string followed by matches
                    // so index 1 is the first match
                    rv = parseInt(matches[1], 10);
                }
            }
            return rv;*/
        };

        // returns a bool indiciating whether IE can run on the current OS
        const getIECapableOS = function () {
            return false;
            /*(try {
                const u = navigator.userAgent;
                const isWindows = u.indexOf("Windows NT") != -1;
                const majVersion = isWindows ? parseInt(u[u.indexOf("Windows NT") + 11]) : -1;
                if (isWindows && majVersion >= 6) return true;
            } catch (ex) {
                return false;
            }
            return false;*/
        };

        // what version of IE are we running (or -1 for non-IE)
        const ieVer = getIEVersion();

        // are we using an OS (Vista or up) that supports IE
        const ieCan = getIECapableOS();

        // are we in IE9 or greater
        if (ieVer >= 9 || QueryStrings.forcePinnedBox) {
            const localStorageIsPinned =
                platform.ENABLE_PINNED_MODE ||
                SettingStorage.get("msIsSiteModeActivated") == "true";
            let msIsSiteMode = platform.ENABLE_PINNED_MODE === true;

            // no way to check if this function exists, we have to use try/catch
            if (!msIsSiteMode) {
                try {
                    if (window.external.msIsSiteMode()) {
                        msIsSiteMode = true;
                    }
                } catch (ex) {
                    // empty
                }
            }

            // is the site pinned
            if (localStorageIsPinned || msIsSiteMode || QueryStrings.forcePinnedBox) {
                // show the pinned box with all levels unlocked
                this.pinnedState = PinnedStates.VISIBLE;
                this.opacity = 1.0;
                this.promptId = null;

                // show the first time after being pinned message and save the state
                if (!localStorageIsPinned) {
                    SettingStorage.set("msIsSiteModeActivated", "true");
                    if (analytics.onSitePinned) {
                        analytics.onSitePinned();
                    }
                }
            } else {
                // we're in IE9 but not pinned so show instructions for pinning
                this.pinnedState = PinnedStates.PROMPT_PIN;
                this.opacity = 0.35;
                this.promptId = "pinPrompt";

                PubSub.subscribe(PubSub.ChannelId.LanguageChanged, () => {
                    const showMeImg = document.querySelector("#showMeBtn img");
                    if (showMeImg) {
                        Text.drawBig({
                            text: Lang.menuText(MenuStringId.SHOW_ME),
                            img: showMeImg,
                            scaleToUI: true,
                        });
                    }
                });
            }
        } else if (ieCan) {
            this.pinnedState = PinnedStates.PROMPT_IE;
            this.opacity = 0.35;
            this.promptId = "iePrompt";
        } else {
            // we're not in incompatible OS so do nothing (keep the box hidden) and move the final box forward
            this.pinnedState = PinnedStates.HIDDEN;
            this.opacity = 0.35;
            this.promptId = null;
        }

        // return a bool indicating whether the box should be added to the boxes collection
        if (this.pinnedState == PinnedStates.HIDDEN || this.pinnedState == PinnedStates.UNDEFINED) {
            return false;
        } else {
            return true;
        }
    }

    onSelected() {
        if (this.promptId != null) {
            const pinningContent = document.getElementById("pinningContent");
            const promptElement = document.getElementById(this.promptId);

            if (pinningContent) {
                fadeIn(pinningContent, 800, 100);
            }
            if (promptElement) {
                promptElement.style.display = "";
            }
        }
    }

    onUnselected() {
        if (this.promptId != null) {
            const pinningContent = document.getElementById("pinningContent");
            if (pinningContent) {
                fadeOut(pinningContent, 300);
            }
        }
    }

    // runs (and the resets) the "show me" animation for the pinned box
    showMePinning() {
        const cursor = document.getElementById("pinCursor");
        const omnom = document.getElementById("pinOmNom");
        const shadow = document.getElementById("pinChairShadow");
        const button = document.getElementById("showMeBtn");
        const taskbar = document.getElementById("pinTaskBar");

        // Button animation
        if (button) {
            fadeOut(button, 400, 0).then(() => fadeIn(button, 1000, 5500));
        }

        // Shadow animation
        if (shadow) {
            fadeOut(shadow, 400, 500).then(() => fadeIn(shadow, 300, 6000));
        }

        // Cursor animation
        if (cursor) {
            fadeIn(cursor, 400, 500)
                .then(() => new Promise((resolve) => setTimeout(resolve, 2250)))
                .then(() =>
                    animateProperty(
                        cursor,
                        { left: resolution.uiScaledNumber(200) },
                        500,
                        "easeInOutCirc"
                    )
                )
                .then(() => fadeOut(cursor, 400))
                .then(() => {
                    cursor.style.top = `${resolution.uiScaledNumber(65)}px`;
                    cursor.style.left = `${resolution.uiScaledNumber(45)}px`;
                    cursor.style.transform = "scale(1.0)";
                });
        }

        // Omnom animation
        if (omnom) {
            fadeIn(omnom, 400, 500)
                .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
                .then(() =>
                    animateProperty(
                        omnom,
                        {
                            top: resolution.uiScaledNumber(305),
                            left: resolution.uiScaledNumber(165),
                        },
                        1000,
                        "easeInOutBack"
                    )
                )
                .then(() => new Promise((resolve) => setTimeout(resolve, 1500)))
                .then(() => animateProperty(omnom, { scale: "0.65" }, 200))
                .then(() => new Promise((resolve) => setTimeout(resolve, 1500)))
                .then(() => fadeOut(omnom, 1000))
                .then(() => {
                    omnom.style.top = `${resolution.uiScaledNumber(115)}px`;
                    omnom.style.left = `${resolution.uiScaledNumber(-49)}px`;
                    omnom.style.transform = "scale(1.0)";
                    return new Promise((resolve) => setTimeout(resolve, 50));
                })
                .then(() => fadeIn(omnom, 500));
        }

        // Taskbar animation
        if (taskbar) {
            fadeIn(taskbar, 400, 500)
                .then(() => new Promise((resolve) => setTimeout(resolve, 5000)))
                .then(() => fadeOut(taskbar, 1000));
        }
    }
}

export default PinnedBox;
