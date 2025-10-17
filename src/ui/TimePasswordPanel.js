import PanelId from "@/ui/PanelId";
import Panel from "@/ui/Panel";
import Easing from "@/ui/Easing";
import PubSub from "@/utils/PubSub";
import SoundMgr from "@/game/CTRSoundMgr";
import Text from "@/visual/Text";
import TimeBox from "@/ui/TimeBox";
import Doors from "@/Doors";
import edition from "@/edition";
import QueryStrings from "@/ui/QueryStrings";

const TimePasswordPanel = new Panel(PanelId.PASSWORD, "codePanel", "levelBackground", false);
let $message = null,
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
function initialize() {
    let validating = false;

    $message = document.getElementById("codeMessage");
    $codeText = document.getElementById("codeText");
    $okButton = document.getElementById("codeOkButton");
    $backButton = document.getElementById("codeBack");

    // Toggle visibility based on game lock status
    if ($backButton) {
        $backButton.style.display = TimePasswordPanel.isGameLocked() ? "none" : "";
    }

    function setMessageHtml(html) {
        if (!$message) return;

        $message.innerHTML = html;

        // for some reason, chrome isn't rendering the text when its first set
        // we need to do something to trigger layout, so its shown properly
        const width = $message.offsetWidth;
        $message.style.width = width + 1 + "px";
        $message.style.width = width - 1 + "px";
    }

    let showValidatingMessage = false;
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
        if ($codeText) {
            $codeText.disabled = false;
        }

        if (!isValid) {
            setMessageHtml("Sorry, that code is not valid or <br/> has already been redeemed.");
        } else {
            setMessageHtml("Code Accepted!");

            // have any boxes been unlocked?
            let isFirstUnlock = true,
                i,
                len;
            for (i = 0, len = edition.boxes.length; i < len; i++) {
                if (!TimeBox.isLocked(i)) {
                    isFirstUnlock = false;
                    break;
                }
            }

            // unlock all the boxes
            for (let i = boxIndex; i >= 0; i--) {
                TimeBox.unlockBox(i);
            }

            // back button is initially hidden, show it once the game
            // has been unlocked (but wait until the panel fades out)
            setTimeout(() => {
                if ($backButton) {
                    $backButton.style.display = "";
                }
            }, 3000);

            // reload the boxes
            PubSub.publish(PubSub.ChannelId.BoxesUnlocked, isFirstUnlock);
        }
    }

    function validateCode() {
        // make sure we are not currently validating a code
        if (validating) {
            return;
        }

        if (!$codeText) {
            return;
        }

        // make sure the code is a integer within the valid range
        const numBoxes = edition.boxes.length,
            codeString = $codeText.value || "",
            firstDigit = codeString.length > 0 ? parseInt(codeString[0], 10) || 0 : 0,
            code = parseInt(codeString, 10);
        if (isNaN(code) || code < 0 || firstDigit < 1 || firstDigit > numBoxes) {
            setMessageHtml("Oops, that is not a valid code!");
            return;
        }

        // find the last unlocked box
        let lastUnlockedIndex;
        for (lastUnlockedIndex = numBoxes - 1; lastUnlockedIndex >= 0; lastUnlockedIndex--) {
            if (!TimeBox.isLocked(lastUnlockedIndex)) {
                break;
            }
        }

        // codes start with the box number
        const codeIndex = firstDigit - 1;
        if (codeIndex <= lastUnlockedIndex) {
            setMessageHtml(
                "Levels for that code have already been unlocked! <br/>" +
                    "Visit Burger King each week to get a <br/> new code that will unlock additional levels."
            );
            return;
        }

        // start the validation mode
        if ($codeText) {
            $codeText.disabled = true;
        }
        validating = true;
        pulseWhileValidating();

        fetch("http://ctrbk.cloudapp.net/api/CTRBKCodes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ctrbkcode: code }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                validationComplete(codeIndex, true);
            })
            .catch((error) => {
                validationComplete(codeIndex, false);
            });
    }

    // validate when user hits ENTER in textbox
    if ($codeText) {
        $codeText.addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                validateCode();
            } else {
                // otherwise clear any existing messages
                setMessageHtml("");
            }
        });
    }

    // or when they click the ok button
    if ($okButton) {
        $okButton.addEventListener("click", function () {
            validateCode();
        });
    }
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

let im;
TimePasswordPanel.init = function (interfaceManager) {
    im = interfaceManager;
};

TimePasswordPanel.onShow = function () {
    if ($message) {
        $message.textContent = "";
    }
    if ($codeText) {
        $codeText.value = "";
        $codeText.focus();
    }
    Doors.renderDoors(false, 0);
    Doors.showGradient();
};

TimePasswordPanel.onHide = function () {
    Doors.hideGradient();
};

export default TimePasswordPanel;
