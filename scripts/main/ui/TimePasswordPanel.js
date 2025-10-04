define("ui/TimePasswordPanel", [
    "ui/PanelId",
    "ui/Panel",
    "ui/Easing",
    "utils/PubSub",
    "game/CTRSoundMgr",
    "visual/Text",
    "ui/TimeBox",
    "Doors",
    "edition",
    "ui/QueryStrings",
], function (
    PanelId,
    Panel,
    Easing,
    PubSub,
    SoundMgr,
    Text,
    TimeBox,
    Doors,
    edition,
    QueryStrings
) {
    var TimePasswordPanel = new Panel(PanelId.PASSWORD, "codePanel", "levelBackground", false),
        $message = null,
        $codeText = null,
        $okButton = null,
        $backButton = null;

    TimePasswordPanel.isGameLocked = function () {
        if (!edition.enablePasswordPanel) {
            return false;
        }

        // see if the first box is locked
        return TimeBox.isLocked(0) && !QueryStrings.unlockAllBoxes;
    };

    // dom ready events
    $(function () {
        var validating = false;

        $message = $("#codeMessage");
        $codeText = $("#codeText");
        $okButton = $("#codeOkButton");
        $backButton = $("#codeBack").toggle(!TimePasswordPanel.isGameLocked());

        function setMessageHtml(html) {
            $message.html(html);

            // for some reason, chrome isn't rendering the text when its first set
            // we need to do something to trigger layout, so its shown properly
            var width = $message.width();
            $message.width(width + 1);
            $message.width(width - 1);
        }

        var showValidatingMessage = false;
        function pulseWhileValidating() {
            if (!validating) {
                showValidatingMessage = false;
                return;
            }

            showValidatingMessage = !showValidatingMessage;
            setMessageHtml(showValidatingMessage ? "Validating code . . ." : "");
            setTimeout(pulseWhileValidating, showValidatingMessage ? 600 : 250);
        }

        function validationComplete(boxIndex, isValid) {
            validating = false;
            $codeText.attr("disabled", false);

            if (!isValid) {
                setMessageHtml("Sorry, that code is not valid or <br/> has already been redeemed.");
            } else {
                setMessageHtml("Code Accepted!");

                // have any boxes been unlocked?
                var isFirstUnlock = true,
                    i,
                    len;
                for (i = 0, len = edition.boxes.length; i < len; i++) {
                    if (!TimeBox.isLocked(i)) {
                        isFirstUnlock = false;
                        break;
                    }
                }

                // unlock all the boxes
                for (var i = boxIndex; i >= 0; i--) {
                    TimeBox.unlockBox(i);
                }

                // back button is initially hidden, show it once the game
                // has been unlocked (but wait until the panel fades out)
                $backButton.delay(3000).show(0);

                // reload the boxes
                PubSub.publish(PubSub.ChannelId.BoxesUnlocked, isFirstUnlock);
            }
        }

        function validateCode() {
            // make sure we are not currently validating a code
            if (validating) {
                return;
            }

            // make sure the code is a integer within the valid range
            var numBoxes = edition.boxes.length,
                codeString = $codeText.val() || "",
                firstDigit = codeString.length > 0 ? parseInt(codeString[0], 10) || 0 : 0,
                code = parseInt(codeString, 10);
            if (isNaN(code) || code < 0 || firstDigit < 1 || firstDigit > numBoxes) {
                setMessageHtml("Oops, that is not a valid code!");
                return;
            }

            // find the last unlocked box
            for (
                var lastUnlockedIndex = numBoxes - 1;
                lastUnlockedIndex >= 0;
                lastUnlockedIndex--
            ) {
                if (!TimeBox.isLocked(lastUnlockedIndex)) {
                    break;
                }
            }

            // codes start with the box number
            var codeIndex = firstDigit - 1;
            if (codeIndex <= lastUnlockedIndex) {
                setMessageHtml(
                    "Levels for that code have already been unlocked! <br/>" +
                        "Visit Burger King each week to get a <br/> new code that will unlock additional levels."
                );
                return;
            }

            // start the validation mode
            $codeText.attr("disabled", true);
            validating = true;
            pulseWhileValidating();

            $.ajax({
                type: "POST",
                url: "http://ctrbk.cloudapp.net/api/CTRBKCodes",
                contentType: "application/json",
                data: '{"ctrbkcode":"' + code + '"}',
                dataType: "json",
                error: function (jqXHR, textStatus, errorThrown) {
                    //console.log('error');
                    validationComplete(codeIndex, false);
                },
                success: function (data, textStatus, jqXHR) {
                    //console.log('success');
                    validationComplete(codeIndex, true);
                },
            });
        }

        // validate when user hits ENTER in textbox
        $codeText.keyup(function (e) {
            if (e.which == 13) {
                validateCode();
            } else {
                // otherwise clear any existing messages
                setMessageHtml("");
            }
        });

        // or when the click the ok button
        $okButton.click(function () {
            validateCode();
        });
    });

    var im;
    TimePasswordPanel.init = function (interfaceManager) {
        im = interfaceManager;
    };

    TimePasswordPanel.onShow = function () {
        $message.text("");
        $codeText.val("").focus();
        Doors.renderDoors(false, 0);
        Doors.showGradient();
    };

    TimePasswordPanel.onHide = function () {
        Doors.hideGradient();
    };

    return TimePasswordPanel;
});
