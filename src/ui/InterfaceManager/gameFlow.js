import edition from "@/edition";
import resolution from "@/resolution";
import QueryStrings from "@/ui/QueryStrings";
import PanelId from "@/ui/PanelId";
import PanelManager from "@/ui/PanelManager";
import BoxManager from "@/ui/BoxManager";
import ScoreManager from "@/ui/ScoreManager";
import GameBorder from "@/ui/GameBorder";
import SoundMgr from "@/game/CTRSoundMgr";
import VideoManager from "@/ui/VideoManager";
import RootController from "@/game/CTRRootController";
import Doors from "@/Doors";
import PubSub from "@/utils/PubSub";
import EasterEggManager from "@/ui/EasterEggManager";
import settings from "@/game/CTRSettings";
import SnowfallOverlay from "@/ui/SnowfallOverlay";
import { IS_XMAS } from "@/resources/ResData";
import { MENU_MUSIC_ID, startSnow, stopSnow } from "@/ui/InterfaceManager/constants";
import { fadeIn, fadeOut, delay, show, hide, text, width } from "@/utils/domHelpers";

const levelResults = document.getElementById("levelResults");
const levelMenu = document.getElementById("levelMenu");

/**
 * @typedef {Object} LevelWonInfo
 * @property {number} stars - Number of stars earned (0-3)
 * @property {number} time - Time taken to complete the level in seconds
 * @property {number} score - Final score for the level
 * @property {number} fps - Average frames per second during gameplay
 */

/**
 * Base class for game flow management
 */
export default class GameFlow {
    /**
     * Sets the isTransitionActive flag to true and then back to false after the timeout.
     * @param {number} timeout - Timeout in milliseconds
     */
    _notifyBeginTransition(timeout) {
        this.isTransitionActive = true;
        if (this._transitionTimeout != null) {
            clearTimeout(this._transitionTimeout);
        }
        this._transitionTimeout = setTimeout(() => {
            this.isTransitionActive = false;
            this._transitionTimeout = null;
        }, timeout);
    }

    /**
     * Runs the score ticker animation
     */
    _runScoreTicker() {
        text("#resultScore", this._resultBottomLines[this._currentResultLine]);
        this._currentResultLine++;
        if (this._currentResultLine < this._resultTopLines.length) {
            const delayMs = this._currentResultLine < this._resultTimeShiftIndex ? 10 : 167;
            setTimeout(() => this._runScoreTicker(), delayMs);
        }
    }

    /**
     * Checks if the current level is the last level
     * @returns {boolean} True if this is the last level
     */
    _isLastLevel() {
        // see if we are on the last box
        const lastPlayableBoxIndex = BoxManager.requiredCount() - 1;
        if (BoxManager.currentBoxIndex !== lastPlayableBoxIndex) {
            return false;
        }

        // on the last level?
        const numLevels = ScoreManager.levelCount(BoxManager.currentBoxIndex);

        // unfortunately the currentLevelIndex is not zero-based
        if (BoxManager.currentLevelIndex !== numLevels) {
            return false;
        }

        return BoxManager.currentLevelIndex === numLevels;
    }

    /**
     * Opens a level
     * @param {number} level - Level index
     * @param {boolean} isRestart - Whether this is a restart
     * @param {boolean} isSkip - Whether this is skipping a level
     */
    _openLevel(level, isRestart, isSkip) {
        GameBorder.fadeIn(650, 100);
        BoxManager.currentLevelIndex = level;

        // when we start the last level we should begin loading the outro video
        if (this._isLastLevel()) {
            VideoManager.loadOutroVideo();
        }

        if (isRestart) {
            RootController.restartLevel();
        } else {
            PanelManager.showPanel(PanelId.GAME, true);
            setTimeout(() => {
                this.openBox(isSkip);
            }, 200);
        }
    }

    /**
     * Alias for _openLevel to maintain public API
     * @param {number} level
     * @param {boolean} isRestart
     * @param {boolean} isSkip
     */
    openLevel(level, isRestart, isSkip) {
        this._openLevel(level, isRestart, isSkip);
    }

    /**
     * Closes the current level
     */
    _closeLevel() {
        RootController.stopLevel();
    }

