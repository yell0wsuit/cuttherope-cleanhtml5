import platform from "@/platform";
import edition from "@/edition";
const GAME_COMPLETE_CLASS = "gameComplete";
let borderElement = null;

function ensureBorderElement() {
    if (!borderElement) {
        borderElement = document.getElementById("gameBorder");
    }
    return borderElement;
}

function applyFade({ fadeIn, duration = 0, delay = 0 }) {
    const element = ensureBorderElement();
    if (!element) return;

    const totalDelay = Math.max(delay, 0);
    const effectiveDuration = Math.max(duration, 0);

    if (effectiveDuration === 0) {
        if (fadeIn) {
            element.style.opacity = "1";
            element.style.display = "";
        } else {
            element.style.opacity = "0";
            element.style.display = "none";
        }
        return;
    }

    const targetOpacity = fadeIn ? 1 : 0;
    const initialOpacity = fadeIn ? 0 : 1;

    if (fadeIn) {
        element.style.display = "";
        element.style.opacity = initialOpacity;
    }

    element.style.transition = "none";

    requestAnimationFrame(() => {
        element.style.transition = `opacity ${effectiveDuration}ms ease`;

        if (!fadeIn) {
            element.style.opacity = initialOpacity;
        }

        setTimeout(() => {
            element.style.opacity = targetOpacity;
        }, totalDelay);

        const handleTransitionEnd = () => {
            element.removeEventListener("transitionend", handleTransitionEnd);
            if (!fadeIn) {
                element.style.display = "none";
            }
            element.style.transition = "";
        };

        element.addEventListener("transitionend", handleTransitionEnd, { once: true });
    });
}

const GameBorder = {
    domReady: function () {
        ensureBorderElement();
    },
    setBoxBorder: function (boxIndex) {
        const element = ensureBorderElement();
        if (!element) return;

        const borderFile = edition.boxBorders[boxIndex];
        const backgroundUrl = borderFile ? `${platform.uiImageBaseUrl}${borderFile}` : "";

        element.classList.remove(GAME_COMPLETE_CLASS);
        element.style.backgroundImage = backgroundUrl ? `url("${backgroundUrl}")` : "";
    },
    setGameCompleteBorder: function () {
        const element = ensureBorderElement();
        if (!element) return;

        element.style.backgroundImage = "";
        element.classList.add(GAME_COMPLETE_CLASS);
    },
    hide: function () {
        const element = ensureBorderElement();
        if (!element) return;
        element.style.display = "none";
    },
    show: function () {
        const element = ensureBorderElement();
        if (!element) return;
        element.style.display = "";
    },
    fadeIn: function (duration, delay) {
        applyFade({ fadeIn: true, duration, delay });
    },
    fadeOut: function (duration, delay) {
        applyFade({ fadeIn: false, duration, delay });
    },
};

export default GameBorder;
