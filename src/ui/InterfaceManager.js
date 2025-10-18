import edition from "@/edition";
import resolution from "@/resolution";
import platform from "@/platform";
import ScoreManager from "@/ui/ScoreManager";
import BoxManager from "@/ui/BoxManager";
import PanelId from "@/ui/PanelId";
import PanelManager from "@/ui/PanelManager";
import EasterEggManager from "@/ui/EasterEggManager";
import Text from "@/visual/Text";
import PointerCapture from "@/utils/PointerCapture";
import settings from "@/game/CTRSettings";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import requestAnimationFrame from "@/utils/requestAnimationFrame";
import Easing from "@/ui/Easing";
import QueryStrings from "@/ui/QueryStrings";
import RootController from "@/game/CTRRootController";
import VideoManager from "@/ui/VideoManager";
import PubSub from "@/utils/PubSub";
import BoxType from "@/ui/BoxType";
import Lang from "@/resources/Lang";
import LangId from "@/resources/LangId";
import MenuStringId from "@/resources/MenuStringId";
import Alignment from "@/core/Alignment";
import SocialHelper from "@/ui/SocialHelper";
import GameBorder from "@/ui/GameBorder";
import analytics from "@/analytics";
import Doors from "@/Doors";
import Dialogs from "@/ui/Dialogs";
import dom from "@/utils/dom";
const {
    addClass,
    append,
    delay,
    empty,
    fadeIn,
    fadeOut,
    find,
    getElement,
    hide,
    hover,
    on,
    removeClass,
    setStyle,
    show,
    stopAnimations,
    text,
    toggleClass,
    width,
} = dom;

const isMsieBrowser = /MSIE|Trident/.test(window.navigator.userAgent);

const menuMusicId = edition.menuMusicId || ResourceId.SND_MENU_MUSIC;

class InterfaceManagerClass {
    constructor() {
        // Public properties
        this.useHDVersion = resolution.isHD;
        this.isInLevelSelectMode = false;
        this.isInMenuSelectMode = false;
        this.isInAdvanceBoxMode = false;
        this.isBoxOpen = false;
        this.isTransitionActive = false;
        this.gameEnabled = true;

        // Private properties
        this._MIN_FPS = QueryStrings.minFps || 30;
        this._signedIn = false;
        this._bounceTimeOut = null;
        this._transitionTimeout = null;
        this._resultTopLines = [];
        this._resultBottomLines = [];
        this._currentResultLine = 0;
        this._resultTimeShiftIndex = 0;
        this._isDevLinkVisible = true;

        // Subscribe to sign in/out events
        PubSub.subscribe(PubSub.ChannelId.SignIn, () => {
            this._signedIn = true;
            this._updateSignInControls();
        });
        PubSub.subscribe(PubSub.ChannelId.SignOut, () => {
            this._signedIn = false;
            this._updateSignInControls();
        });
    }

    // ------------------------------------------------------------------------
    // Helper Methods (private)
    // ------------------------------------------------------------------------

    _setImageBigText(selector, menuStringId) {
        return Text.drawBig({
            text: Lang.menuText(menuStringId),
            imgSel: selector,
            scaleToUI: true,
        });
    }

    _updateMiniSoundButton(doToggle, buttonId, msgId) {
        let className;
        let isSoundOn = SoundMgr.soundEnabled;
        let isMusicOn = SoundMgr.musicEnabled;

        if (doToggle) {
            if (isSoundOn && isMusicOn) {
                isSoundOn = true;
                isMusicOn = false;
            } else if (!isSoundOn && !isMusicOn) {
                isSoundOn = true;
                isMusicOn = true;
            } else {
                isSoundOn = false;
                isMusicOn = false;
            }

            // update settings
            SoundMgr.setSoundEnabled(isSoundOn);
            SoundMgr.setMusicEnabled(isMusicOn);
        }

        if (isSoundOn && !isMusicOn) {
            className = "effectsOnly";
        } else if (!isSoundOn && !isMusicOn) {
            className = "noSound";
        } else {
            className = "allSound";
        }

        const allClassNames = "effectsOnly noSound allSound";
        removeClass("#optionSound", allClassNames);
        addClass("#optionSound", className);
        removeClass("#gameSound", allClassNames);
        addClass("#gameSound", className);

        // option panel screen
        setStyle("#soundBtn .options-x", "display", !isSoundOn ? "block" : "none");
        setStyle("#musicBtn .options-x", "display", !isMusicOn ? "block" : "none");

        // get the localized text for the new audio setting
        let text;
        if (!isMusicOn && !isSoundOn) {
            text = Lang.menuText(MenuStringId.EVERYTHING_OFF);
        } else {
            const musicId = isMusicOn ? MenuStringId.MUSIC_ON : MenuStringId.MUSIC_OFF,
                soundId = isSoundOn ? MenuStringId.SOUNDS_ON : MenuStringId.SOUNDS_OFF,
                template = Lang.menuText(MenuStringId.AND_TEMPLATE);
            text = template
                .replace("{0}", Lang.menuText(musicId).toLowerCase())
                .replace("{1}", Lang.menuText(soundId).toLowerCase());
        }

        this._showMiniOptionMessage(msgId, text);
    }

