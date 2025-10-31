import PanelId from "@/ui/PanelId";
import Panel from "@/ui/Panel";
import resolution from "@/resolution";
import platform from "@/platform";
import ScoreManager from "@/ui/ScoreManager";
import BoxManager from "@/ui/BoxManager";
import PubSub from "@/utils/PubSub";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Lang from "@/resources/Lang";
import Text from "@/visual/Text";
import MenuStringId from "@/resources/MenuStringId";
import edition from "@/edition";
import Alignment from "@/core/Alignment";
import Dialogs from "@/ui/Dialogs";
import {
    getElement,
    addClass,
    removeClass,
    show,
    hide,
    empty,
    append,
    fadeIn,
    fadeOut,
    delay,
} from "@/utils/domHelpers";

const backgroundId = edition.levelBackgroundId || "levelBackground";
const LevelPanel = new Panel(PanelId.LEVELS, "levelPanel", backgroundId, true);

// cache interface manager reference
let im = null;

LevelPanel.init = function (interfaceManager) {
    im = interfaceManager;

    // generate level elements
    const levelCount = ScoreManager.levelCount(BoxManager.currentBoxIndex);
    const levelOptions = getElement("#levelOptions");

    // initialize for a 3x3 grid
    let leftOffset = 0,
        topOffset = 0,
        lineLength = resolution.uiScaledNumber(420),
        inc = resolution.uiScaledNumber(153),
        modClass = "",
        columns = 3,
        lastRowCount = levelCount % 3;

    if (levelCount > 9 && levelCount <= 12) {
        // expand to 4x3 grid
        leftOffset = -80;
        topOffset = 10;
        columns = 4;
        lineLength = resolution.uiScaledNumber(500);
        inc = resolution.uiScaledNumber(153);
    } else if (levelCount > 12) {
        // expand to a 5x5 grid
        leftOffset = -30;
        topOffset = -40;
        inc = resolution.uiScaledNumber(101);
        modClass = "option-small";
        ((columns = 5), (lastRowCount = levelCount % 5));
    }

    let curTop = topOffset,
        curLeft = leftOffset,
        el;

    const adLevel = function $addLevel(i, inc, extraPad) {
        if (!levelOptions) {
            return;
        }

        const levelButton = document.createElement("div");
        levelButton.id = `option${i + 1}`;
        levelButton.dataset.level = i;
        levelButton.className = `option locked ctrPointer ${modClass}`;
        levelButton.style.left = `${curLeft + (extraPad || 0)}px`;
        levelButton.style.top = `${curTop}px`;
        levelButton.addEventListener("click", onLevelClick);
        levelOptions.appendChild(levelButton);

        curLeft += inc;
        if (curLeft > lineLength) {
            curLeft = leftOffset;
            curTop += inc;
        }
    };

    let i, filledRowCount;
    for (i = 0, filledRowCount = levelCount - lastRowCount; i < filledRowCount; i++) {
        adLevel(i, inc);
    }

    if (lastRowCount > 0) {
        (function (j) {
            const extraPad = ((columns - lastRowCount) * inc) / 2;
            for (; j < levelCount; j++) {
                adLevel(j, inc, extraPad);
            }
        })(i);
    }
};

LevelPanel.onShow = function () {
    updateLevelOptions();
    const levelScore = getElement("#levelScore");
    const levelBack = getElement("#levelBack");
    const levelOptions = getElement("#levelOptions");
    const levelResults = getElement("#levelResults");

    if (levelScore) {
        delay(levelScore, 200).then(function () {
            return fadeIn(levelScore, 700);
        });
    }
    if (levelBack) {
        delay(levelBack, 200).then(function () {
            return fadeIn(levelBack, 700);
        });
    }
    if (levelOptions) {
        delay(levelOptions, 200).then(function () {
            return fadeIn(levelOptions, 700);
        });
    }
    if (levelResults) {
        delay(levelResults, 200).then(function () {
            return fadeOut(levelResults, 700);
        });
    }
};

// listen to purchase event
/*let isPaid = false;
PubSub.subscribe(PubSub.ChannelId.SetPaidBoxes, function (paid) {
    isPaid = paid;
    updateLevelOptions();
});*/

// update level UI when boxes are updated (paid upgrade or roaming data change)
PubSub.subscribe(PubSub.ChannelId.UpdateVisibleBoxes, function (visibleBoxes) {
    updateLevelOptions();
});

/*function requiresPurchase(levelIndex) {
    if (isPaid) {
        return false;
    }

    if (edition.levelRequiresPurchase) {
        return edition.levelRequiresPurchase(BoxManager.currentBoxIndex, levelIndex);
    }

    return false;
}*/

function onLevelClick(event) {
    const levelIndex = parseInt(event.currentTarget.dataset.level, 10);
    if (ScoreManager.isLevelUnlocked(BoxManager.currentBoxIndex, levelIndex)) {
        SoundMgr.selectRandomGameMusic();
        im.gameFlow.openLevel(levelIndex + 1);
    } /*else if (requiresPurchase(levelIndex)) {
        Dialogs.showPayDialog();
    }*/ else {
        // no action
        return;
    }

    SoundMgr.playSound(ResourceId.SND_TAP);
}

// draw the level options based on current scores and stars
function updateLevelOptions() {
    const boxIndex = BoxManager.currentBoxIndex,
        levelCount = ScoreManager.levelCount(boxIndex);
    let stars, levelInfo, i, levelRequiresPurchase;

    for (i = 0; i < levelCount; i++) {
        // get a reference to the level button
        const levelElement = document.getElementById(`option${i + 1}`);
        if (levelElement) {
            // show and prepare the element, otherwise hide it
            if (i < levelCount) {
                show(levelElement);

                //levelRequiresPurchase = requiresPurchase(i);

                // if the level has a score show it, otherwise make it locked
                stars = ScoreManager.getStars(boxIndex, i);
                if (stars != null) {
                    levelInfo = document.createElement("div");
                    levelInfo.className = "txt";
                    append(levelInfo, Text.drawBig({ text: i + 1, scaleToUI: true }));
                    const starsElement = document.createElement("div");
                    addClass(starsElement, `stars${stars}`);
                    levelInfo.appendChild(starsElement);

                    removeClass(levelElement, "locked");
                    removeClass(levelElement, "purchase");
                    addClass(levelElement, "open");
                    addClass(levelElement, "ctrPointer");
                    empty(levelElement);
                    levelElement.appendChild(levelInfo);
                } else {
                    removeClass(levelElement, "open");
                    addClass(levelElement, "locked");
                    //toggleClass(levelElement, "purchase", levelRequiresPurchase);
                    //toggleClass(levelElement, "ctrPointer", levelRequiresPurchase);
                    empty(levelElement);
                }
            } else {
                hide(levelElement);
            }
        }
    }

    // update the scores
    // currently assuming each level has three stars
    const text = `${ScoreManager.achievedStars(BoxManager.currentBoxIndex)}/${ScoreManager.levelCount(BoxManager.currentBoxIndex) * 3}`;
    Text.drawBig({ text: text, imgSel: "#levelScore img", scaleToUI: true });
    BoxManager.updateBoxLocks();
    ScoreManager.updateTotalScoreText();
}

export default LevelPanel;
