import Box from "@/ui/Box";
import PinnedBox from "@/ui/PinnedBox";
import BoxType from "@/ui/BoxType";
import ScoreManager from "@/ui/ScoreManager";
import PubSub from "@/utils/PubSub";
import edition from "@/edition";
import QueryStrings from "@/ui/QueryStrings";
import PurchaseBox from "@/ui/PurchaseBox";
import MoreComingBox from "@/ui/MoreComingBox";
import TimeBox from "@/ui/TimeBox";
import BoxPanel from "@/ui/BoxPanel";
import { IS_XMAS } from "@/resources/ResData";
const BoxManager = new (function () {
    const self = this,
        boxes = [];

    // Helper function to get the default box index based on holiday period
    // During Christmas season (Dec/Jan), default to Holiday Gift Box (index 0)
    // Otherwise, default to Cardboard Box (index 1)
    const getDefaultBoxIndex = function () {
        return IS_XMAS ? 0 : 1;
    };

    PubSub.subscribe(PubSub.ChannelId.SelectedBoxChanged, function (boxIndex) {
        BoxManager.currentBoxIndex = boxIndex;
        BoxManager.currentLevelIndex = 1;
    });

    let appIsReady = false;
    this.appReady = function () {
        appIsReady = true;
        loadBoxes();
    };

    self.currentBoxIndex = getDefaultBoxIndex();

    // TODO: the current level index starts at 1, should be zero-based
    self.currentLevelIndex = 1;

    // listen to purchase event
    let isPaid = false;
    PubSub.subscribe(PubSub.ChannelId.SetPaidBoxes, function (paid) {
        isPaid = paid;
    });

    this.isNextLevelPlayable = function () {
        // check to make sure we aren't on the last level of the box
        if (ScoreManager.levelCount(this.currentBoxIndex) <= this.currentLevelIndex) {
            return false;
        }

        // see if the game requires purchase of some levels
        if (isPaid || !edition.levelRequiresPurchase) {
            return true; // already purchased or none required
        }

        // check whether next level is free
        return !edition.levelRequiresPurchase(this.currentBoxIndex, this.currentLevelIndex); // NOTE: checking next level since this index is 1 based (TODO: fix!)
    };

    const loadBoxes = function () {
        // only load boxes if app is ready
        if (!appIsReady) {
            return;
        }

        self.currentBoxIndex = getDefaultBoxIndex();

        // TODO: the current level index starts at 1, should be zero-based
        self.currentLevelIndex = 1;

        createBoxes();
        updateVisibleBoxes();
    };

    // reload boxes when user signs in or out
    PubSub.subscribe(PubSub.ChannelId.SignIn, loadBoxes);
    PubSub.subscribe(PubSub.ChannelId.SignOut, loadBoxes);
    PubSub.subscribe(PubSub.ChannelId.RoamingDataChanged, loadBoxes);
    PubSub.subscribe(PubSub.ChannelId.BoxesUnlocked, loadBoxes);

    // returns the number of boxes required to win the game
    this.requiredCount = function () {
        let count = 0;
        for (let i = 0, len = boxes.length; i < len; i++) {
            if (boxes[i].isRequired()) {
                count++;
            }
        }
        return count;
    };

    this.possibleStars = function () {
        let count = 0;
        const len = boxes.length;
        for (let i = 0; i < len; i++) {
            // we'll count every box except for the hidden pinned box
            if (boxes[i].isRequired()) {
                count += ScoreManager.possibleStarsForBox(i);
            }
        }
        return count;
    };

    this.visibleGameBoxes = function () {
        let count = 0,
            i,
            len,
            box;
        for (i = 0, len = boxes.length; i < len; i++) {
            box = boxes[i];

            // count boxes that are required to finish the game
            // and also purchased
            if (box.isRequired() && box.purchased !== false) {
                count++;
            }
        }
        return count;
    };

    this.resetLocks = function () {
        let i, len, box;

        // don't lock the first box
        for (i = 1, len = boxes.length; i < len; i++) {
            box = boxes[i];

            // only lock game boxes
            if (box.isGameBox()) {
                box.islocked = true;
            }
        }

        BoxPanel.redraw();
    };

    this.updateBoxLocks = function () {
        const numBoxes = boxes.length;
        let shouldRedraw = false,
            boxIndex,
            box;

        // unlock new boxes if visual state has not been updated yet
        // (first box is always unlocked)
        for (boxIndex = 1; boxIndex < numBoxes; boxIndex++) {
            box = boxes[boxIndex];
            if (!ScoreManager.isBoxLocked(boxIndex) && box.purchased && box.islocked) {
                box.islocked = false;
                shouldRedraw = true;
                ScoreManager.setStars(boxIndex, 0, 0);
            }
        }

        if (shouldRedraw) {
            BoxPanel.redraw();
        }
    };

    function createBoxes() {
        const images = edition.boxImages,
            boxtypes = edition.boxTypes;
        let i, len, box, type, requiredStars, isLocked;

        // clear any existing boxes
        while (boxes.length) {
            const existingBox = boxes.pop();
            if (existingBox && typeof existingBox.destroy === "function") {
                existingBox.destroy();
            }
        }

        // create each box
        for (i = 0, len = boxtypes.length; i < len; i++) {
            type = boxtypes[i];
            requiredStars = ScoreManager.requiredStars(i);
            isLocked = ScoreManager.isBoxLocked(i);

            switch (type) {
                case BoxType.IEPINNED:
                    box = new PinnedBox(i, images[i], requiredStars, isLocked, type);
                    if (!box.initPinnedState()) {
                        box = null; // don't add if we can't init pinned state
                    }
                    break;
                case BoxType.PURCHASE:
                    box = new PurchaseBox(i, images[i], requiredStars, isLocked, type);
                    break;
                case BoxType.MORECOMING:
                    box = new MoreComingBox(i, images[i], requiredStars, isLocked, type);
                    break;
                case BoxType.TIME:
                    box = new TimeBox(i, images[i], requiredStars, isLocked, type);
                    break;
                case BoxType.HOLIDAY:
                    box = new Box(i, images[i], requiredStars, isLocked, type);
                    box.yOffset = -26;
                    break;
                default:
                    box = new Box(i, images[i], requiredStars, isLocked, type);
                    break;
            }

            if (box) {
                boxes.push(box);
            }
        }
    }

    function updateVisibleBoxes() {
        const visibleBoxes = [];
        let i, box, len;
        for (i = 0, len = boxes.length; i < len; i++) {
            box = boxes[i];
            box.index = i;
            if (box.visible) {
                visibleBoxes.push(box);
            }
        }

        PubSub.publish(PubSub.ChannelId.UpdateVisibleBoxes, visibleBoxes);
    }

    function onPaidBoxesChange(paid) {
        paid = paid || QueryStrings.unlockAllBoxes === true;

        const requiresPurchase =
            edition.levelRequiresPurchase ||
            function () {
                return false;
            };
        let i, len, box;

        // first box is always unlocked
        for (i = 1, len = boxes.length; i < len; i++) {
            box = boxes[i];

            // hide unpurchased boxes and show upgrade prompt
            switch (box.type) {
                case BoxType.PURCHASE:
                    box.visible = !paid;
                    break;
                case BoxType.MORECOMING:
                    box.visible = paid;
                    break;
                default:
                    // if not paid, check to see if level 1 of the box requires payment
                    box.purchased = paid || !requiresPurchase(i, 0);
                    box.islocked = !box.purchased || ScoreManager.isBoxLocked(i);
                    break;
            }
        }

        updateVisibleBoxes();
    }

    PubSub.subscribe(PubSub.ChannelId.SetPaidBoxes, onPaidBoxesChange);
})();

export default BoxManager;
