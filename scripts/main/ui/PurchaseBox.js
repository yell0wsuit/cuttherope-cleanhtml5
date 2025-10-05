import Box from "ui/Box";
import PubSub from "utils/PubSub";
import Lang from "resources/Lang";
import Text from "visual/Text";
import MenuStringId from "resources/MenuStringId";
import resolution from "resolution";
import Alignment from "core/Alignment";
// cache upgrade UI elements
let $upgradePrompt, $upgradeButton;

function initialize() {
    $upgradePrompt = document.getElementById("boxUpgradePrompt");
    $upgradeButton = document.getElementById("boxUpgradeButton");

    if ($upgradePrompt) {
        $upgradePrompt.style.display = "none";
    }

    if ($upgradeButton) {
        $upgradeButton.style.display = "none";
        $upgradeButton.addEventListener("click", function () {
            PubSub.publish(PubSub.ChannelId.PurchaseBoxesPrompt);
        });
    }
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

// Helper function for fade animations
function fadeIn(element, duration = 400) {
    if (!element) return;

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
        }
    }
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 400) {
    if (!element) return;

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
        }
    }
    requestAnimationFrame(animate);
}

// localize UI element text
PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
    Text.drawBig({
        text: Lang.menuText(MenuStringId.UPGRADE_TO_FULL),
        imgParentId: "boxUpgradePrompt",
        width: resolution.uiScaledNumber(650),
        alignment: Alignment.CENTER,
        scaleToUI: true,
    });

    Text.drawBig({
        text: Lang.menuText(MenuStringId.BUY_FULL_GAME),
        imgParentId: "boxUpgradeButton",
        scale: 0.6 * resolution.UI_TEXT_SCALE,
    });
});

const PurchaseBox = Box.extend({
    init: function (boxIndex, bgimg, reqstars, islocked, type) {
        this._super(boxIndex, bgimg, reqstars, islocked, type);
        this.purchased = false;
        this.includeBoxNumberInTitle = false;
        this.isPurchaseBox = true;
    },

    isRequired: function () {
        // not a box required for game completion
        return false;
    },

    isGameBox: function () {
        return false;
    },

    onSelected: function () {
        fadeIn($upgradePrompt);
        fadeIn($upgradeButton);
    },

    onUnselected: function () {
        fadeOut($upgradePrompt);
        fadeOut($upgradeButton, 200);
    },
});

export default PurchaseBox;
