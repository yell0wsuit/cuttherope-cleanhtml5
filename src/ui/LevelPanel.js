import PanelId from "@/ui/PanelId";
import Panel from "@/ui/Panel";
import resolution from "@/resolution";
import platform from "@/config/platforms/platform-web";
import ScoreManager from "@/ui/ScoreManager";
import BoxManager from "@/ui/BoxManager";
import PubSub from "@/utils/PubSub";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Lang from "@/resources/Lang";
import Text from "@/visual/Text";
import MenuStringId from "@/resources/MenuStringId";
import edition from "@/config/editions/net-edition";
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

const MAX_LEVELS_PER_PAGE = 25;

/**
 * Calculate total pages needed with smart pagination
 * @param {number} totalLevels - Total number of levels in the box
 * @returns {number} Total number of pages
 */
const calculateTotalPages = (totalLevels) => {
    if (totalLevels <= MAX_LEVELS_PER_PAGE) {
        return 1;
    }

    // If going over 25, check if we should split differently
    // Avoid having < 10 levels on the last page (looks odd)
    const standardPages = Math.ceil(totalLevels / MAX_LEVELS_PER_PAGE);
    const remainder = totalLevels % MAX_LEVELS_PER_PAGE;

    // If remainder is small (< 10), redistribute for better aesthetics
    if (remainder > 0 && remainder < 10) {
        // Split more evenly: first page gets 16, rest distributed
        return 2;
    }

    return standardPages;
};

/**
 * Calculate the optimal levels per page for better visual layout
 * Grid layouts: <=9: 3 cols, >9 and <=12: 4 cols, >12: 5 cols
 * @param {number} totalLevels - Total number of levels in the box
 * @param {number} pageIndex - Current page index (0-based)
 * @returns {number} Number of levels to show on this page
 */
const getLevelsPerPage = (totalLevels, pageIndex = 0) => {
    if (totalLevels <= MAX_LEVELS_PER_PAGE) {
        return totalLevels;
    }

    const remainder = totalLevels % MAX_LEVELS_PER_PAGE;

    // If we have a small remainder (< 10), redistribute for better balance
    if (remainder > 0 && remainder < 10) {
        // For page 0, try to find a good split that works with grid layouts
        if (pageIndex === 0) {
            const remaining = totalLevels - MAX_LEVELS_PER_PAGE + remainder;

            // Try to balance so both pages use 5x5 layout (>12 levels each)
            // Ideal splits for common cases:
            // 26 levels: 13 (page 1, 5x3) + 13 (page 2, 5x3)
            // 27 levels: 14 (page 1, 5x3) + 13 (page 2, 5x3)
            // 28 levels: 14 (page 1, 5x3) + 14 (page 2, 5x3)
            const halfSplit = Math.ceil(totalLevels / 2);

            // If both halves would be >12 (use 5-col layout), split evenly
            if (halfSplit > 12 && totalLevels - halfSplit > 12) {
                return halfSplit;
            }

            // Otherwise, put more on page 1 and remainder on page 2
            // Aim for page 1 to have a multiple of 5 (for 5x5 grid)
            const page1Count = Math.floor((totalLevels - remainder) / 5) * 5;
            if (page1Count >= 15 && page1Count <= MAX_LEVELS_PER_PAGE) {
                return page1Count;
            }

            // Fallback: use slightly less than max
            return MAX_LEVELS_PER_PAGE - remainder;
        } else {
            // Page 1 already calculated, return the remainder
            const page0Count = getLevelsPerPage(totalLevels, 0);
            return totalLevels - page0Count;
        }
    }

    // Standard pagination: 25 per page
    return MAX_LEVELS_PER_PAGE;
};

// cache interface manager reference
let im = null;
let currentPage = 0;
let lastBoxIndex = null;
let levelNavBack = null;
let levelNavForward = null;
const levelButtons = [];
let isLevelNavigationActive = true;
let lastTotalPages = 0;

LevelPanel.init = function (interfaceManager) {
    im = interfaceManager;

    const levelOptions = getElement("#levelOptions");
    levelNavBack = getElement("#levelNavBack");
    levelNavForward = getElement("#levelNavForward");

    if (!isLevelNavigationActive) {
        if (levelNavBack) hide(levelNavBack);
        if (levelNavForward) hide(levelNavForward);
    }

    levelNavBack?.addEventListener("click", () => {
        if (currentPage === 0) return;
        currentPage -= 1;
        SoundMgr.playSound(ResourceId.SND_TAP);
        updateLevelOptions();
    });

    levelNavForward?.addEventListener("click", () => {
        const boxIndex = BoxManager.currentBoxIndex;
        const levelCount = ScoreManager.levelCount(boxIndex) || 0;
        const totalPages = calculateTotalPages(levelCount);
        if (currentPage >= totalPages - 1) return;
        currentPage += 1;
        SoundMgr.playSound(ResourceId.SND_TAP);
        updateLevelOptions();
    });

    if (levelOptions) {
        for (let i = 0; i < MAX_LEVELS_PER_PAGE; i++) {
            const levelButton = document.createElement("div");
            levelButton.dataset.level = i;
            levelButton.className = "option locked ctrPointer";
            levelButton.addEventListener("click", onLevelClick);
            levelOptions.appendChild(levelButton);
            levelButtons.push(levelButton);
        }
    }
};

LevelPanel.setNavigationActive = function (isActive) {
    isLevelNavigationActive = isActive;

    if (!levelNavBack || !levelNavForward) {
        return;
    }

    if (!isActive) {
        hide(levelNavBack);
        hide(levelNavForward);
        return;
    }

    updateLevelNavigation(lastTotalPages);
};

