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
class BoxManagerClass {
    constructor() {
        this.boxes = [];
        this.appIsReady = false;
        this.isPaid = false;
        this.currentBoxIndex = 0;
        // TODO: the current level index starts at 1, should be zero-based
        this.currentLevelIndex = 1;

        // Subscribe to events
        PubSub.subscribe(PubSub.ChannelId.SelectedBoxChanged, (boxIndex) => {
            this.currentBoxIndex = boxIndex;
            this.currentLevelIndex = 1;
        });

        PubSub.subscribe(PubSub.ChannelId.SetPaidBoxes, (paid) => {
            this.isPaid = paid;
            this._onPaidBoxesChange(paid);
        });

        // reload boxes when user signs in or out
        PubSub.subscribe(PubSub.ChannelId.SignIn, () => this._loadBoxes());
        PubSub.subscribe(PubSub.ChannelId.SignOut, () => this._loadBoxes());
        PubSub.subscribe(PubSub.ChannelId.RoamingDataChanged, () => this._loadBoxes());
        PubSub.subscribe(PubSub.ChannelId.BoxesUnlocked, () => this._loadBoxes());
    }

    appReady() {
        this.appIsReady = true;
        this._loadBoxes();
    }

    isNextLevelPlayable() {
        // check to make sure we aren't on the last level of the box
        if (ScoreManager.levelCount(this.currentBoxIndex) <= this.currentLevelIndex) {
            return false;
        }

        // see if the game requires purchase of some levels
        if (this.isPaid || !edition.levelRequiresPurchase) {
            return true; // already purchased or none required
        }

        // check whether next level is free
        return !edition.levelRequiresPurchase(this.currentBoxIndex, this.currentLevelIndex); // NOTE: checking next level since this index is 1 based (TODO: fix!)
    }

    _loadBoxes() {
        // only load boxes if app is ready
        if (!this.appIsReady) {
            return;
        }

        this.currentBoxIndex = 0;
        // TODO: the current level index starts at 1, should be zero-based
        this.currentLevelIndex = 1;

        this._createBoxes();
        this._updateVisibleBoxes();
    }

    // returns the number of boxes required to win the game
    requiredCount() {
        let count = 0;
        for (let i = 0, len = this.boxes.length; i < len; i++) {
            if (this.boxes[i].isRequired()) {
                count++;
            }
        }
        return count;
    }

    possibleStars() {
        let count = 0;
        const len = this.boxes.length;
        for (let i = 0; i < len; i++) {
            // we'll count every box except for the hidden pinned box
            if (this.boxes[i].isRequired()) {
                count += ScoreManager.possibleStarsForBox(i);
            }
        }
        return count;
    }

    visibleGameBoxes() {
        let count = 0,
            i,
            len,
            box;
        for (i = 0, len = this.boxes.length; i < len; i++) {
            box = this.boxes[i];

            // count boxes that are required to finish the game
            // and also purchased
            if (box.isRequired() && box.purchased !== false) {
                count++;
            }
        }
        return count;
    }

    resetLocks() {
        let i, len, box;

        // don't lock the first box
        for (i = 1, len = this.boxes.length; i < len; i++) {
            box = this.boxes[i];

            // only lock game boxes
            if (box.isGameBox()) {
                box.islocked = true;
            }
        }

        BoxPanel.redraw();
    }

    updateBoxLocks() {
        const numBoxes = this.boxes.length;
        let shouldRedraw = false,
            boxIndex,
            box;

        // unlock new boxes if visual state has not been updated yet
        // (first box is always unlocked)
        for (boxIndex = 1; boxIndex < numBoxes; boxIndex++) {
            box = this.boxes[boxIndex];
            if (!ScoreManager.isBoxLocked(boxIndex) && box.purchased && box.islocked) {
                box.islocked = false;
                shouldRedraw = true;
                ScoreManager.setStars(boxIndex, 0, 0);
            }
        }

        if (shouldRedraw) {
            BoxPanel.redraw();
        }
    }

    _createBoxes() {
        const images = edition.boxImages,
            boxtypes = edition.boxTypes;
        let i, len, box, type, requiredStars, isLocked;

        // clear any existing boxes
        while (this.boxes.length) {
            const existingBox = this.boxes.pop();
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
                default:
                    box = new Box(i, images[i], requiredStars, isLocked, type);
                    break;
            }

            if (box) {
                this.boxes.push(box);
            }
        }
    }

    _updateVisibleBoxes() {
        const visibleBoxes = [];
        let i, box, len;
        for (i = 0, len = this.boxes.length; i < len; i++) {
            box = this.boxes[i];
            box.index = i;
            if (box.visible) {
                visibleBoxes.push(box);
            }
        }

        PubSub.publish(PubSub.ChannelId.UpdateVisibleBoxes, visibleBoxes);
    }

    _onPaidBoxesChange(paid) {
        paid = paid || QueryStrings.unlockAllBoxes === true;

        const requiresPurchase =
            edition.levelRequiresPurchase ||
            function () {
                return false;
            };
        let i, len, box;

        // first box is always unlocked
        for (i = 1, len = this.boxes.length; i < len; i++) {
            box = this.boxes[i];

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

        this._updateVisibleBoxes();
    }
}

const BoxManager = new BoxManagerClass();

export default BoxManager;
