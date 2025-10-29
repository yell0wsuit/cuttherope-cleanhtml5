import edition from "@/edition";
import resolution from "@/resolution";
import platform from "@/platform";
import ScoreManager from "@/ui/ScoreManager";
import BoxManager from "@/ui/BoxManager";
import PanelId from "@/ui/PanelId";
import PanelManager from "@/ui/PanelManager";
import Text from "@/visual/Text";
import PointerCapture from "@/utils/PointerCapture";
import settings from "@/game/CTRSettings";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import RootController from "@/game/CTRRootController";
import VideoManager from "@/ui/VideoManager";
import PubSub from "@/utils/PubSub";
import Lang from "@/resources/Lang";
import LangId from "@/resources/LangId";
import MenuStringId from "@/resources/MenuStringId";
import Alignment from "@/core/Alignment";
import SocialHelper from "@/ui/SocialHelper";
import GameBorder from "@/ui/GameBorder";
import Doors from "@/Doors";
import Dialogs from "@/ui/Dialogs";
import analytics from "@/analytics";
import { getDefaultBoxIndex } from "@/ui/InterfaceManager/constants";
import { addClass, append, empty, fadeIn, fadeOut, hide, hover, on, removeClass, stopAnimations } from "@/utils/domHelpers";

/**
 * Base class for panel initialization
 */
export default class PanelInitializer {
    /**
     * Initializes a panel
     * @param {number} panelId - The ID of the panel to initialize
     */
    _onInitializePanel(panelId) {
        const panel = PanelManager.getPanelById(panelId);
        const soundBtn = document.getElementById("soundBtn");
        const musicBtn = document.getElementById("musicBtn");
        const resetBtn = document.getElementById("resetBtn");
        const backBtn = document.getElementById("optionsBack");
        const optionMsg = document.getElementById("optionMsg");
        const resetTextContainer = document.getElementById("resetText");
        const resetHoldYesContainer = document.getElementById("resetHoldYes");
        const langElement = document.getElementById("lang");

        switch (panelId) {
            case PanelId.MENU: {
                // initialize the MENU panel
                on("#playBtn", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);

                    /*if (analytics.onPlayClicked) {
                        analytics.onPlayClicked();
                    }*/

                    VideoManager.playIntroVideo(() => {
                        const firstLevelStars = ScoreManager.getStars(getDefaultBoxIndex(), 0) || 0;
                        if (firstLevelStars === 0) {
                            // start the first level immediately for the default box
                            this.noMenuStartLevel(getDefaultBoxIndex(), 0);
                        } else {
                            const nextPanelId = edition.disableBoxMenu
                                ? PanelId.LEVELS
                                : PanelId.BOXES;
                            PanelManager.showPanel(nextPanelId, true);
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
                    if (!this._signedIn) {
                        return;
                    }
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.ACHIEVEMENTS);
                });
                this._updateSignInControls();

                on("#leaderboardsBtn", "click", () => {
                    if (!this._signedIn) {
                        return;
                    }
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.LEADERBOARDS);
                });
                this._updateSignInControls();

                // reset popup buttons
                /**
                 * @type {ReturnType<typeof setTimeout> | null}
                 */
                let resetTimer = null;
                on("#resetYesBtn", PointerCapture.startEventName, () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    resetTimer = setTimeout(() => {
                        Dialogs.closePopup();
                        resetTimer = null;
                        settings.clear();

                        // reset scores
                        ScoreManager.resetGame();

                        // lock all the boxes
                        BoxManager.resetLocks();

                        PubSub.publish(PubSub.ChannelId.LoadIntroVideo);
                    }, 3000); // wait 3 seconds in case user changes their mind
                });

                on("#resetYesBtn", PointerCapture.endEventName, () => {
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
                        () => {
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
                        () => {
                            if (optionMsg) {
                                stopAnimations(optionMsg);
                                fadeOut(optionMsg, 500);
                            }
                        }
                    );
                    hdtoggle = "optionHd";
                }

                on(`#${hdtoggle}`, "click", () => {
                    settings.setIsHD(!this.useHDVersion);
                    window.location.reload();
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

                break;
            }

            case PanelId.BOXES: {
                // initialize the BOXES panel
                // handles clicking on the circular back button
                on("#boxBack", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.MENU);
                });

                panel.init(this);

                break;
            }

            case PanelId.PASSWORD: {
                on("#boxEnterCodeButton", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.PASSWORD);
                });

