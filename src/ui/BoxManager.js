import Box from "@/ui/Box";
import BoxType from "@/ui/BoxType";
import ScoreManager from "@/ui/ScoreManager";
import PubSub from "@/utils/PubSub";
import edition from "@/config/editions/net-edition";
import MoreComingBox from "@/ui/MoreComingBox";
import TimeBox from "@/ui/TimeBox";
import { UIRegistry } from "@/ui/types";
import { IS_XMAS } from "@/resources/ResData";

/**
 * Manages all game boxes — creation, visibility, locks, and events.
 */
class BoxManager {
    /** @type {Box[]} */
    static boxes = [];

    /** @type {boolean} */
    static isPaid = false;

    /** @type {boolean} */
    static appIsReady = false;

    /** @type {number} */
    static currentBoxIndex = BoxManager.getDefaultBoxIndex();

    /** @type {number} */
    static currentLevelIndex = 1; // TODO: should be zero-based

    // ---------------------------------------------------------------------
    // Initialization
    // ---------------------------------------------------------------------

    /**
     * Returns the default box index.
     * Defaults to the Holiday Gift box (index 0) during Christmas season.
     * @returns {number}
     */
    static getDefaultBoxIndex() {
        return IS_XMAS ? 0 : 1;
    }

    /**
     * Marks the app as ready and loads all boxes.
     */
    static appReady() {
        this.appIsReady = true;
        this.loadBoxes();
    }

    /**
     * Loads boxes only if the app is ready.
     */
    static loadBoxes() {
        if (!this.appIsReady) return;

        this.currentBoxIndex = this.getDefaultBoxIndex();
        this.currentLevelIndex = 1;
        this.createBoxes();
        this.updateVisibleBoxes();
    }

    // ---------------------------------------------------------------------
    // Box creation & management
    // ---------------------------------------------------------------------

    /**
     * Creates all boxes according to edition configuration.
     */
    static createBoxes() {
        const { boxImages: images, boxTypes: boxtypes } = edition;

        // Clean up existing boxes
        while (this.boxes.length) {
            const existingBox = this.boxes.pop();
            if (existingBox?.destroy) existingBox.destroy();
        }

        // Create new boxes
        for (let i = 0; i < boxtypes.length; i++) {
            const type = boxtypes[i];
            const requiredStars = ScoreManager.requiredStars(i);
            const isLocked = ScoreManager.isBoxLocked(i);
            let box;

            switch (type) {
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

            if (box) this.boxes.push(box);
        }
    }

    /**
     * Updates the list of visible boxes and publishes via PubSub.
     */
    static updateVisibleBoxes() {
        /** @type {Box[]} */
        const visibleBoxes = [];

        for (let i = 0; i < this.boxes.length; i++) {
            const box = this.boxes[i];
            box.index = i;
            if (box.visible) visibleBoxes.push(box);
        }

        PubSub.publish(PubSub.ChannelId.UpdateVisibleBoxes, visibleBoxes);
    }

    // ---------------------------------------------------------------------
    // Gameplay helpers
    // ---------------------------------------------------------------------

    /**
     * Checks if the next level is playable (i.e., not locked or paid-only).
     * @returns {boolean}
     */
    static isNextLevelPlayable() {
        const levelCount = ScoreManager.levelCount(this.currentBoxIndex);

        // If box is missing or current level is the last one
        if (levelCount == null || levelCount <= this.currentLevelIndex) {
            return false;
        }

        // If already paid or no purchase required
        /*if (this.isPaid || !edition.levelRequiresPurchase) {
            return true;
        }*/

        // Otherwise, check next level's requirement
        //return !edition.levelRequiresPurchase(this.currentBoxIndex, this.currentLevelIndex);

        // Web edition: all levels are free
        return true;
    }

    /**
     * Returns the number of boxes required to win the game.
     * @returns {number}
     */
    static requiredCount() {
        return this.boxes.filter((box) => box.isRequired()).length;
    }

    /**
     * Returns total possible stars across all required boxes.
     * @returns {number}
     */
    static possibleStars() {
        return this.boxes.reduce((sum, box, i) => {
            return box.isRequired() ? sum + ScoreManager.possibleStarsForBox(i) : sum;
        }, 0);
    }

    /**
     * Returns the count of visible and required game boxes.
     * @returns {number}
     */
    static visibleGameBoxes() {
        return this.boxes.filter((box) => box.isRequired() && box.purchased !== false).length;
    }

    // ---------------------------------------------------------------------
    // Lock handling
    // ---------------------------------------------------------------------

    /**
     * Locks all boxes except the first one.
     */
    static resetLocks() {
        for (let i = 1; i < this.boxes.length; i++) {
            const box = this.boxes[i];
            if (box.isGameBox()) {
                box.islocked = true;
            }
        }

        UIRegistry.getBoxPanel()?.redraw();
    }

    /**
     * Unlocks boxes based on score and purchase state.
     */
    static updateBoxLocks() {
        let shouldRedraw = false;

        for (let i = 1; i < this.boxes.length; i++) {
            const box = this.boxes[i];
            if (!ScoreManager.isBoxLocked(i) && box.purchased && box.islocked) {
                box.islocked = false;
                shouldRedraw = true;
                ScoreManager.setStars(i, 0, 0);
            }
        }

        if (shouldRedraw) {
            UIRegistry.getBoxPanel()?.redraw();
        }
    }

    // ---------------------------------------------------------------------
    // Event bindings
    // ---------------------------------------------------------------------

    /**
     * Initializes event subscriptions for box-related updates.
     */
    static initializeEventSubscriptions() {
        PubSub.subscribe(PubSub.ChannelId.SelectedBoxChanged, (/** @type {number} */ boxIndex) => {
            this.currentBoxIndex = boxIndex;
            this.currentLevelIndex = 1;
        });

        PubSub.subscribe(PubSub.ChannelId.SetPaidBoxes, (/** @type {boolean} */ paid) => {
            this.isPaid = paid;
        });

        // Reload boxes on user state changes
        const reloadChannels = [
            PubSub.ChannelId.SignIn,
            PubSub.ChannelId.SignOut,
            PubSub.ChannelId.RoamingDataChanged,
            PubSub.ChannelId.BoxesUnlocked,
        ];

        for (const ch of reloadChannels) {
            PubSub.subscribe(ch, () => this.loadBoxes());
        }
    }
}

// Auto-register event subscriptions
BoxManager.initializeEventSubscriptions();

export default BoxManager;