    _showMiniOptionMessage(msgId, messageText, delayDuration) {
        if (msgId != undefined) {
            const showDelay = delayDuration || 500;
            const msg = document.getElementById(msgId);
            if (!msg) {
                return;
            }

            let img = msg.querySelector("img");
            if (!img) {
                img = document.createElement("img");
                msg.appendChild(img);
            }

            Text.drawSmall({
                text: messageText,
                img: img,
                scaleToUI: true,
                alpha: 0.6,
                alignment: Alignment.LEFT,
            });

            stopAnimations(msg);
            fadeIn(msg, 500)
                .then(function () {
                    return delay(msg, showDelay);
                })
                .then(function () {
                    return fadeOut(msg, 750);
                });
        }
    }

    _updateSignInControls() {
        toggleClass("#achievementsBtn", "disabled", !this._signedIn);
        toggleClass("#leaderboardsBtn", "disabled", !this._signedIn);
    }

    _onInitializePanel(panelId) {
        // initialize the MENU panel
        if (panelId == PanelId.MENU) {
            on("#playBtn", "click", () => {
                SoundMgr.playSound(ResourceId.SND_TAP);

                if (analytics.onPlayClicked) {
                    analytics.onPlayClicked();
                }

                VideoManager.playIntroVideo(() => {
                    const firstLevelStars = ScoreManager.getStars(0, 0) || 0;
                    if (firstLevelStars === 0) {
                        // start the first level immediately
                        this.noMenuStartLevel(0, 0);
                    } else {
                        const panelId = edition.disableBoxMenu ? PanelId.LEVELS : PanelId.BOXES;
                        PanelManager.showPanel(panelId, true);
                    }
                });
            });

            on("#optionsBtn", "click", () => {
                SoundMgr.playSound(ResourceId.SND_TAP);
                // see if there is a custom settings panel we should trigger
                if (platform.customOptions) {
                    PubSub.publish(PubSub.ChannelId.ShowOptions);
                } else {
                    PanelManager.showPanel(PanelId.OPTIONS);
                }
            });

            on("#achievementsBtn", "click", () => {
                if (this._signedIn) {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.ACHIEVEMENTS);
                }
            });
            toggleClass("#achievementsBtn", "disabled", !this._signedIn);

            on("#leaderboardsBtn", "click", () => {
                if (this._signedIn) {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.LEADERBOARDS);
                }
            });
            toggleClass("#leaderboardsBtn", "disabled", !this._signedIn);

