define("ui/InterfaceManager", [
    "edition",
    "resolution",
    "platform",
    "ui/ScoreManager",
    "ui/BoxManager",
    "ui/PanelId",
    "ui/PanelManager",
    "ui/EasterEggManager",
    "visual/Text",
    "utils/PointerCapture",
    "game/CTRSettings",
    "game/CTRSoundMgr",
    "resources/ResourceId",
    "utils/requestAnimationFrame",
    "ui/Easing",
    "ui/QueryStrings",
    "game/CTRRootController",
    "ui/VideoManager",
    "utils/PubSub",
    "ui/BoxType",
    "resources/Lang",
    "resources/LangId",
    "resources/MenuStringId",
    "core/Alignment",
    "ui/SocialHelper",
    "ui/GameBorder",
    "analytics",
    "Doors",
    "ui/Dialogs",
], function (
    edition,
    resolution,
    platform,
    ScoreManager,
    BoxManager,
    PanelId,
    PanelManager,
    EasterEggManager,
    Text,
    PointerCapture,
    settings,
    SoundMgr,
    ResourceId,
    requestAnimationFrame,
    Easing,
    QueryStrings,
    RootController,
    VideoManager,
    PubSub,
    BoxType,
    Lang,
    LangId,
    MenuStringId,
    Alignment,
    SocialHelper,
    GameBorder,
    analytics,
    Doors,
    Dialogs
) {
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
            $("#optionSound").removeClass(allClassNames).addClass(className);
            $("#gameSound").removeClass(allClassNames).addClass(className);

            // option panel screen
            $("#soundBtn .options-x").css("display", !isSoundOn ? "block" : "none");
            $("#musicBtn .options-x").css("display", !isMusicOn ? "block" : "none");

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

        var showMiniOptionMessage = function (msgId, text, delay) {
            if (msgId != undefined) {
                let showDelay = delay || 500,
                    $msg = $("#" + msgId),
                    $img = $msg.find("img");

                // make sure the image exists
                if ($img.length === 0) {
                    $img = $("<img/>").appendTo($msg);
                }

                // render the text
                Text.drawSmall({
                    text: text,
                    img: $img[0],
                    scaleToUI: true,
                    alpha: 0.6,
                    alignment: Alignment.LEFT,
                });

                // stop any in-progress animations and queue fade in and out
                $msg.stop(true, true).fadeIn(500).delay(showDelay).fadeOut(750);
            }
        };

        // only enable achievements and leaderboard for signed-in users
        let signedIn = false,
            updateSignInControls = function () {
                $("#achievementsBtn").toggleClass("disabled", !signedIn);
                $("#leaderboardsBtn").toggleClass("disabled", !signedIn);
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
                $("#playBtn").click(function () {
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

                $("#optionsBtn").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    // see if there is a custom settings panel we should trigger
                    if (platform.customOptions) {
                        PubSub.publish(PubSub.ChannelId.ShowOptions);
                    } else {
                        PanelManager.showPanel(PanelId.OPTIONS);
                    }
                });

                $("#achievementsBtn")
                    .click(function () {
                        if (signedIn) {
                            SoundMgr.playSound(ResourceId.SND_TAP);
                            PanelManager.showPanel(PanelId.ACHIEVEMENTS);
                        }
                    })
                    .toggleClass("disabled", !signedIn);

                $("#leaderboardsBtn")
                    .click(function () {
                        if (signedIn) {
                            SoundMgr.playSound(ResourceId.SND_TAP);
                            PanelManager.showPanel(PanelId.LEADERBOARDS);
                        }
                    })
                    .toggleClass("disabled", !signedIn);

                // reset popup buttons
                let resetTimer = null;
                $("#resetYesBtn")
                    .on(PointerCapture.startEventName, function () {
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
                    })
                    .on(PointerCapture.endEventName, function () {
                        if (resetTimer != null) {
                            clearTimeout(resetTimer);
                        }
                    });

                // mini options panel

                updateMiniSoundButton(false, "optionSound");
                $("#optionSound").click(function () {
                    updateMiniSoundButton(true, "optionSound", "optionMsg");
                });

                let hdtoggle;
                if (_this.useHDVersion) {
                    $("#optionHd").addClass("activeResolution");
                    $("#optionSd").addClass("inActiveResolution");
                    $("#optionSd").addClass("ctrPointer");
                    $("#optionSd").hover(
                        function () {
                            showMiniOptionMessage("optionMsg", Lang.menuText(MenuStringId.RELOAD_SD), 4000);
                        },
                        function () {
                            $("#optionMsg").stop(true, true).fadeOut(500);
                        }
                    );
                    hdtoggle = "optionSd";
                } else {
                    $("#optionSd").addClass("activeResolution");
                    $("#optionHd").addClass("inActiveResolution");
                    $("#optionHd").addClass("ctrPointer");
                    $("#optionHd").hover(
                        function () {
                            showMiniOptionMessage("optionMsg", Lang.menuText(MenuStringId.RELOAD_HD), 4000);
                        },
                        function () {
                            $("#optionMsg").stop(true, true).fadeOut(500);
                        }
                    );
                    hdtoggle = "optionHd";
                }

                $("#" + hdtoggle).click(function (e) {
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
                $("#boxBack").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.MENU);
                });

                var panel = PanelManager.getPanelById(panelId);
                panel.init(InterfaceManager);
            } else if (panelId == PanelId.PASSWORD) {
                $("#boxEnterCodeButton").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.PASSWORD);
                });

                // handles clicking on the circular back button
                $("#codeBack").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.BOXES);
                });

                var panel = PanelManager.getPanelById(panelId);
                panel.init(InterfaceManager);
            }

            // initialize the LEVELS panel
            else if (panelId == PanelId.LEVELS) {
                $("#levelBack").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    const panelId = edition.disableBoxMenu ? PanelId.MENU : PanelId.BOXES;
                    PanelManager.showPanel(panelId);
                });

                // render the canvas all the way closed
                Doors.renderDoors(true, 0.0);

                var panel = PanelManager.getPanelById(panelId);
                panel.init(InterfaceManager);
            } else if (panelId == PanelId.GAME) {
                $("#gameRestartBtn").click(function () {
                    if (_this.isTransitionActive) return;
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    openLevel(BoxManager.currentLevelIndex, true); // is a restart
                });

                $("#gameMenuBtn").click(function () {
                    if (_this.isTransitionActive) return;
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    openLevelMenu();
                });
            } else if (panelId == PanelId.GAMEMENU) {
                $("#continueBtn").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    closeLevelMenu();
                    RootController.resumeLevel();
                });

                $("#skipBtn").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    closeLevelMenu();
                    //unlock next level
                    if (BoxManager.isNextLevelPlayable()) {
                        ScoreManager.setStars(BoxManager.currentBoxIndex, BoxManager.currentLevelIndex, 0);
                        openLevel(BoxManager.currentLevelIndex + 1, false, true);
                    } else {
                        $("#gameBtnTray").hide();
                        completeBox();
                    }
                });

                $("#selectBtn").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    closeLevelMenu();
                    closeLevel();
                    _this.isInLevelSelectMode = true;
                    _this.isInMenuSelectMode = false;
                    _this.closeBox();
                });

                $("#menuBtn").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    closeLevelMenu();
                    closeLevel();
                    _this.isInLevelSelectMode = true;
                    _this.isInMenuSelectMode = true;
                    _this.closeBox();
                });

                // mini options panel
                updateMiniSoundButton(false, "gameSound");
                $("#gameSound").click(function () {
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
                $("#nextBtn").click(function () {
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

                $("#replayBtn").click(function () {
                    if (_this.isTransitionActive) return;
                    notifyBeginTransition(1000, "replay");
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    openLevel(BoxManager.currentLevelIndex);
                });

                $("#lrMenuBtn").click(function () {
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
                $("#gameCompleteBack").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.MENU);
                    GameBorder.hide();
                });

                $("#finalShareBtn").click(function () {
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
                            width: resolution.uiScaledNumber(550),
                        });

                    // clear existing text image and append to placeholder divs
                    $("#resetText").empty().append($(resetTextImg));
                    $("#resetHoldYes").empty().append($(resetHoldYesImg));

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
                    $("#lang")
                        .removeClass(
                            "lang-system lang-en lang-de lang-ru lang-fr lang-ca lang-br lang-es lang-it lang-nl lang-ko lang-ja lang-zh"
                        )
                        .addClass("lang-" + LangId.toCountryCode(langId));

                    if (langId >= 4 && langId <= 9) {
                        $("#lang").addClass("lang-system");
                    }
                };

                PubSub.subscribe(PubSub.ChannelId.LanguageChanged, refreshOptionsButtons);
                PubSub.subscribe(PubSub.ChannelId.ShowOptionsPage, refreshOptionsButtons);
            } else if (panelId === PanelId.LEADERBOARDS) {
                $("#leaderboardBack").click(function () {
                    SoundMgr.playSound(ResourceId.SND_TAP);
                    PanelManager.showPanel(PanelId.MENU);
                });
            } else if (panelId === PanelId.ACHIEVEMENTS) {
                $("#achievementsBack").click(function () {
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
                        $("#levelResults").hide();
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
                $("#levelResults").hide();

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

                $("#congrats")
                    .empty()
                    .append(
                        Text.drawBig({
                            text: Lang.menuText(MenuStringId.CONGRATULATIONS),
                            scale: 1.2 * resolution.UI_TEXT_SCALE,
                        })
                    );

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
            $("#resultScore").text(resultBottomLines[currentResultLine]);
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
            $("#levelMenu").show();
        };

        var closeLevelMenu = function () {
            $("#levelMenu").hide();
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
            $("#levelScore").fadeOut();
            $("#levelBack").fadeOut();

            RootController.startLevel(BoxManager.currentBoxIndex + 1, BoxManager.currentLevelIndex);

            $("#levelOptions").fadeOut(timeout, function () {
                if (_this.isBoxOpen) {
                    $("#levelResults").fadeOut(800);

                    setTimeout(function () {
                        if (skip) {
                            _this.showGameUI();
                        } else {
                            Doors.openDoors(false, function () {
                                _this.showGameUI();
                            });
                        }
                    }, 400);
                } else {
                    Doors.openBoxAnimation(function () {
                        _this.isBoxOpen = true;

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
                    $("#levelResults").delay(750).fadeIn(250);
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
            $("#levelBackground").show();
        };

        const hideLevelBackground = function () {
            $("#levelBackground").hide();
        };

        this.showGameUI = function () {
            hideLevelBackground();
            if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
                $("#bg").show();
            }
            $("#gameBtnTray").fadeIn();
        };

        this.closeGameUI = function () {
            Doors.renderDoors(false, 1);
            notifyBeginTransition(1000, "close game ui");
            showLevelBackground();
            if (QueryStrings.showBoxBackgrounds && edition.enableBoxBackgroundEasterEgg) {
                $("#bg").hide();
            }
            $("#gameBtnTray").fadeOut();
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
                    $("#resultStar1").removeClass("starEmpty").addClass("star");
                    $("#resultStar2").removeClass("starEmpty").addClass("star");
                    $("#resultStar3").removeClass("starEmpty").addClass("star");
                    resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED4);
                    break;
                case 2:
                    $("#resultStar1").removeClass("starEmpty").addClass("star");
                    $("#resultStar2").removeClass("starEmpty").addClass("star");
                    $("#resultStar3").removeClass("star").addClass("starEmpty");
                    resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED3);
                    break;
                case 1:
                    $("#resultStar1").removeClass("starEmpty").addClass("star");
                    $("#resultStar2").removeClass("star").addClass("starEmpty");
                    $("#resultStar3").removeClass("star").addClass("starEmpty");
                    resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED2);
                    break;
                default:
                    $("#resultStar1").removeClass("star").addClass("starEmpty");
                    $("#resultStar2").removeClass("star").addClass("starEmpty");
                    $("#resultStar3").removeClass("star").addClass("starEmpty");
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
            const valdiv = $("#resultTickerValue").hide();
            const lbldiv = $("#resultTickerLabel").hide();
            const resdiv = $("#resultScore").empty().hide();
            const stamp = $("#resultImproved").hide();
            const msgdiv = $("#resultTickerMessage").hide();

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
                        pointDelta = Math.min(Math.round((from * timeDelta) / duration), countDownPoints);

                    lastRender = now;

                    countDownPoints -= pointDelta;
                    currentPoints += pointDelta;
                    if (countDownPoints <= 0) {
                        countDownPoints = 0;
                        currentPoints = from;
                        lbldiv.fadeOut(400);
                        valdiv.fadeOut(400, callback);
                    } else {
                        requestAnimationFrame(renderCount);
                    }

                    Text.drawSmall({
                        text: countDownPoints,
                        img: valdiv[0],
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
                        lbldiv.fadeOut(400);
                        valdiv.fadeOut(400, callback);
                    } else {
                        requestAnimationFrame(renderScore);
                    }

                    Text.drawSmall({
                        text: secondsToMin(countDownSecs),
                        img: valdiv[0],
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
                img: lbldiv[0],
                scaleToUI: true,
                canvas: true,
            });
            Text.drawSmall({
                text: totalStarPoints,
                img: valdiv[0],
                scaleToUI: true,
                canvas: true,
            });
            $("#resultScore img").remove();
            $("#resultScore canvas").remove();

            // run the animation sequence
            setTimeout(function () {
                lbldiv.fadeIn(300);
                valdiv.fadeIn(300);
                resdiv.fadeIn(300, function () {
                    doStarCountdown(totalStarPoints, function () {
                        Text.drawSmall({
                            text: Lang.menuText(MenuStringId.TIME),
                            img: lbldiv[0],
                            scaleToUI: true,
                            canvas: true,
                        });
                        lbldiv.fadeIn(300);
                        Text.drawSmall({
                            text: secondsToMin(Math.ceil(levelTime)),
                            img: valdiv[0],
                            scaleToUI: true,
                            canvas: true,
                        });
                        valdiv.fadeIn(300, function () {
                            doTimeCountdown(Math.ceil(levelTime), score - currentPoints, function () {
                                msgdiv.fadeIn(300);
                                // show the improved result stamp
                                if (prevScore != null && prevScore > 0 && score > prevScore) {
                                    if ($.browser.msie) {
                                        stamp.show();
                                    } else {
                                        stamp.animate({ scale: 2.5, opacity: 0.0 }, 0, function () {
                                            stamp.css("display", "block");
                                            stamp.animate({ scale: 1.0, opacity: 1.0 }, 600, "easeInCubic");
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
            if ($(window).width() < resolution.uiScaledNumber(1024) + 120 && isDevLinkVisible) {
                $("#moreLink").fadeOut(function () {
                    isDevLinkVisible = false;
                });
                $("#zenbox_tab").fadeOut();
            } else if ($(window).width() > resolution.uiScaledNumber(1024) + 120 && !isDevLinkVisible) {
                $("#moreLink").fadeIn(function () {
                    isDevLinkVisible = true;
                });
                $("#zenbox_tab").fadeIn();
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
            $(window).blur(_this.pauseGame);

            // when returning to the tab, resume music (except when on game menu - no music there)
            $(window).focus(_this.resumeGame);

            // hide behind the scenes when we update the page
            $(window).resize(function () {
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

    return InterfaceManager;
});
