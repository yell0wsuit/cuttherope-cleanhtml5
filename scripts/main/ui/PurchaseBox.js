define("ui/PurchaseBox", [
    "ui/Box",
    "utils/PubSub",
    "resources/Lang",
    "visual/Text",
    "resources/MenuStringId",
    "resolution",
    "core/Alignment",
], function (Box, PubSub, Lang, Text, MenuStringId, resolution, Alignment) {
    // cache upgrade UI elements
    let $upgradePrompt, $upgradeButton;
    $(function () {
        $upgradePrompt = $("#boxUpgradePrompt").hide();
        $upgradeButton = $("#boxUpgradeButton")
            .hide()
            .click(function () {
                PubSub.publish(PubSub.ChannelId.PurchaseBoxesPrompt);
            });
    });

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
            $upgradePrompt.fadeIn();
            $upgradeButton.fadeIn();
        },

        onUnselected: function () {
            $upgradePrompt.fadeOut();
            $upgradeButton.fadeOut(200);
        },
    });

    return PurchaseBox;
});