            // reset popup buttons
            let resetTimer = null;
            on("#resetYesBtn", PointerCapture.startEventName, function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                resetTimer = setTimeout(function () {
                    Dialogs.closePopup();
                    resetTimer = null;

                    settings.clear();

                    //reset scores
                    ScoreManager.resetGame();

                    // lock all the boxes
                    BoxManager.resetLocks();

                    PubSub.publish(PubSub.ChannelId.LoadIntroVideo);
                }, 3000); // wait 3 seconds in case user changes their mind
            });
            on("#resetYesBtn", PointerCapture.endEventName, function () {
                if (resetTimer != null) {
                    clearTimeout(resetTimer);
                }
            });

            // mini options panel

            this._updateMiniSoundButton(false, "optionSound");
            on("#optionSound", "click", () => {
                this._updateMiniSoundButton(true, "optionSound", "optionMsg");
            });

            let hdtoggle;
            if (this.useHDVersion) {
                addClass("#optionHd", "activeResolution");
                addClass("#optionSd", "inActiveResolution");
                addClass("#optionSd", "ctrPointer");
                hover(
                    "#optionSd",
                    () => {
                        this._showMiniOptionMessage(
                            "optionMsg",
                            Lang.menuText(MenuStringId.RELOAD_SD),
                            4000
                        );
                    },
                    function () {
                        const optionMsg = getElement("#optionMsg");
                        if (optionMsg) {
                            stopAnimations(optionMsg);
                            fadeOut(optionMsg, 500);
                        }
                    }
                );
                hdtoggle = "optionSd";
            } else {
                addClass("#optionSd", "activeResolution");
                addClass("#optionHd", "inActiveResolution");
                addClass("#optionHd", "ctrPointer");
                hover(
                    "#optionHd",
                    () => {
                        this._showMiniOptionMessage(
                            "optionMsg",
                            Lang.menuText(MenuStringId.RELOAD_HD),
                            4000
                        );
                    },
                    function () {
                        const optionMsg = getElement("#optionMsg");
                        if (optionMsg) {
                            stopAnimations(optionMsg);
                            fadeOut(optionMsg, 500);
                        }
                    }
                );
                hdtoggle = "optionHd";
            }

            on("#" + hdtoggle, "click", () => {
                settings.setIsHD(!this.useHDVersion);
                window.location.reload(); // refresh the page
            });

            // handle language changes
            PubSub.subscribe(PubSub.ChannelId.LanguageChanged, () => {
                this._setImageBigText("#playBtn img", MenuStringId.PLAY);
                this._setImageBigText("#optionsBtn img", MenuStringId.OPTIONS);
                this._setImageBigText("#resetYesBtn img", MenuStringId.YES);
                this._setImageBigText("#resetNoBtn img", MenuStringId.NO);

                Text.drawBig({
                    text: Lang.menuText(MenuStringId.LEADERBOARDS),
                    imgParentId: "leaderboardsBtn",
                    scale: 0.8 * resolution.UI_TEXT_SCALE,
                });

                Text.drawBig({
                    text: Lang.menuText(MenuStringId.ACHIEVEMENTS),
                    imgParentId: "achievementsBtn",
                    scale: 0.8 * resolution.UI_TEXT_SCALE,
                });
            });
        }

        // initialize the BOXES panel
        else if (panelId == PanelId.BOXES) {
            // handles clicking on the circular back button
            on("#boxBack", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                PanelManager.showPanel(PanelId.MENU);
            });

            const panel = PanelManager.getPanelById(panelId);
            panel.init(InterfaceManager);
        } else if (panelId == PanelId.PASSWORD) {
            on("#boxEnterCodeButton", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                PanelManager.showPanel(PanelId.PASSWORD);
            });

            // handles clicking on the circular back button
            on("#codeBack", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                PanelManager.showPanel(PanelId.BOXES);
            });

            const panel = PanelManager.getPanelById(panelId);
            panel.init(InterfaceManager);
        }

        // initialize the LEVELS panel
        else if (panelId == PanelId.LEVELS) {
            on("#levelBack", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                const panelId = edition.disableBoxMenu ? PanelId.MENU : PanelId.BOXES;
                PanelManager.showPanel(panelId);
            });

            // render the canvas all the way closed
            Doors.renderDoors(true, 0.0);

            const panel = PanelManager.getPanelById(panelId);
            panel.init(InterfaceManager);
        } else if (panelId == PanelId.GAME) {
            on("#gameRestartBtn", "click", () => {
                if (this.isTransitionActive) return;
                SoundMgr.playSound(ResourceId.SND_TAP);
                this._openLevel(BoxManager.currentLevelIndex, true); // is a restart
            });

            on("#gameMenuBtn", "click", () => {
                if (this.isTransitionActive) return;
                SoundMgr.playSound(ResourceId.SND_TAP);
                this._openLevelMenu();
            });
        } else if (panelId == PanelId.GAMEMENU) {
            on("#continueBtn", "click", () => {
                SoundMgr.playSound(ResourceId.SND_TAP);
                this._closeLevelMenu();
                RootController.resumeLevel();
            });

            on("#skipBtn", "click", () => {
                SoundMgr.playSound(ResourceId.SND_TAP);
                this._closeLevelMenu();
                //unlock next level
                if (BoxManager.isNextLevelPlayable()) {
                    ScoreManager.setStars(
                        BoxManager.currentBoxIndex,
                        BoxManager.currentLevelIndex,
                        0
                    );
                    this._openLevel(BoxManager.currentLevelIndex + 1, false, true);
                } else {
                    hide("#gameBtnTray");
                    this._completeBox();
                }
            });

            on("#selectBtn", "click", () => {
                SoundMgr.playSound(ResourceId.SND_TAP);
                this._closeLevelMenu();
                this._closeLevel();
                this.isInLevelSelectMode = true;
                this.isInMenuSelectMode = false;
                this.closeBox();
            });

            on("#menuBtn", "click", () => {
                SoundMgr.playSound(ResourceId.SND_TAP);
                this._closeLevelMenu();
                this._closeLevel();
                this.isInLevelSelectMode = true;
                this.isInMenuSelectMode = true;
                this.closeBox();
            });

            // mini options panel
            this._updateMiniSoundButton(false, "gameSound");
            on("#gameSound", "click", () => {
                this._updateMiniSoundButton(true, "gameSound", "gameMsg");
            });

            // language changes
            PubSub.subscribe(PubSub.ChannelId.LanguageChanged, () => {
                this._setImageBigText("#continueBtn img", MenuStringId.CONTINUE);
                this._setImageBigText("#skipBtn img", MenuStringId.SKIP_LEVEL);
                this._setImageBigText("#selectBtn img", MenuStringId.LEVEL_SELECT);
                this._setImageBigText("#menuBtn img", MenuStringId.MAIN_MENU);
            });
        } else if (panelId == PanelId.LEVELCOMPLETE) {
            on("#nextBtn", "click", () => {
                if (this.isTransitionActive) return;
                this._notifyBeginTransition(1000, "next level");
                SoundMgr.playSound(ResourceId.SND_TAP);
                //is there another level in this box?
                if (BoxManager.isNextLevelPlayable()) {
                    this._openLevel(BoxManager.currentLevelIndex + 1);
                } else {
                    this._completeBox();
                }
            });

            on("#replayBtn", "click", () => {
                if (this.isTransitionActive) return;
                this._notifyBeginTransition(1000, "replay");
                SoundMgr.playSound(ResourceId.SND_TAP);
                this._openLevel(BoxManager.currentLevelIndex);
            });

            on("#lrMenuBtn", "click", () => {
                if (this.isTransitionActive) return;
                this._notifyBeginTransition(1000, "level menu");
                SoundMgr.playSound(ResourceId.SND_TAP);
                this.isInLevelSelectMode = true;
                this.isInMenuSelectMode = false;
                this.tapeBox();
            });

            // handle language changes
            PubSub.subscribe(PubSub.ChannelId.LanguageChanged, () => {
                this._setImageBigText("#nextBtn img", MenuStringId.NEXT);
                this._setImageBigText("#replayBtn img", MenuStringId.REPLAY);
                this._setImageBigText("#lrMenuBtn img", MenuStringId.MENU);
                Text.drawSmall({
                    text: Lang.menuText(MenuStringId.FINAL_SCORE),
                    imgId: "resultTickerMessage",
                    scaleToUI: true,
                    canvas: true,
                });
            });
        } else if (panelId == PanelId.GAMECOMPLETE) {
            on("#gameCompleteBack", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                PanelManager.showPanel(PanelId.MENU);
                GameBorder.hide();
            });

            on("#finalShareBtn", "click", function () {
                const possibleStars = BoxManager.possibleStars(),
                    totalStars = ScoreManager.totalStars();

                SocialHelper.postToFeed(
                    platform.getGameCompleteShareText(totalStars, possibleStars),
                    SocialHelper.siteDescription,
                    platform.getScoreImageBaseUrl() + "score" + totalStars + ".png",
                    function () {
                        return true;
                    }
                );
            });
        } else if (panelId == PanelId.OPTIONS) {
            // sound effects
            const updateSoundOption = platform.updateSoundOption,
                soundBtn = document.getElementById("soundBtn"),
                onSoundButtonChange = () => {
                    const isSoundOn = !settings.getSoundEnabled();
                    SoundMgr.setSoundEnabled(isSoundOn);
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    updateSoundOption(soundBtn, isSoundOn);
                    this._updateMiniSoundButton(false, "gameSound");
                    this._updateMiniSoundButton(false, "optionSound");
                };
            platform.setSoundButtonChange(soundBtn, onSoundButtonChange);

            // game music
            const updateMusicOption = platform.updateMusicOption,
                musicBtn = document.getElementById("musicBtn"),
                onMusicButtonChange = () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    const isMusicOn = !settings.getMusicEnabled();
                    SoundMgr.setMusicEnabled(isMusicOn);
                    updateMusicOption(musicBtn, isMusicOn);
                    this._updateMiniSoundButton(false, "gameSound");
                    this._updateMiniSoundButton(false, "optionSound");
                };
            platform.setMusicButtonChange(musicBtn, onMusicButtonChange);

            // change language
            const updateLangOption = platform.updateLangSetting;
            platform.setLangOptionClick(function (newLangId) {
                SoundMgr.playSound(ResourceId.SND_TAP);

                // if not specified we'll assume that we should advance to
                // the next language (so we cycle through as user clicks)
                if (newLangId == null) {
                    const currentIndex = edition.languages.indexOf(settings.getLangId());
                    newLangId = edition.languages[(currentIndex + 1) % edition.languages.length];
                }

                settings.setLangId(newLangId);

                // send the notification that language has changed
                PubSub.publish(PubSub.ChannelId.LanguageChanged);
            });

            // click or drag to cut
            const updateCutOption = platform.updateCutSetting;
            platform.setCutOptionClick(function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                const isClickToCut = !settings.getClickToCut();
                settings.setClickToCut(isClickToCut);
                updateCutOption(isClickToCut);
            });

            // reset button
            const resetBtn = document.getElementById("resetBtn");
            resetBtn.addEventListener("click", function () {
                // create localized text images
                const resetTextImg = Text.drawBig({
                        text: Lang.menuText(MenuStringId.RESET_TEXT),
                        alignment: Alignment.CENTER,

                        // we use canvas scale because text is draw at game scale and
                        // scaled to UI dimensions by setting the img width & height
                        width: 1250 * resolution.CANVAS_SCALE,
                        scaleToUI: true,
                    }),
                    resetHoldYesImg = Text.drawSmall({
                        text: Lang.menuText(MenuStringId.RESET_HOLD_YES),
                        scaleToUI: true,
                        // width: resolution.uiScaledNumber(550),
                    });

                // clear existing text image and append to placeholder divs
                const resetTextContainer = getElement("#resetText");
                if (resetTextContainer) {
                    empty(resetTextContainer);
                    append(resetTextContainer, resetTextImg);
                }

                const resetHoldYesContainer = getElement("#resetHoldYes");
                if (resetHoldYesContainer) {
                    empty(resetHoldYesContainer);
                    append(resetHoldYesContainer, resetHoldYesImg);
                }

                SoundMgr.playSound(ResourceId.SND_TAP);
                Dialogs.showPopup("resetGame");
            });

            document.getElementById("optionsBack").addEventListener("click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                PanelManager.showPanel(PanelId.MENU);
            });

            // hide the language if not supported by the edition
            platform.toggleLangUI(!edition.disableLanguageOption);

            // update options menu when the language changes
            const refreshOptionsButtons = () => {
                this._setImageBigText("#optionsTitle img", MenuStringId.OPTIONS);
                updateSoundOption(soundBtn, settings.getSoundEnabled());
                updateMusicOption(musicBtn, settings.getMusicEnabled());
                updateLangOption();
                updateCutOption(settings.getClickToCut());
                platform.setResetText(resetBtn, Lang.menuText(MenuStringId.RESET));

                // apply a lang-{code} class to a language layer for css styles
                const langId = settings.getLangId();
                // !LANG
                const langElement = getElement("#lang");
                if (langElement) {
                    removeClass(
                        langElement,
                        "lang-system lang-en lang-de lang-ru lang-fr lang-ca lang-br lang-es lang-it lang-nl lang-ko lang-ja lang-zh"
                    );
                    addClass(langElement, "lang-" + LangId.toCountryCode(langId));

                    if (langId >= 4 && langId <= 9) {
                        addClass(langElement, "lang-system");
                    }
                }
            };

            PubSub.subscribe(PubSub.ChannelId.LanguageChanged, refreshOptionsButtons);
            PubSub.subscribe(PubSub.ChannelId.ShowOptionsPage, refreshOptionsButtons);
        } else if (panelId === PanelId.LEADERBOARDS) {
            on("#leaderboardBack", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                PanelManager.showPanel(PanelId.MENU);
            });
        } else if (panelId === PanelId.ACHIEVEMENTS) {
            on("#achievementsBack", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                PanelManager.showPanel(PanelId.MENU);
            });
        }
        //else if (panelId == PanelId.CREDITS) { }
    }

    // ------------------------------------------------------------------------
    // Show Panels (called for each panel when it's shown)
    // ------------------------------------------------------------------------

    _onShowPanel(panelId) {
        const panel = PanelManager.getPanelById(panelId);

        if (panelId == PanelId.MENU || panelId == PanelId.BOXES || panelId == PanelId.OPTIONS) {
            GameBorder.fadeOut(300);
        } else if (panelId !== PanelId.LEVELS) {
            GameBorder.show();
        }

        // make sure the pause level panel is closed
        if (panelId !== PanelId.GAMEMENU) {
            this._closeLevelMenu();
        }

        // make sure the menu music is started on main menu and level selection
        // which are the entry points from the game.
        if (panelId === PanelId.MENU || panelId === PanelId.LEVELS) {
            SoundMgr.playMusic(menuMusicId);
        }

        const boxPanel = PanelManager.getPanelById(PanelId.BOXES);
        if (panelId == PanelId.BOXES) {
            BoxManager.updateBoxLocks();
            ScoreManager.updateTotalScoreText();
            boxPanel.onShow();

            if (this.isInAdvanceBoxMode) {
                this.isInAdvanceBoxMode = false;
                setTimeout(function () {
                    hide("#levelResults");
                    boxPanel.slideToNextBox();

                    // if next level is not playable, show the purchase prompt
                    if (!BoxManager.isNextLevelPlayable()) {
                        Dialogs.showPayDialog();
                    }
                }, 800);
            } else {
                clearTimeout(this._bounceTimeOut);
                this._bounceTimeOut = setTimeout(function () {
                    boxPanel.bounceCurrentBox();
                }, 300);
            }
        } else {
            boxPanel.onHide();
        }

        const codePanel = PanelManager.getPanelById(PanelId.PASSWORD);
        if (codePanel) {
            if (panelId === PanelId.PASSWORD) {
                codePanel.onShow();
            } else {
                codePanel.onHide();
            }
        }

        if (panelId == PanelId.LEVELS) {
            Doors.renderDoors(true, 0);
            panel.onShow();
        } else if (panelId == PanelId.GAME) {
            this._updateMiniSoundButton(false, "optionSound");
        }
        //else if (panelId == PanelId.GAMEMENU) { }
        //else if (panelId == PanelId.LEVELCOMPLETE) { }
        else if (panelId === PanelId.GAMECOMPLETE) {
            hide("#levelResults");

            GameBorder.setGameCompleteBorder();

            const gameWonText = Lang.menuText(MenuStringId.GAME_FINISHED_TEXT).replace(
                "%d",
                ScoreManager.totalStars()
            );
            Text.drawBig({
                text: gameWonText,
                imgSel: "#finalScore img",
                scale: 0.8 * resolution.UI_TEXT_SCALE,
                alignment: 1,
            });

            const congratsElement = getElement("#congrats");
            if (congratsElement) {
                empty(congratsElement);
                append(
                    congratsElement,
                    Text.drawBig({
                        text: Lang.menuText(MenuStringId.CONGRATULATIONS),
                        scale: 1.2 * resolution.UI_TEXT_SCALE,
                    })
                );
            }

            Text.drawBig({
                text: Lang.menuText(MenuStringId.SHARE_ELLIPSIS),
                imgSel: "#finalShareBtn img",
                scale: 0.8 * resolution.UI_TEXT_SCALE,
                maxScaleWidth: resolution.uiScaledNumber(130),
            });
            Text.drawBig({
                text: Lang.menuText(MenuStringId.MORE_CTR_FUN),
                imgSel: "#finalFunBtn img",
                scale: 0.8 * resolution.UI_TEXT_SCALE,
                maxScaleWidth: resolution.uiScaledNumber(310),
            });
        } else if (panelId == PanelId.OPTIONS) {
            PubSub.publish(PubSub.ChannelId.ShowOptionsPage);
        } else if (panelId == PanelId.ACHIEVEMENTS) {
            PubSub.publish(PubSub.ChannelId.UpdateCandyScroller);
        } else if (panelId == PanelId.LEADERBOARDS) {
            PubSub.publish(PubSub.ChannelId.UpdateCandyScroller);
        }
        //else if (panelId == PanelId.CREDITS) { }
    }

    // ------------------------------------------------------------------------
    // UI methods
    // ------------------------------------------------------------------------

    _notifyBeginTransition(timeout, name) {
        this.isTransitionActive = true;
        if (this._transitionTimeout != null) clearTimeout(this._transitionTimeout);
        this._transitionTimeout = setTimeout(() => {
            this.isTransitionActive = false;
            this._transitionTimeout = null;
        }, timeout);
    }

    _runScoreTicker() {
        text("#resultScore", this._resultBottomLines[this._currentResultLine]);
        this._currentResultLine++;
        if (this._currentResultLine < this._resultTopLines.length) {
            if (this._currentResultLine < this._resultTimeShiftIndex) {
                setTimeout(() => {
                    this._runScoreTicker();
                }, 10);
            } else {
                setTimeout(() => {
                    this._runScoreTicker();
                }, 167);
            }
        }
    }

    // play the level
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

    openLevel(level, isRestart, isSkip) {
        this._openLevel(level, isRestart, isSkip);
    }

    _closeLevel() {
        RootController.stopLevel();
    }

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

        return true;
    }

    _completeBox() {
        //attempt to move to the next box
        const boxIndex = BoxManager.currentBoxIndex;

        // check for game complete
        const requiredIndex = BoxManager.requiredCount() - 1,
            isGameComplete = boxIndex >= requiredIndex;

        if (isGameComplete) {
            GameBorder.hide();
            VideoManager.playOutroVideo();
        } else {
            this.isInAdvanceBoxMode = true;
            const panelId = edition.disableBoxMenu ? PanelId.MENU : PanelId.BOXES;
            PanelManager.showPanel(panelId, false);
        }
    }

    _openLevelMenu() {
        RootController.pauseLevel();
        // Pause music when opening the game menu
        SoundMgr.pauseMusic();
        show("#levelMenu");
    }

    _closeLevelMenu() {
        hide("#levelMenu");
        // Resume music when closing the game menu only if:
        // 1. We're currently in the game (not menu or level select)
        // 2. Game is enabled
        // 3. A level is currently active
        if (
            PanelManager.currentPanelId === PanelId.GAME &&
            this.gameEnabled &&
            RootController.isLevelActive()
        ) {
            SoundMgr.resumeMusic();
        }
    }

    _showLevelBackground() {
        show("#levelBackground");
    }

    _hideLevelBackground() {
        hide("#levelBackground");
    }

    // ------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------

    tapeBox() {
        if (this.isInMenuSelectMode) {
            GameBorder.fadeOut(800, 400);
            SoundMgr.playMusic(menuMusicId);
        }

        Doors.closeBoxAnimation(() => {
            this.isBoxOpen = false;
            if (this.isInMenuSelectMode) {
                PanelManager.showPanel(PanelId.MENU, false);
            } else {
                Doors.renderDoors(true, 0);
                PanelManager.showPanel(PanelId.LEVELS, true);
            }
        });
    }

    openBox(skip) {
        const timeout = PanelManager.currentPanelId == PanelId.LEVELS ? 400 : 0;

        //fade out options elements
        fadeOut("#levelScore");
        fadeOut("#levelBack");

        fadeOut("#levelOptions", timeout).then(() => {
            if (this.isBoxOpen) {
                fadeOut("#levelResults", 800);

                setTimeout(() => {
                    //if (skip) {
                    //    RootController.startLevel(BoxManager.currentBoxIndex + 1, BoxManager.currentLevelIndex);
                    //    this.showGameUI();
                    //} else {
                    RootController.startLevel(
                        BoxManager.currentBoxIndex + 1,
                        BoxManager.currentLevelIndex
                    );
                    Doors.openDoors(false, () => {
                        this.showGameUI();
                    });
                    //}
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
        }); // end fadeOut
    }

    closeBox() {
        this.closeGameUI();

        setTimeout(() => {
            // animating from game to results
            if (!this.isInLevelSelectMode) {
                const levelResults = getElement("#levelResults");
                if (levelResults) {
                    delay(levelResults, 750).then(function () {
                        return fadeIn(levelResults, 250);
                    });
                }
            }

            // close the doors
            Doors.closeDoors(false, () => {
                if (this.isInLevelSelectMode) {
                    this.tapeBox();
                } else {
                    Doors.showGradient();
                    setTimeout(() => {
                        this._runScoreTicker();
                    }, 250);
                }
            });
        }, 250);
    }

    showGameUI() {
        this._hideLevelBackground();
        if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
            show("#bg");
        }
        fadeIn("#gameBtnTray");
    }

    closeGameUI() {
        Doors.renderDoors(false, 1);
        this._notifyBeginTransition(1000, "close game ui");
        this._showLevelBackground();
        if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
            hide("#bg");
        }
        fadeOut("#gameBtnTray");
    }

    onLevelWon(info) {
        const stars = info.stars,
            score = info.score,
            levelTime = info.time;

        //show level results
        let resultStatusText;
        let currentPoints = 0;
        const index = 0;
        const totalStarPoints = stars * 1000;
        const currentTime = 1;
        const timeSlicePoints = Math.round((score - stars * 1000) / levelTime);

        switch (stars) {
            case 3:
                removeClass("#resultStar1", "starEmpty");
                addClass("#resultStar1", "star");
                removeClass("#resultStar2", "starEmpty");
                addClass("#resultStar2", "star");
                removeClass("#resultStar3", "starEmpty");
                addClass("#resultStar3", "star");
                resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED4);
                break;
            case 2:
                removeClass("#resultStar1", "starEmpty");
                addClass("#resultStar1", "star");
                removeClass("#resultStar2", "starEmpty");
                addClass("#resultStar2", "star");
                removeClass("#resultStar3", "star");
                addClass("#resultStar3", "starEmpty");
                resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED3);
                break;
            case 1:
                removeClass("#resultStar1", "starEmpty");
                addClass("#resultStar1", "star");
                removeClass("#resultStar2", "star");
                addClass("#resultStar2", "starEmpty");
                removeClass("#resultStar3", "star");
                addClass("#resultStar3", "starEmpty");
                resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED2);
                break;
            default:
                removeClass("#resultStar1", "star");
                addClass("#resultStar1", "starEmpty");
                removeClass("#resultStar2", "star");
                addClass("#resultStar2", "starEmpty");
                removeClass("#resultStar3", "star");
                addClass("#resultStar3", "starEmpty");
                resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED1);
                break;
        }
        Text.drawBig({
            text: resultStatusText,
            imgSel: "#resultStatus canvas",
            scaleToUI: true,
            canvas: true,
        });

        // set stuff up
        const valdiv = getElement("#resultTickerValue");
        const lbldiv = getElement("#resultTickerLabel");
        const resdiv = getElement("#resultScore");
        const stamp = getElement("#resultImproved");
        const msgdiv = getElement("#resultTickerMessage");

        hide(valdiv);
        hide(lbldiv);
        if (resdiv) {
            empty(resdiv);
            hide(resdiv);
        }
        hide(stamp);
        hide(msgdiv);

        // HELPER FUNCTIONS

        const secondsToMin = function (sec) {
            const m = (sec / 60) | 0,
                s = Math.round(sec % 60);
            return m + ":" + (s < 10 ? "0" + s : s);
        };

        const doStarCountdown = function (from, callback) {
            let countDownPoints = from;
            const duration = 1000;
            let lastRender = Date.now();
            const requestAnimationFrame = window["requestAnimationFrame"];

            const renderCount = function () {
                const now = Date.now(),
                    timeDelta = now - lastRender,
                    pointDelta = Math.min(
                        Math.round((from * timeDelta) / duration),
                        countDownPoints
                    );

                lastRender = now;

                countDownPoints -= pointDelta;
                currentPoints += pointDelta;
                if (countDownPoints <= 0) {
                    countDownPoints = 0;
                    currentPoints = from;
                    fadeOut(lbldiv, 400);
                    fadeOut(valdiv, 400).then(callback);
                } else {
                    requestAnimationFrame(renderCount);
                }

                Text.drawSmall({
                    text: countDownPoints,
                    img: valdiv,
                    scaleToUI: true,
                    canvas: true,
                });
                Text.drawBigNumbers({
                    text: currentPoints,
                    imgParentId: "resultScore",
                    scaleToUI: true,
                    canvas: true,
                });
            };

            renderCount();
        };

        const doTimeCountdown = function (fromsec, frompoints, callback) {
            const finalPoints = currentPoints + frompoints;
            let countDownSecs = fromsec;
            // between 1 and 2 secs depending on time
            const duration = Math.max(1000, 2000 - fromsec * 50);
            let lastRender = Date.now();
            const requestAnimationFrame = window["requestAnimationFrame"];

            const renderScore = function () {
                const now = Date.now(),
                    percentElapsed = (now - lastRender) / duration;

                lastRender = now;
                currentPoints += Math.round(frompoints * percentElapsed);

                countDownSecs -= fromsec * percentElapsed;
                if (countDownSecs <= 0) {
                    countDownSecs = 0;
                    currentPoints = finalPoints;
                    fadeOut(lbldiv, 400);
                    fadeOut(valdiv, 400).then(callback);
                } else {
                    requestAnimationFrame(renderScore);
                }

                Text.drawSmall({
                    text: secondsToMin(countDownSecs),
                    img: valdiv,
                    scaleToUI: true,
                    canvas: true,
                });
                Text.drawBigNumbers({
                    text: currentPoints,
                    imgParentId: "resultScore",
                    scaleToUI: true,
                    canvas: true,
                });
            };

            renderScore();
        };

        // ANIMATION

        // set up the star bonus countdown
        Text.drawSmall({
            text: Lang.menuText(MenuStringId.STAR_BONUS),
            img: lbldiv,
            scaleToUI: true,
            canvas: true,
        });
        Text.drawSmall({
            text: totalStarPoints,
            img: valdiv,
            scaleToUI: true,
            canvas: true,
        });
        if (resdiv) {
            resdiv.querySelectorAll("img").forEach(function (node) {
                node.remove();
            });
            resdiv.querySelectorAll("canvas").forEach(function (node) {
                node.remove();
            });
        }

        // run the animation sequence
        setTimeout(function () {
            fadeIn(lbldiv, 300);
            fadeIn(valdiv, 300);
            fadeIn(resdiv, 300).then(function () {
                doStarCountdown(totalStarPoints, function () {
                    Text.drawSmall({
                        text: Lang.menuText(MenuStringId.TIME),
                        img: lbldiv,
                        scaleToUI: true,
                        canvas: true,
                    });
                    fadeIn(lbldiv, 300);
                    Text.drawSmall({
                        text: secondsToMin(Math.ceil(levelTime)),
                        img: valdiv,
                        scaleToUI: true,
                        canvas: true,
                    });
                    fadeIn(valdiv, 300).then(function () {
                        doTimeCountdown(Math.ceil(levelTime), score - currentPoints, function () {
                            fadeIn(msgdiv, 300);
                            // show the improved result stamp
                            if (prevScore != null && prevScore > 0 && score > prevScore) {
                                if (isMsieBrowser) {
                                    show(stamp);
                                } else if (stamp) {
                                    stamp.style.display = "block";
                                    stamp.style.transform = "scale(2.5)";
                                    stamp.style.opacity = "0";
                                    stamp.style.transition = "none";
                                    requestAnimationFrame(function () {
                                        stamp.style.transition =
                                            "transform 600ms ease-in, opacity 600ms ease-in";
                                        stamp.style.transform = "scale(1)";
                                        stamp.style.opacity = "1";
                                        setTimeout(function () {
                                            stamp.style.transition = "";
                                        }, 600);
                                    });
                                }
                            }
                        });
                    });
                });
            });
        }, 1000);

        // TODO: right now boxIndex is zero based and levelIndex starts at 1?
        const boxIndex = BoxManager.currentBoxIndex,
            levelIndex = BoxManager.currentLevelIndex;

        // save the prev score
        const prevScore = ScoreManager.getScore(boxIndex, levelIndex - 1);

        // Update score of the current level if there is a best result
        ScoreManager.setScore(boxIndex, levelIndex - 1, score);
        ScoreManager.setStars(boxIndex, levelIndex - 1, stars);

        // unlock next level
        if (ScoreManager.levelCount(boxIndex) > levelIndex && BoxManager.isNextLevelPlayable()) {
            ScoreManager.setStars(boxIndex, levelIndex, 0);
        }

        this.isInLevelSelectMode = false;
        this.closeBox();

        // events that occur after completing the first level
        if (boxIndex === 0 && levelIndex === 1) {
            if (analytics.onFirstLevelComplete) {
                analytics.onFirstLevelComplete(info.fps);
            }

            // tell the user if the fps was low on the first level
            if (info.fps < this._MIN_FPS && !platform.disableSlowWarning) {
                // delay the popup to allow the score screen to finish
                setTimeout(function () {
                    Dialogs.showSlowComputerPopup();
                }, 3000);
            }

            VideoManager.removeIntroVideo();
        }
    }

    // show hide the "behind the scenes" link and the feedback tab when the screen changes size
    updateDevLink() {
        if (width(window) < resolution.uiScaledNumber(1024) + 120 && this._isDevLinkVisible) {
            fadeOut("#moreLink").then(() => {
                this._isDevLinkVisible = false;
            });
            fadeOut("#zenbox_tab");
        } else if (width(window) > resolution.uiScaledNumber(1024) + 120 && !this._isDevLinkVisible) {
            fadeIn("#moreLink").then(() => {
                this._isDevLinkVisible = true;
            });
            fadeIn("#zenbox_tab");
        }
    }

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

    resumeGame() {
        // Don't resume music if:
        // 1. Game menu (pause menu) is visible
        // 2. Current panel is the standalone game menu panel
        // 3. Game is disabled
        const isLevelMenuVisible =
            getElement("#levelMenu") && getElement("#levelMenu").style.display !== "none";

        if (
            !isLevelMenuVisible &&
            PanelManager.currentPanelId !== PanelId.GAMEMENU &&
            this.gameEnabled
        ) {
            SoundMgr.resumeMusic();
        }
    }

    // ------------------------------------------------------------------------
    // Object management stuff
    // ------------------------------------------------------------------------

    init() {
        ScoreManager.load();
        PanelManager.onShowPanel = (panelId) => this._onShowPanel(panelId);
    }

    domReady() {
        VideoManager.domReady();
        EasterEggManager.domReady();
        PanelManager.domReady();
        GameBorder.domReady();

        // pause game / music when the user switches tabs
        //window.addEventListener("blur", this.pauseGame);

        // when returning to the tab, resume music (except when on game menu - no music there)
        //window.addEventListener("focus", this.resumeGame);

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

    appReady() {
        PubSub.subscribe(PubSub.ChannelId.LevelWon, (info) => this.onLevelWon(info));

        Doors.appReady();
        EasterEggManager.appReady();
        PanelManager.appReady((panelId) => this._onInitializePanel(panelId));
        BoxManager.appReady();

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

    // used for debug and in level editor to start a level w/o menus
    noMenuStartLevel(boxIndex, levelIndex) {
        PanelManager.showPanel(PanelId.GAME, true);

        // unfortunate that box manager is zero index for box and 1 based for level
        BoxManager.currentBoxIndex = boxIndex;
        BoxManager.currentLevelIndex = levelIndex + 1;

        SoundMgr.selectRandomGameMusic();
        this.openBox();
    }

    openLevelMenu(boxIndex) {
        this.isBoxOpen = false;
        Doors.renderDoors(true, 0);
        PanelManager.showPanel(PanelId.LEVELS);
        GameBorder.setBoxBorder(boxIndex);
    }
}

const InterfaceManager = new InterfaceManagerClass();

export default InterfaceManager;
