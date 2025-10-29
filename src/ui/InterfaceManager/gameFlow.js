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
import { fadeIn, fadeOut, delay, show, hide, getElement, text, width } from "@/utils/domHelpers";

const levelResults = getElement("#levelResults");
const levelMenu = getElement("#levelMenu");

/**
 * @typedef {Object} LevelWonInfo
 * @property {number} stars - Number of stars earned (0-3)
 * @property {number} time - Time taken to complete the level in seconds
 * @property {number} score - Final score for the level
 * @property {number} fps - Average frames per second during gameplay
 */

// UI methods

// Sets the isTransitionActive flag to true and then back to false after the timeout. The
// reason for using a timer here is to ensure that we always clear the flag since some UI
// will be disabled until the flag gets cleared. This is an attempt to prevent new bugs.

/**
 * @param {InterfaceManager} manager
 */
export default function createGameFlow(manager) {
    const notifyBeginTransition = (/** @type {number} */ timeout) => {
        manager.isTransitionActive = true;
        if (manager._transitionTimeout != null) {
            clearTimeout(manager._transitionTimeout);
        }
        manager._transitionTimeout = setTimeout(() => {
            manager.isTransitionActive = false;
            manager._transitionTimeout = null;
        }, timeout);
    };

    const runScoreTicker = () => {
        text("#resultScore", manager._resultBottomLines[manager._currentResultLine]);
        manager._currentResultLine++;
        if (manager._currentResultLine < manager._resultTopLines.length) {
            const delayMs = manager._currentResultLine < manager._resultTimeShiftIndex ? 10 : 167;
            setTimeout(runScoreTicker, delayMs);
        }
    };

    const isLastLevel = () => {
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
    };

    const openLevel = (
        /** @type {number} */ level,
        /** @type {boolean} */ isRestart,
        /** @type {boolean} */ isSkip
    ) => {
        GameBorder.fadeIn(650, 100);
        BoxManager.currentLevelIndex = level;

        // when we start the last level we should begin loading the outro video
        if (isLastLevel()) {
            VideoManager.loadOutroVideo();
        }

        if (isRestart) {
            RootController.restartLevel();
        } else {
            PanelManager.showPanel(PanelId.GAME, true);
            setTimeout(() => {
                manager.openBox(isSkip);
            }, 200);
        }
    };

    const closeLevel = () => {
        RootController.stopLevel();
    };

    const completeBox = () => {
        //attempt to move to the next box
        const boxIndex = BoxManager.currentBoxIndex;

        // check for game complete
        const requiredIndex = BoxManager.requiredCount() - 1;
        const isGameComplete = boxIndex >= requiredIndex;

        if (isGameComplete) {
            GameBorder.hide();
            VideoManager.playOutroVideo();
        } else {
            manager.isInAdvanceBoxMode = true;
            const targetPanelId = edition.disableBoxMenu ? PanelId.MENU : PanelId.BOXES;
            PanelManager.showPanel(targetPanelId, false);
        }
    };

    const openLevelMenu = () => {
        RootController.pauseLevel();
        SoundMgr.pauseMusic();
        show("#levelMenu");
    };

    const closeLevelMenu = () => {
        hide("#levelMenu");
        if (
            PanelManager.currentPanelId === PanelId.GAME &&
            manager.gameEnabled &&
            RootController.isLevelActive()
        ) {
            SoundMgr.resumeMusic();
        }
    };

    const showLevelBackground = () => {
        show("#levelBackground");
    };

    const hideLevelBackground = () => {
        hide("#levelBackground");
    };

    const tapeBox = () => {
        if (manager.isInMenuSelectMode) {
            GameBorder.fadeOut(800, 400);
            SoundMgr.playMusic(MENU_MUSIC_ID);
        }

        Doors.closeBoxAnimation(() => {
            manager.isBoxOpen = false;
            if (manager.isInMenuSelectMode) {
                PanelManager.showPanel(PanelId.MENU, false);
            } else {
                Doors.renderDoors(true, 0);
                PanelManager.showPanel(PanelId.LEVELS, true);
            }
            startSnow();
        });
    };

    const showGameUI = () => {
        hideLevelBackground();
        if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
            show("#bg");
        }
        fadeIn("#gameBtnTray");
        startSnow();
    };

    const closeGameUI = () => {
        stopSnow();
        Doors.renderDoors(false, 1);
        notifyBeginTransition(1000);
        showLevelBackground();
        if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
            hide("#bg");
        }
        fadeOut("#gameBtnTray");
    };

    const openBox = (/** @type {boolean} */ skip = false) => {
        stopSnow();
        const timeout = PanelManager.currentPanelId === PanelId.LEVELS ? 400 : 0;

        //fade out options elements
        fadeOut("#levelScore");
        fadeOut("#levelBack");

        fadeOut("#levelOptions", timeout).then(() => {
            if (manager.isBoxOpen) {
                fadeOut("#levelResults", 800);
                setTimeout(() => {
                    RootController.startLevel(
                        BoxManager.currentBoxIndex + 1,
                        BoxManager.currentLevelIndex
                    );
                    Doors.openDoors(false, () => {
                        showGameUI();
                    });
                }, 400);
            } else {
                Doors.openBoxAnimation(() => {
                    manager.isBoxOpen = true;
                    RootController.startLevel(
                        BoxManager.currentBoxIndex + 1,
                        BoxManager.currentLevelIndex
                    );
                    Doors.openDoors(true, () => {
                        showGameUI();
                    });
                });
            }
        });
    };

    const closeBox = () => {
        stopSnow();
        closeGameUI();

        setTimeout(() => {
            // animating from game to results
            if (!manager.isInLevelSelectMode) {
                if (levelResults) {
                    delay(levelResults, 750).then(() => fadeIn(levelResults, 250));
                }
            }

            Doors.closeDoors(false, () => {
                if (manager.isInLevelSelectMode) {
                    tapeBox();
                } else {
                    Doors.showGradient();
                    setTimeout(() => {
                        runScoreTicker();
                        startSnow();
                    }, 250);
                }
            });
        }, 250);
    };

    // show hide the "behind the scenes" link and the feedback tab when the screen changes size
    const updateDevLink = () => {
        if (width(window) < resolution.uiScaledNumber(1024) + 120 && manager._isDevLinkVisible) {
            fadeOut("#moreLink").then(() => {
                manager._isDevLinkVisible = false;
            });
            fadeOut("#zenbox_tab");
        } else if (
            width(window) > resolution.uiScaledNumber(1024) + 120 &&
            !manager._isDevLinkVisible
        ) {
            fadeIn("#moreLink").then(() => {
                manager._isDevLinkVisible = true;
            });
            fadeIn("#zenbox_tab");
        }
    };

    // we'll only resume when the game is enabled
    //this.gameEnabled = true;

    const pauseGame = () => {
        // make sure the game is active and no transitions are pending
        if (
            PanelManager.currentPanelId === PanelId.GAME &&
            RootController.isLevelActive() &&
            !manager.isTransitionActive
        ) {
            openLevelMenu();
        } else {
            SoundMgr.pauseMusic();
        }
    };

    const resumeGame = () => {
        const isLevelMenuVisible = levelMenu && levelMenu.style.display !== "none";
        if (
            !isLevelMenuVisible &&
            PanelManager.currentPanelId !== PanelId.GAMEMENU &&
            manager.gameEnabled
        ) {
            SoundMgr.resumeMusic();
        }
    };

    // Object management stuff

    const init = () => {
        PanelManager.onShowPanel = (/** @type {number} */ panelId) => manager._onShowPanel(panelId);
    };

    const domReady = () => {
        VideoManager.domReady();
        EasterEggManager.domReady();
        PanelManager.domReady();
        GameBorder.domReady();
        SnowfallOverlay.domReady();

        // pause game / music when the user switches tabs
        //window.addEventListener("blur", _this.pauseGame);

        // when returning to the tab, resume music (except when on game menu - no music there)
        //window.addEventListener("focus", _this.resumeGame);

        const onVisibilityChange = () => {
            if (document.hidden || document.visibilityState === "hidden") {
                pauseGame();
            } else {
                resumeGame();
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        // hide behind the scenes when we update the page
        window.addEventListener("resize", () => {
            updateDevLink();
        });
    };

    const appReady = () => {
        PubSub.subscribe(PubSub.ChannelId.LevelWon, (/** @type {LevelWonInfo} */ info) =>
            manager.onLevelWon(info)
        );

        // Load scores now that JSON data is available
        ScoreManager.load();

        Doors.appReady();
        EasterEggManager.appReady();
        PanelManager.appReady((/** @type {number} */ panelId) =>
            manager._onInitializePanel(panelId)
        );
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
            manager.noMenuStartLevel(QueryStrings.box - 1, QueryStrings.level - 1);
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
            pauseGame();
        });
        PubSub.subscribe(PubSub.ChannelId.EnableGame, () => {
            manager.gameEnabled = true;
            resumeGame();
        });
        PubSub.subscribe(PubSub.ChannelId.DisableGame, () => {
            manager.gameEnabled = false;
            pauseGame();
        });
    };

    // used for debug and in level editor to start a level w/o menus
    const noMenuStartLevel = (/** @type {number} */ boxIndex, /** @type {number} */ levelIndex) => {
        PanelManager.showPanel(PanelId.GAME, true);

        // unfortunate that box manager is zero index for box and 1 based for level
        BoxManager.currentBoxIndex = boxIndex;
        BoxManager.currentLevelIndex = levelIndex + 1;

        SoundMgr.selectRandomGameMusic();
        openBox();
    };

    const openLevelMenuPublic = (/** @type {number} */ boxIndex) => {
        manager.isBoxOpen = false;
        Doors.renderDoors(true, 0);
        PanelManager.showPanel(PanelId.LEVELS);
        GameBorder.setBoxBorder(boxIndex);
    };

    return {
        _notifyBeginTransition: notifyBeginTransition,
        _runScoreTicker: runScoreTicker,
        _openLevel: openLevel,
        openLevel,
        _closeLevel: closeLevel,
        _isLastLevel: isLastLevel,
        _completeBox: completeBox,
        _openLevelMenu: openLevelMenu,
        _closeLevelMenu: closeLevelMenu,
        _showLevelBackground: showLevelBackground,
        _hideLevelBackground: hideLevelBackground,
        tapeBox,
        openBox,
        closeBox,
        showGameUI,
        closeGameUI,
        updateDevLink,
        pauseGame,
        resumeGame,
        init,
        domReady,
        appReady,
        noMenuStartLevel,
        openLevelMenu: openLevelMenuPublic,
    };
}
