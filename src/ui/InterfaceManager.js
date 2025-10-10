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

var InterfaceManager = new (function () {
    // ------------------------------------------------------------------------
    // Locals Variables
    // ------------------------------------------------------------------------

    const _this = this;
    this.useHDVersion = resolution.isHD;

    this.isInLevelSelectMode = false;
    this.isInMenuSelectMode = false;
    this.isInAdvanceBoxMode = false;
    this.isBoxOpen = false;
    this.isTransitionActive = false;

    // warn the user if the frame rate is low after the first level
    const MIN_FPS = QueryStrings.minFps || 30;

    // sets scaled menu text for the image specified by the selector query
    const setImageBigText = function (selector, menuStringId) {
        return Text.drawBig({
            text: Lang.menuText(menuStringId),
            imgSel: selector,
            scaleToUI: true,
        });
    };

    // ------------------------------------------------------------------------
    // Initialize Panels (called once for each panel)
    // ------------------------------------------------------------------------

    const updateMiniSoundButton = function (doToggle, buttonId, msgId) {
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

        showMiniOptionMessage(msgId, text);
    };

    var showMiniOptionMessage = function (msgId, messageText, delayDuration) {
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
    };

    // only enable achievements and leaderboard for signed-in users
    let signedIn = false,
        updateSignInControls = function () {
            toggleClass("#achievementsBtn", "disabled", !signedIn);
            toggleClass("#leaderboardsBtn", "disabled", !signedIn);
        };
    PubSub.subscribe(PubSub.ChannelId.SignIn, function () {
        signedIn = true;
        updateSignInControls();
    });
    PubSub.subscribe(PubSub.ChannelId.SignOut, function () {
        signedIn = false;
        updateSignInControls();
    });

    const onInitializePanel = function (panelId) {
        // initialize the MENU panel
        if (panelId == PanelId.MENU) {
            on("#playBtn", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);

                if (analytics.onPlayClicked) {
                    analytics.onPlayClicked();
                }

                VideoManager.playIntroVideo(function () {
                    const firstLevelStars = ScoreManager.getStars(0, 0) || 0;
                    if (firstLevelStars === 0) {
                        // start the first level immediately
                        _this.noMenuStartLevel(0, 0);
                    } else {
                        const panelId = edition.disableBoxMenu ? PanelId.LEVELS : PanelId.BOXES;
                        PanelManager.showPanel(panelId, true);
                    }
                });
            });

            on("#optionsBtn", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                // see if there is a custom settings panel we should trigger
                if (platform.customOptions) {
                    PubSub.publish(PubSub.ChannelId.ShowOptions);
                } else {
                    PanelManager.showPanel(PanelId.OPTIONS);
                }
            });

            on("#achievementsBtn", "click", function () {
                if (signedIn) {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.ACHIEVEMENTS);
                }
            });
            toggleClass("#achievementsBtn", "disabled", !signedIn);

            on("#leaderboardsBtn", "click", function () {
                if (signedIn) {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.LEADERBOARDS);
                }
            });
            toggleClass("#leaderboardsBtn", "disabled", !signedIn);

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

            updateMiniSoundButton(false, "optionSound");
            on("#optionSound", "click", function () {
                updateMiniSoundButton(true, "optionSound", "optionMsg");
            });

            let hdtoggle;
            if (_this.useHDVersion) {
                addClass("#optionHd", "activeResolution");
                addClass("#optionSd", "inActiveResolution");
                addClass("#optionSd", "ctrPointer");
                hover(
                    "#optionSd",
                    function () {
                        showMiniOptionMessage(
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
                    function () {
                        showMiniOptionMessage(
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

            on("#" + hdtoggle, "click", function () {
                settings.setIsHD(!_this.useHDVersion);
                window.location.reload(); // refresh the page
            });

            // handle language changes
            PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
                setImageBigText("#playBtn img", MenuStringId.PLAY);
                setImageBigText("#optionsBtn img", MenuStringId.OPTIONS);
                setImageBigText("#resetYesBtn img", MenuStringId.YES);
                setImageBigText("#resetNoBtn img", MenuStringId.NO);

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

            var panel = PanelManager.getPanelById(panelId);
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

            var panel = PanelManager.getPanelById(panelId);
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

            var panel = PanelManager.getPanelById(panelId);
            panel.init(InterfaceManager);
        } else if (panelId == PanelId.GAME) {
            on("#gameRestartBtn", "click", function () {
                if (_this.isTransitionActive) return;
                SoundMgr.playSound(ResourceId.SND_TAP);
                openLevel(BoxManager.currentLevelIndex, true); // is a restart
            });

            on("#gameMenuBtn", "click", function () {
                if (_this.isTransitionActive) return;
                SoundMgr.playSound(ResourceId.SND_TAP);
                openLevelMenu();
            });
        } else if (panelId == PanelId.GAMEMENU) {
            on("#continueBtn", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                closeLevelMenu();
                RootController.resumeLevel();
            });

            on("#skipBtn", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                closeLevelMenu();
                //unlock next level
                if (BoxManager.isNextLevelPlayable()) {
                    ScoreManager.setStars(
                        BoxManager.currentBoxIndex,
                        BoxManager.currentLevelIndex,
                        0
                    );
                    openLevel(BoxManager.currentLevelIndex + 1, false, true);
                } else {
                    hide("#gameBtnTray");
                    completeBox();
                }
            });

            on("#selectBtn", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                closeLevelMenu();
                closeLevel();
                _this.isInLevelSelectMode = true;
                _this.isInMenuSelectMode = false;
                _this.closeBox();
            });

            on("#menuBtn", "click", function () {
                SoundMgr.playSound(ResourceId.SND_TAP);
                closeLevelMenu();
                closeLevel();
                _this.isInLevelSelectMode = true;
                _this.isInMenuSelectMode = true;
                _this.closeBox();
            });

            // mini options panel
            updateMiniSoundButton(false, "gameSound");
            on("#gameSound", "click", function () {
                updateMiniSoundButton(true, "gameSound", "gameMsg");
            });

            // language changes
            PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
                setImageBigText("#continueBtn img", MenuStringId.CONTINUE);
                setImageBigText("#skipBtn img", MenuStringId.SKIP_LEVEL);
                setImageBigText("#selectBtn img", MenuStringId.LEVEL_SELECT);
                setImageBigText("#menuBtn img", MenuStringId.MAIN_MENU);
            });
        } else if (panelId == PanelId.LEVELCOMPLETE) {
            on("#nextBtn", "click", function () {
                if (_this.isTransitionActive) return;
                notifyBeginTransition(1000, "next level");
                SoundMgr.playSound(ResourceId.SND_TAP);
                //is there another level in this box?
                if (BoxManager.isNextLevelPlayable()) {
                    openLevel(BoxManager.currentLevelIndex + 1);
                } else {
                    completeBox();
                }
            });

            on("#replayBtn", "click", function () {
                if (_this.isTransitionActive) return;
                notifyBeginTransition(1000, "replay");
                SoundMgr.playSound(ResourceId.SND_TAP);
                openLevel(BoxManager.currentLevelIndex);
            });

            on("#lrMenuBtn", "click", function () {
                if (_this.isTransitionActive) return;
                notifyBeginTransition(1000, "level menu");
                SoundMgr.playSound(ResourceId.SND_TAP);
                _this.isInLevelSelectMode = true;
                _this.isInMenuSelectMode = false;
                _this.tapeBox();
            });

            // handle language changes
            PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
                setImageBigText("#nextBtn img", MenuStringId.NEXT);
                setImageBigText("#replayBtn img", MenuStringId.REPLAY);
                setImageBigText("#lrMenuBtn img", MenuStringId.MENU);
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
                onSoundButtonChange = function () {
                    const isSoundOn = !settings.getSoundEnabled();
                    SoundMgr.setSoundEnabled(isSoundOn);
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    updateSoundOption(soundBtn, isSoundOn);
                    updateMiniSoundButton(false, "gameSound");
                    updateMiniSoundButton(false, "optionSound");
                };
            platform.setSoundButtonChange(soundBtn, onSoundButtonChange);

            // game music
            const updateMusicOption = platform.updateMusicOption,
                musicBtn = document.getElementById("musicBtn"),
                onMusicButtonChange = function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    const isMusicOn = !settings.getMusicEnabled();
                    SoundMgr.setMusicEnabled(isMusicOn);
                    updateMusicOption(musicBtn, isMusicOn);
                    updateMiniSoundButton(false, "gameSound");
                    updateMiniSoundButton(false, "optionSound");
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
            const refreshOptionsButtons = function () {
                setImageBigText("#optionsTitle img", MenuStringId.OPTIONS);
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
    };

    // ------------------------------------------------------------------------
    // Show Panels (called for each panel when it's shown)
    // ------------------------------------------------------------------------

    let bounceTimeOut = null;
    const onShowPanel = function (panelId) {
        const panel = PanelManager.getPanelById(panelId);

        if (panelId == PanelId.MENU || panelId == PanelId.BOXES || panelId == PanelId.OPTIONS) {
            GameBorder.fadeOut(300);
        } else if (panelId !== PanelId.LEVELS) {
            GameBorder.show();
        }

        // make sure the pause level panel is closed
        if (panelId !== PanelId.GAMEMENU) {
            closeLevelMenu();
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

            if (_this.isInAdvanceBoxMode) {
                _this.isInAdvanceBoxMode = false;
                setTimeout(function () {
                    hide("#levelResults");
                    boxPanel.slideToNextBox();

                    // if next level is not playable, show the purchase prompt
                    if (!BoxManager.isNextLevelPlayable()) {
                        Dialogs.showPayDialog();
                    }
                }, 800);
            } else {
                clearTimeout(bounceTimeOut);
                bounceTimeOut = setTimeout(function () {
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
            updateMiniSoundButton(false, "optionSound");
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
    };

    // ------------------------------------------------------------------------
    // UI methods
    // ------------------------------------------------------------------------

    // Sets the isTransitionActive flag to true and then back to false after the timeout. The
    // reason for using a timer here is to ensure that we always clear the flag since some UI
    // will be disabled until the flag gets cleared. This is an attempt to prevent new bugs.

    let transitionTimeout = null;
    var notifyBeginTransition = function (timeout, name) {
        _this.isTransitionActive = true;
        if (transitionTimeout != null) clearTimeout(transitionTimeout);
        transitionTimeout = setTimeout(function () {
            _this.isTransitionActive = false;
            transitionTimeout = null;
        }, timeout);
    };

    const runScoreTicker = function () {
        //$('#resultTicker').text(resultTopLines[currentResultLine]);
        text("#resultScore", resultBottomLines[currentResultLine]);
        currentResultLine++;
        if (currentResultLine < resultTopLines.length) {
            if (currentResultLine < resultTimeShiftIndex) {
                setTimeout(function () {
                    runScoreTicker();
                }, 10);
            } else {
                setTimeout(function () {
                    runScoreTicker();
                }, 167);
            }
        }
    };

    // play the level
    var openLevel = (this.openLevel = function (level, isRestart, isSkip) {
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
            setTimeout(function () {
                _this.openBox(isSkip);
            }, 200);
        }
    });

    var closeLevel = function () {
        RootController.stopLevel();
    };

    var isLastLevel = function () {
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
    };

    var completeBox = function () {
        //attempt to move to the next box
        const boxIndex = BoxManager.currentBoxIndex;

        // check for game complete
        const requiredIndex = BoxManager.requiredCount() - 1,
            isGameComplete = boxIndex >= requiredIndex;

        if (isGameComplete) {
            GameBorder.hide();
            VideoManager.playOutroVideo();
        } else {
            _this.isInAdvanceBoxMode = true;
            const panelId = edition.disableBoxMenu ? PanelId.MENU : PanelId.BOXES;
            PanelManager.showPanel(panelId, false);
        }
    };

    var openLevelMenu = function () {
        RootController.pauseLevel();
        show("#levelMenu");
    };

    var closeLevelMenu = function () {
        hide("#levelMenu");
    };

    this.tapeBox = function () {
        if (_this.isInMenuSelectMode) {
            GameBorder.fadeOut(800, 400);
            SoundMgr.playMusic(menuMusicId);
        }

        Doors.closeBoxAnimation(function () {
            _this.isBoxOpen = false;
            if (_this.isInMenuSelectMode) {
                PanelManager.showPanel(PanelId.MENU, false);
            } else {
                Doors.renderDoors(true, 0);
                PanelManager.showPanel(PanelId.LEVELS, true);
            }
        });
    };

    this.openBox = function openboxFunc(skip) {
        const timeout = PanelManager.currentPanelId == PanelId.LEVELS ? 400 : 0;

        //fade out options elements
        fadeOut("#levelScore");
        fadeOut("#levelBack");

        fadeOut("#levelOptions", timeout).then(function () {
            if (_this.isBoxOpen) {
                fadeOut("#levelResults", 800);

                setTimeout(function () {
                    //if (skip) {
                    //    RootController.startLevel(BoxManager.currentBoxIndex + 1, BoxManager.currentLevelIndex);
                    //    _this.showGameUI();
                    //} else {
                    RootController.startLevel(
                        BoxManager.currentBoxIndex + 1,
                        BoxManager.currentLevelIndex
                    );
                    Doors.openDoors(false, function () {
                        _this.showGameUI();
                    });
                    //}
                }, 400);
            } else {
                Doors.openBoxAnimation(function () {
                    _this.isBoxOpen = true;

                    RootController.startLevel(
                        BoxManager.currentBoxIndex + 1,
                        BoxManager.currentLevelIndex
                    );

                    Doors.openDoors(true, function () {
                        _this.showGameUI();
                    });
                });
            }
        }); // end fadeOut
    };

    this.closeBox = function () {
        _this.closeGameUI();

        setTimeout(function () {
            // animating from game to results
            if (!_this.isInLevelSelectMode) {
                const levelResults = getElement("#levelResults");
                if (levelResults) {
                    delay(levelResults, 750).then(function () {
                        return fadeIn(levelResults, 250);
                    });
                }
            }

            // close the doors
            Doors.closeDoors(false, function () {
                if (_this.isInLevelSelectMode) {
                    _this.tapeBox();
                } else {
                    Doors.showGradient();
                    setTimeout(function () {
                        runScoreTicker();
                    }, 250);
                }
            });
        }, 250);
    };

    const showLevelBackground = function () {
        show("#levelBackground");
    };

    const hideLevelBackground = function () {
        hide("#levelBackground");
    };

    this.showGameUI = function () {
        hideLevelBackground();
        if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
            show("#bg");
        }
        fadeIn("#gameBtnTray");
    };

    this.closeGameUI = function () {
        Doors.renderDoors(false, 1);
        notifyBeginTransition(1000, "close game ui");
        showLevelBackground();
        if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
            hide("#bg");
        }
        fadeOut("#gameBtnTray");
    };

    var resultTopLines = [],
        resultBottomLines = [],
        currentResultLine = 0,
        resultTimeShiftIndex = 0;

    this.onLevelWon = function (info) {
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
            let countDownPoints = from,
                duration = 1000,
                lastRender = Date.now(),
                requestAnimationFrame = window["requestAnimationFrame"];

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
            let finalPoints = currentPoints + frompoints,
                countDownSecs = fromsec,
                // between 1 and 2 secs depending on time
                duration = Math.max(1000, 2000 - fromsec * 50),
                lastRender = Date.now(),
                requestAnimationFrame = window["requestAnimationFrame"];

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
        var prevScore = ScoreManager.getScore(boxIndex, levelIndex - 1);

        // Update score of the current level if there is a best result
        ScoreManager.setScore(boxIndex, levelIndex - 1, score);
        ScoreManager.setStars(boxIndex, levelIndex - 1, stars);

        // unlock next level
        if (ScoreManager.levelCount(boxIndex) > levelIndex && BoxManager.isNextLevelPlayable()) {
            ScoreManager.setStars(boxIndex, levelIndex, 0);
        }

        _this.isInLevelSelectMode = false;
        _this.closeBox();

        // events that occur after completing the first level
        if (boxIndex === 0 && levelIndex === 1) {
            if (analytics.onFirstLevelComplete) {
                analytics.onFirstLevelComplete(info.fps);
            }

            // tell the user if the fps was low on the first level
            if (info.fps < MIN_FPS && !platform.disableSlowWarning) {
                // delay the popup to allow the score screen to finish
                setTimeout(function () {
                    Dialogs.showSlowComputerPopup();
                }, 3000);
            }

            VideoManager.removeIntroVideo();
        }
    };

    // show hide the "behind the scenes" link and the feedback tab when the screen changes size
    let isDevLinkVisible = true;
    this.updateDevLink = function () {
        if (width(window) < resolution.uiScaledNumber(1024) + 120 && isDevLinkVisible) {
            fadeOut("#moreLink").then(function () {
                isDevLinkVisible = false;
            });
            fadeOut("#zenbox_tab");
        } else if (width(window) > resolution.uiScaledNumber(1024) + 120 && !isDevLinkVisible) {
            fadeIn("#moreLink").then(function () {
                isDevLinkVisible = true;
            });
            fadeIn("#zenbox_tab");
        }
    };

    // we'll only resume when the game is enabled
    this.gameEnabled = true;

    this.pauseGame = function () {
        // make sure the game is active and no transitions are pending
        if (
            PanelManager.currentPanelId === PanelId.GAME &&
            RootController.isLevelActive() &&
            !_this.isTransitionActive
        ) {
            openLevelMenu();
        } else {
            SoundMgr.pauseMusic();
        }
    };

    this.resumeGame = function () {
        if (PanelManager.currentPanelId !== PanelId.GAMEMENU && _this.gameEnabled) {
            SoundMgr.resumeMusic();
        }
    };

    // ------------------------------------------------------------------------
    // Object management stuff
    // ------------------------------------------------------------------------

    this.init = function () {
        ScoreManager.load();
        PanelManager.onShowPanel = onShowPanel;
    };

    this.domReady = function () {
        VideoManager.domReady();
        EasterEggManager.domReady();
        PanelManager.domReady();
        GameBorder.domReady();

        // pause game / music when the user switches tabs
        window.addEventListener("blur", _this.pauseGame);

        // when returning to the tab, resume music (except when on game menu - no music there)
        window.addEventListener("focus", _this.resumeGame);

        // hide behind the scenes when we update the page
        window.addEventListener("resize", function () {
            _this.updateDevLink();
        });
    };

    this.appReady = function () {
        PubSub.subscribe(PubSub.ChannelId.LevelWon, this.onLevelWon);

        Doors.appReady();
        EasterEggManager.appReady();
        PanelManager.appReady(onInitializePanel);
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

        const im = this;
        PubSub.subscribe(PubSub.ChannelId.PauseGame, function () {
            im.pauseGame();
        });
        PubSub.subscribe(PubSub.ChannelId.EnableGame, function () {
            im.gameEnabled = true;
            im.resumeGame();
        });
        PubSub.subscribe(PubSub.ChannelId.DisableGame, function () {
            im.gameEnabled = false;
            im.pauseGame();
        });
    };

    // used for debug and in level editor to start a level w/o menus
    this.noMenuStartLevel = function (boxIndex, levelIndex) {
        PanelManager.showPanel(PanelId.GAME, true);

        // unfortunate that box manager is zero index for box and 1 based for level
        BoxManager.currentBoxIndex = boxIndex;
        BoxManager.currentLevelIndex = levelIndex + 1;

        this.openBox();
    };

    this.openLevelMenu = function (boxIndex) {
        _this.isBoxOpen = false;
        Doors.renderDoors(true, 0);
        PanelManager.showPanel(PanelId.LEVELS);
        GameBorder.setBoxBorder(boxIndex);
    };
})();

export default InterfaceManager;