    /**
     * Completes the current box and advances
     */
    _completeBox() {
        //attempt to move to the next box
        const boxIndex = BoxManager.currentBoxIndex;

        // check for game complete
        const requiredIndex = BoxManager.requiredCount() - 1;
        const isGameComplete = boxIndex >= requiredIndex;

        if (isGameComplete) {
            GameBorder.hide();
            VideoManager.playOutroVideo();
        } else {
            this.isInAdvanceBoxMode = true;
            const targetPanelId = edition.disableBoxMenu ? PanelId.MENU : PanelId.BOXES;
            PanelManager.showPanel(targetPanelId, false);
        }
    }

    /**
     * Opens the level menu (pause menu)
     */
    _openLevelMenu() {
        RootController.pauseLevel();
        SoundMgr.pauseMusic();
        show("#levelMenu");
    }

    /**
     * Closes the level menu
     */
    _closeLevelMenu() {
        hide("#levelMenu");
        if (
            PanelManager.currentPanelId === PanelId.GAME &&
            this.gameEnabled &&
            RootController.isLevelActive()
        ) {
            SoundMgr.resumeMusic();
        }
    }

    /**
     * Shows the level background
     */
    _showLevelBackground() {
        show("#levelBackground");
    }

    /**
     * Hides the level background
     */
    _hideLevelBackground() {
        hide("#levelBackground");
    }

    /**
     * Tapes the box closed
     */
    tapeBox() {
        if (this.isInMenuSelectMode) {
            GameBorder.fadeOut(800, 400);
            SoundMgr.playMusic(MENU_MUSIC_ID);
        }

        Doors.closeBoxAnimation(() => {
            this.isBoxOpen = false;
            if (this.isInMenuSelectMode) {
                PanelManager.showPanel(PanelId.MENU, false);
            } else {
                Doors.renderDoors(true, 0);
                PanelManager.showPanel(PanelId.LEVELS, true);
            }
            startSnow();
        });
    }