                on("#codeBack", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.BOXES);
                });

                panel.init(this);

                break;
            }

            case PanelId.LEVELS: {
                // initialize the LEVELS panel
                on("#levelBack", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    const targetPanelId = edition.disableBoxMenu ? PanelId.MENU : PanelId.BOXES;
                    PanelManager.showPanel(targetPanelId);
                });

                // render the canvas all the way closed
                Doors.renderDoors(true, 0.0);
                panel.init(this);

                break;
            }

            case PanelId.GAME: {
                on("#gameRestartBtn", "click", () => {
                    if (this.isTransitionActive) return;
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    this._openLevel(BoxManager.currentLevelIndex, true);
                });

                on("#gameMenuBtn", "click", () => {
                    if (this.isTransitionActive) return;
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    this._openLevelMenu();
                });

                break;
            }

            case PanelId.GAMEMENU: {
                on("#continueBtn", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    this._closeLevelMenu();
                    RootController.resumeLevel();
                });

                on("#skipBtn", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    this._closeLevelMenu();

                    // unlock next level
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

                break;
            }

            case PanelId.LEVELCOMPLETE: {
                on("#nextBtn", "click", () => {
                    if (this.isTransitionActive) return;
                    this._notifyBeginTransition(1000, "next level");
                    SoundMgr.playSound(ResourceId.SND_TAP);
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

                break;
            }

            case PanelId.GAMECOMPLETE: {
                on("#gameCompleteBack", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.MENU);
                    GameBorder.hide();
                });

                on("#finalShareBtn", "click", () => {
                    const possibleStars = BoxManager.possibleStars();
                    const totalStars = ScoreManager.totalStars();
                    SocialHelper.postToFeed(
                        platform.getGameCompleteShareText(totalStars, possibleStars),
                        SocialHelper.siteDescription,
                        `${platform.getScoreImageBaseUrl()}score${totalStars}.png`,
                        () => true
                    );
                });

                break;
            }

            case PanelId.OPTIONS: {
                // sound effects
                const updateSoundOption = platform.updateSoundOption;

                const onSoundButtonChange = () => {
                    const isSoundOn = !settings.getSoundEnabled();
                    SoundMgr.setSoundEnabled(isSoundOn);
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    updateSoundOption(soundBtn, isSoundOn);
                    this._updateMiniSoundButton(false, "gameSound");
                    this._updateMiniSoundButton(false, "optionSound");
                };
                platform.setSoundButtonChange(soundBtn, onSoundButtonChange);

                // game music
                const updateMusicOption = platform.updateMusicOption;

                const onMusicButtonChange = () => {
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
                platform.setLangOptionClick((/** @type {number | null} */ langParam) => {
                    SoundMgr.playSound(ResourceId.SND_TAP);

                    // if not specified we'll assume that we should advance to
                    // the next language (so we cycle through as user clicks)
                    let newLangId;
                    if (langParam == null) {
                        const currentIndex = edition.languages.indexOf(settings.getLangId());
                        newLangId =
                            edition.languages[(currentIndex + 1) % edition.languages.length];
                    } else {
                        newLangId = langParam;
                    }
                    settings.setLangId(newLangId);

                    // send the notification that language has changed
                    PubSub.publish(PubSub.ChannelId.LanguageChanged);
                });

                // click or drag to cut
                const updateCutOption = platform.updateCutSetting;
                platform.setCutOptionClick(() => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    const isClickToCut = !settings.getClickToCut();
                    settings.setClickToCut(isClickToCut);
                    updateCutOption(isClickToCut);
                });

                resetBtn?.addEventListener("click", () => {
                    // create localized text images
                    const resetTextImg = Text.drawBig({
                        text: Lang.menuText(MenuStringId.RESET_TEXT),
                        alignment: Alignment.CENTER,

                        // we use canvas scale because text is draw at game scale and
                        // scaled to UI dimensions by setting the img width & height
                        width: 1250 * resolution.CANVAS_SCALE,
                        scaleToUI: true,
                    });

                    const resetHoldYesImg = Text.drawSmall({
                        text: Lang.menuText(MenuStringId.RESET_HOLD_YES),
                        scaleToUI: true,
                    });

                    // clear existing text image and append to placeholder divs

                    if (resetTextContainer) {
                        empty(resetTextContainer);
                        append(resetTextContainer, resetTextImg);
                    }

                    if (resetHoldYesContainer) {
                        empty(resetHoldYesContainer);
                        append(resetHoldYesContainer, resetHoldYesImg);
                    }
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    Dialogs.showPopup("resetGame");
                });

                backBtn?.addEventListener("click", () => {
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

                    if (langElement) {
                        removeClass(
                            langElement,
                            "lang-system lang-en lang-de lang-ru lang-fr lang-ca lang-br lang-es lang-it lang-nl lang-ko lang-ja lang-zh"
                        );
                        addClass(langElement, `lang-${LangId.toCountryCode(langId)}`);
                        if (langId >= 4 && langId <= 9) {
                            addClass(langElement, "lang-system");
                        }
                    }
                };

                PubSub.subscribe(PubSub.ChannelId.LanguageChanged, refreshOptionsButtons);
                PubSub.subscribe(PubSub.ChannelId.ShowOptionsPage, refreshOptionsButtons);

                break;
            }

            case PanelId.LEADERBOARDS: {
                on("#leaderboardBack", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.MENU);
                });

                break;
            }

            case PanelId.ACHIEVEMENTS: {
                on("#achievementsBack", "click", () => {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.MENU);
                });

                break;
            }
        }
    }
}
