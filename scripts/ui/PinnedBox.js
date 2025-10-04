define("ui/PinnedBox", [
    "ui/Box",
    "ui/QueryStrings",
    "resources/Lang",
    "resources/MenuStringId",
    "utils/PubSub",
    "edition",
    "visual/Text",
    "platform",
    "analytics",
    "resolution",
    "core/SettingStorage",
], function (
    Box,
    QueryStrings,
    Lang,
    MenuStringId,
    PubSub,
    edition,
    Text,
    platform,
    analytics,
    resolution,
    SettingStorage
) {
    /**
     * @enum {number}
     */
    var PinnedStates = {
        UNDEFINED: -1, // unknown pinned state
        HIDDEN: 0, // hidden, probably because the OS d
        VISIBLE: 1, // visible and completely playable
        PROMPT_IE: 2, // visible but with a prompt to install IE
        PROMPT_PIN: 3, // visible but with a prompt to pin the game
    };

    var PinnedBox = Box.extend({
        init: function (boxIndex, bgimg, reqstars, islocked, type) {
            this._super(boxIndex, bgimg, reqstars, islocked, type);
            this.pinnedState = PinnedStates.UNDEFINED;
            this.promptId = null;

            // dom ready init
            var self = this;
            $(document).ready(function () {
                $("#showMeBtn").click(function () {
                    if (analytics.onShowPinning) {
                        analytics.onShowPinning();
                    }
                    self.showMePinning();
                });

                // We'll only get download links for vista and win7. For win8
                // the url is null and we will hide the button (since the user
                // already has IE10 installed)
                var $getIeButton = $("#installieBtn"),
                    ieDownload = getIE9DownloadUrl();
                if (ieDownload) {
                    $getIeButton.on("click", function (e) {
                        if (analytics.onDownloadIE) {
                            analytics.onDownloadIE();
                        }
                        window.location.href = ieDownload;
                    });

                    PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
                        Text.drawBig({
                            text: Lang.menuText(MenuStringId.FREE_DOWNLOAD),
                            img: $getIeButton.find("img")[0],
                            scaleToUI: true,
                        });
                    });
                } else {
                    $getIeButton.hide();
                }
            });
        },

        isRequired: function () {
            // returns true if the box is enabled on the platform. this doesn't always
            // mean it is unlocked. For example, in Chrome on Windows, we'll tell
            // the user to install IE. On IE, they need to pin the game first. However
            // there is no IE on mac so the box is completely disabled.

            return this.pinnedState !== PinnedStates.HIDDEN;
        },

        initPinnedState: function () {
            // returns the version of Internet Explorer or a -1 if another browser
            var getIEVersion = function () {
                var rv = -1; // Return value assumes failure.
                return rv;
                if (
                    navigator.appName == "Microsoft Internet Explorer" ||
                    navigator.appName == "MSAppHost/1.0"
                ) {
                    var ua = navigator.userAgent,
                        re = new RegExp("MSIE ([0-9]?[0-9]{1,}[\.0-9]{0,})"),
                        matches = re.exec(ua);
                    if (matches != null && matches.length > 1) {
                        // first entry is the original string followed by matches
                        // so index 1 is the first match
                        rv = parseInt(matches[1], 10);
                    }
                }
                return rv;
            };

            // returns a bool indiciating whether IE can run on the current OS
            var getIECapableOS = function () {
                return false;
                try {
                    var u = navigator.userAgent;
                    var isWindows = u.indexOf("Windows NT") != -1;
                    var majVersion = isWindows ? parseInt(u[u.indexOf("Windows NT") + 11]) : -1;
                    if (isWindows && majVersion >= 6) return true;
                } catch (ex) {
                    return false;
                }
                return false;
            };

            // what version of IE are we running (or -1 for non-IE)
            var ieVer = getIEVersion();

            // are we using an OS (Vista or up) that supports IE
            var ieCan = getIECapableOS();

            // are we in IE9 or greater
            if (ieVer >= 9 || QueryStrings.forcePinnedBox) {
                var localStorageIsPinned =
                        platform.ENABLE_PINNED_MODE ||
                        SettingStorage.get("msIsSiteModeActivated") == "true",
                    msIsSiteMode = platform.ENABLE_PINNED_MODE === true;

                // no way to check if this function exists, we have to use try/catch
                if (!msIsSiteMode) {
                    try {
                        if (window.external.msIsSiteMode()) {
                            msIsSiteMode = true;
                        }
                    } catch (ex) {}
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

                    var self = this;

                    PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
                        Text.drawBig({
                            text: Lang.menuText(MenuStringId.SHOW_ME),
                            imgSel: "#showMeBtn img",
                            scaleToUI: true,
                        });
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
            if (
                this.pinnedState == PinnedStates.HIDDEN ||
                this.pinnedState == PinnedStates.UNDEFINED
            ) {
                return false;
            } else {
                return true;
            }
        },

        onSelected: function () {
            if (this.promptId != null) {
                $("#pinningContent").stop(true, true).delay(100).fadeIn(800);
                $("#" + this.promptId).show();
            }
        },

        onUnselected: function () {
            if (this.promptId != null) {
                $("#pinningContent").stop(true, true).fadeOut(300);
            }
        },

        // runs (and the resets) the "show me" animation for the pinned box
        showMePinning: function () {
            var cursor = $("#pinCursor");
            var omnom = $("#pinOmNom");
            var shadow = $("#pinChairShadow");
            var button = $("#showMeBtn");
            var taskbar = $("#pinTaskBar");
            button.fadeOut().delay(5500).fadeIn(1000);
            shadow.delay(500).fadeOut().delay(6000).fadeIn(300);
            cursor
                .delay(500)
                .fadeIn()
                .delay(2250)
                .animate({ left: resolution.uiScaledNumber(200) }, 500, "easeInOutCirc")
                .fadeOut()
                .animate(
                    {
                        top: resolution.uiScaledNumber(65),
                        left: resolution.uiScaledNumber(45),
                        scale: "1.0",
                    },
                    0
                );
            omnom
                .delay(500)
                .fadeIn()
                .delay(1000)
                .animate(
                    {
                        top: resolution.uiScaledNumber(305),
                        left: resolution.uiScaledNumber(165),
                    },
                    1000,
                    "easeInOutBack"
                )
                .delay(1500)
                .animate({ scale: "0.65" }, 200)
                .delay(1500)
                .fadeOut(1000)
                .animate(
                    {
                        top: resolution.uiScaledNumber(115),
                        left: resolution.uiScaledNumber(-49),
                        scale: "1.0",
                    },
                    50
                )
                .fadeIn(500);
            taskbar.delay(500).fadeIn().delay(5000).fadeOut(1000);
        },
    });

    return PinnedBox;
});