    /**
     * Shows the game UI
     */
    showGameUI() {
        this._hideLevelBackground();
        if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
            show("#bg");
        }
        fadeIn("#gameBtnTray");
        startSnow();
    }

    /**
     * Closes the game UI
     */
    closeGameUI() {
        stopSnow();
        Doors.renderDoors(false, 1);
        this._notifyBeginTransition(1000);
        this._showLevelBackground();
        if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
            hide("#bg");
        }
        fadeOut("#gameBtnTray");
    }

    /**
     * Opens the box
     * @param {boolean} skip - Whether to skip intro
     */
    openBox(skip = false) {
        stopSnow();
        const timeout = PanelManager.currentPanelId === PanelId.LEVELS ? 400 : 0;

        //fade out options elements
        fadeOut("#levelScore");
        fadeOut("#levelBack");

        fadeOut("#levelOptions", timeout).then(() => {
            if (this.isBoxOpen) {
                fadeOut("#levelResults", 800);
                setTimeout(() => {
                    RootController.startLevel(
                        BoxManager.currentBoxIndex + 1,
                        BoxManager.currentLevelIndex
                    );
                    Doors.openDoors(false, () => {
                        this.showGameUI();
                    });
                }, 400);
            } else {
                Doors.openBoxAnimation(() => {
                    this.isBoxOpen = true;
                    RootController.startLevel(
                        BoxManager.currentBoxIndex + 1,
                        BoxManager.currentLevelIndex
                    );
                    Doors.openDoors(true, () => {
                        this.showGameUI();
                    });
                });
            }
        });
    }

    /**
     * Closes the box
     */
    closeBox() {
        stopSnow();
        this.closeGameUI();

        setTimeout(() => {
            // animating from game to results
            if (!this.isInLevelSelectMode) {
                if (levelResults) {
                    delay(levelResults, 750).then(() => fadeIn(levelResults, 250));
                }
            }

            Doors.closeDoors(false, () => {
                if (this.isInLevelSelectMode) {
                    this.tapeBox();
                } else {
                    Doors.showGradient();
                    setTimeout(() => {
                        this._runScoreTicker();
                        startSnow();
                    }, 250);
                }
            });
        }, 250);
    }

    /**
     * Updates the dev link visibility based on window size
     */
    updateDevLink() {
        if (width(window) < resolution.uiScaledNumber(1024) + 120 && this._isDevLinkVisible) {
            fadeOut("#moreLink").then(() => {
                this._isDevLinkVisible = false;
            });
            fadeOut("#zenbox_tab");
        } else if (
            width(window) > resolution.uiScaledNumber(1024) + 120 &&
            !this._isDevLinkVisible
        ) {
            fadeIn("#moreLink").then(() => {
                this._isDevLinkVisible = true;
            });
            fadeIn("#zenbox_tab");
        }
    }

    /**
     * Pauses the game
     */
    pauseGame() {
        // make sure the game is active and no transitions are pending
        if (
            PanelManager.currentPanelId === PanelId.GAME &&
            RootController.isLevelActive() &&
            !this.isTransitionActive
        ) {
            this._openLevelMenu();
        } else {
            SoundMgr.pauseMusic();
        }
    }

    /**
     * Resumes the game
     */
    resumeGame() {
        const isLevelMenuVisible = levelMenu && levelMenu.style.display !== "none";
        if (
            !isLevelMenuVisible &&
            PanelManager.currentPanelId !== PanelId.GAMEMENU &&
            this.gameEnabled
        ) {
            SoundMgr.resumeMusic();
        }
    }

    /**
     * Called when DOM is ready
     */
    domReady() {
        VideoManager.domReady();
        EasterEggManager.domReady();
        PanelManager.domReady();
        GameBorder.domReady();
        SnowfallOverlay.domReady();

        const onVisibilityChange = () => {
            if (document.hidden || document.visibilityState === "hidden") {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        // hide behind the scenes when we update the page
        window.addEventListener("resize", () => {
            this.updateDevLink();
        });
    }

    /**
     * Called when app is ready
     */
    appReady() {
        PubSub.subscribe(PubSub.ChannelId.LevelWon, (/** @type {LevelWonInfo} */ info) => {
            this.onLevelWon(info);
        });

        // Load scores now that JSON data is available
        ScoreManager.load();

        Doors.appReady();
        EasterEggManager.appReady();
        PanelManager.appReady((/** @type {number} */ panelId) => {
            this._onInitializePanel(panelId);
        });
        BoxManager.appReady();
        if (IS_XMAS) {
            startSnow();
        } else {
            SnowfallOverlay.stop();
        }

        // initialize all the localized resources
        PubSub.publish(PubSub.ChannelId.LanguageChanged);

        // start a specific level?
        if (QueryStrings.box != null && QueryStrings.level != null) {
            this.noMenuStartLevel(QueryStrings.box - 1, QueryStrings.level - 1);
        } else if (settings.showMenu) {
            // make sure the game is not password locked
            const passwordPanel = PanelManager.getPanelById(PanelId.PASSWORD);
            if (passwordPanel && passwordPanel.isGameLocked && passwordPanel.isGameLocked()) {
                Doors.renderDoors(true, 0);
                PanelManager.showPanel(PanelId.PASSWORD, true);
            } else {
                PanelManager.showPanel(PanelId.MENU, true);
            }
        }

        PubSub.subscribe(PubSub.ChannelId.PauseGame, () => {
            this.pauseGame();
        });
        PubSub.subscribe(PubSub.ChannelId.EnableGame, () => {
            this.gameEnabled = true;
            this.resumeGame();
        });
        PubSub.subscribe(PubSub.ChannelId.DisableGame, () => {
            this.gameEnabled = false;
            this.pauseGame();
        });
    }

    /**
     * Used for debug and in level editor to start a level w/o menus
     * @param {number} boxIndex - Box index (zero-based)
     * @param {number} levelIndex - Level index (zero-based)
     */
    noMenuStartLevel(boxIndex, levelIndex) {
        PanelManager.showPanel(PanelId.GAME, true);

        // unfortunate that box manager is zero index for box and 1 based for level
        BoxManager.currentBoxIndex = boxIndex;
        BoxManager.currentLevelIndex = levelIndex + 1;

        SoundMgr.selectRandomGameMusic();
        this.openBox();
    }

    /**
     * Opens the level menu for a specific box
     * @param {number} boxIndex - Box index
     */
    openLevelMenu(boxIndex) {
        this.isBoxOpen = false;
        Doors.renderDoors(true, 0);
        PanelManager.showPanel(PanelId.LEVELS);
        GameBorder.setBoxBorder(boxIndex);
    }
}