LevelPanel.onShow = function () {
    LevelPanel.setNavigationActive(false);
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
        delay(levelOptions, 200)
            .then(function () {
                return fadeIn(levelOptions, 700);
            })
            .then(function () {
                LevelPanel.setNavigationActive(true);
            });

        // Show navigation buttons immediately with level options
        LevelPanel.setNavigationActive(true);
        if (lastTotalPages > 1 && levelNavBack && levelNavForward) {
            show(levelNavBack);
            show(levelNavForward);
            levelNavBack.style.opacity = "1";
            levelNavForward.style.opacity = "1";
        }
    } else {
        LevelPanel.setNavigationActive(true);
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
    const boxIndex = BoxManager.currentBoxIndex;
    const levelCount = ScoreManager.levelCount(boxIndex) || 0;

    if (lastBoxIndex !== boxIndex) {
        currentPage = 0;
        lastBoxIndex = boxIndex;
    }

    const totalPages = calculateTotalPages(levelCount);
    if (currentPage >= totalPages) {
        currentPage = totalPages - 1;
    }

    // Calculate start index based on actual levels per page
    let startIndex = 0;
    for (let page = 0; page < currentPage; page++) {
        startIndex += getLevelsPerPage(levelCount, page);
    }

    const levelsThisPage = getLevelsPerPage(levelCount, currentPage);
    const visibleCount = Math.min(levelsThisPage, Math.max(0, levelCount - startIndex));

    updateLevelNavigation(totalPages);

    const layout = getLayoutConfig(visibleCount);

    for (let i = 0; i < levelButtons.length; i++) {
        const levelElement = levelButtons[i];
        if (!levelElement) continue;

        const levelIndex = startIndex + i;
        if (i < visibleCount && levelIndex < levelCount) {
            positionLevelButton(levelElement, i, visibleCount, layout);
            levelElement.dataset.level = levelIndex.toString();
            show(levelElement);

            const stars = ScoreManager.getStars(boxIndex, levelIndex);
            if (stars != null) {
                const levelInfo = document.createElement("div");
                levelInfo.className = "txt";
                append(levelInfo, Text.drawBig({ text: levelIndex + 1, scaleToUI: true }));
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
                empty(levelElement);
            }
        } else {
            hide(levelElement);
        }
    }

    // update the scores
    // currently assuming each level has three stars
    const text = `${ScoreManager.achievedStars(BoxManager.currentBoxIndex)}/${ScoreManager.levelCount(BoxManager.currentBoxIndex) * 3}`;
    Text.drawBig({ text: text, imgSel: "#levelScore img", scaleToUI: true });
    BoxManager.updateBoxLocks();
    ScoreManager.updateTotalScoreText();
}

const getLayoutConfig = (/** @type {number} */ count) => {
    if (count > 12) {
        return {
            columns: 5,
            leftOffset: -30,
            topOffset: -40,
            inc: resolution.uiScaledNumber(101),
        };
    }

    if (count > 9) {
        return {
            columns: 4,
            leftOffset: -80,
            topOffset: 10,
            inc: resolution.uiScaledNumber(153),
        };
    }

    return {
        columns: 3,
        leftOffset: 0,
        topOffset: 0,
        inc: resolution.uiScaledNumber(153),
    };
};

/**
 * Positions a level button within the level grid, including horizontal and vertical centering.
 * @param {HTMLDivElement} levelElement - The DOM element representing the level button.
 * @param {number} index - The index of this button within the visible levels.
 * @param {number} visibleCount - The total number of visible levels on this page.
 * @param {{ columns: number, leftOffset: number, topOffset: number, inc: number }} layout - Grid layout configuration.
 */
const positionLevelButton = (levelElement, index, visibleCount, layout) => {
    const { columns, leftOffset, topOffset, inc } = layout;
    const row = Math.floor(index / columns);
    const column = index % columns;
    const lastRowCount = visibleCount % columns || columns;
    const isLastRow = row === Math.floor((visibleCount - 1) / columns);
    const rowOffset = isLastRow ? ((columns - lastRowCount) * inc) / 2 : 0;

    const totalRows = Math.ceil(visibleCount / columns);

    // height of one full cell (using your increment)
    const totalHeight = totalRows * inc;

    // reference height of a "full" grid (5 rows × inc)
    const fullHeight = 5 * inc;

    // center vertically: shift down if fewer rows
    const verticalOffset = (fullHeight - totalHeight) / 2;

    levelElement.style.left = `${leftOffset + column * inc + rowOffset}px`;
    levelElement.style.top = `${topOffset + row * inc + verticalOffset}px`;

    levelElement.classList.toggle("option-small", columns === 5);
};

const updateLevelNavigation = (/** @type {number} */ totalPages) => {
    if (!levelNavBack || !levelNavForward) {
        return;
    }

    lastTotalPages = totalPages;

    if (!isLevelNavigationActive || totalPages <= 1) {
        hide(levelNavBack);
        hide(levelNavForward);
        return;
    }

    show(levelNavBack);
    show(levelNavForward);

    const backDiv = levelNavBack.firstElementChild;
    const forwardDiv = levelNavForward.firstElementChild;

    if (backDiv) {
        if (currentPage === 0) {
            addClass(backDiv, "boxNavDisabled");
        } else {
            removeClass(backDiv, "boxNavDisabled");
        }
    }

    if (forwardDiv) {
        if (currentPage >= totalPages - 1) {
            addClass(forwardDiv, "boxNavDisabled");
        } else {
            removeClass(forwardDiv, "boxNavDisabled");
        }
    }
};

export default LevelPanel;
