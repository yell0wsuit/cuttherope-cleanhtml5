define("ui/PanelManager", [
  "ui/PanelId",
  "ui/Panel",
  "ui/BoxPanel",
  "ui/LevelPanel",
  "ui/TimePasswordPanel",
  "resolution",
  "platform",
  "ui/Easing",
  "utils/PubSub",
  "edition",
], function (
  PanelId,
  Panel,
  BoxPanel,
  LevelPanel,
  PasswordPanel,
  resolution,
  platform,
  Easing,
  PubSub,
  edition,
) {
  var PanelManager = new (function () {
    var _this = this,
      panels = [];

    this.onShowPanel = null;

    this.domReady = function () {
      fadeToBlack = $("#fadeToBlack");

      // shadowCanvas = document.getElementById('shadowCanvas');
      // shadowCanvas.width = resolution.uiScaledNumber(1024);
      // shadowCanvas.height = resolution.uiScaledNumber(576);
    };

    this.appReady = function (onInitializePanel) {
      // we have to wait until the game is ready to run before initializing
      // panels because we need the fonts to be loaded

      shadowImage = new Image();
      shadowImage.src = platform.uiImageBaseUrl + "shadow.png";

      // initialize each of the panels
      if (onInitializePanel) {
        for (var i = 0, len = panels.length; i < len; i++) {
          onInitializePanel(panels[i].id);
        }
      }
    };

    // get a panel by id
    var getPanelById = (this.getPanelById = function (panelId) {
      for (var i = 0; i < panels.length; i++) {
        if (panels[i].id == panelId) return panels[i];
      }
      return null;
    });

    // create our panels
    panels.push(new Panel(PanelId.MENU, "menuPanel", "startBackground", true));
    panels.push(BoxPanel);
    panels.push(LevelPanel);

    // the game panel re-uses the panel doors in the levelBackground (actually in foreground)
    panels.push(new Panel(PanelId.GAME, null, "levelBackground", false));
    panels.push(new Panel(PanelId.GAMEMENU, null, null, false));
    panels.push(new Panel(PanelId.LEVELCOMPLETE, null, null, false));
    panels.push(
      new Panel(
        PanelId.GAMECOMPLETE,
        "gameCompletePanel",
        "menuBackground",
        true,
      ),
    );
    panels.push(
      new Panel(PanelId.OPTIONS, "optionsPanel", "menuBackground", true),
    );
    panels.push(new Panel(PanelId.CREDITS, null, null, false));
    panels.push(
      new Panel(
        PanelId.LEADERBOARDS,
        "leaderboardPanel",
        "menuBackground",
        true,
      ),
    );
    panels.push(
      new Panel(
        PanelId.ACHIEVEMENTS,
        "achievementsPanel",
        "menuBackground",
        true,
      ),
    );
    panels.push(PasswordPanel);

    this.currentPanelId = PanelId.MENU;

    // show a panel by id
    this.showPanel = function (panelId, skipFade) {
      _this.currentPanelId = panelId;

      var panel = getPanelById(panelId);
      var skip = skipFade == null ? false : skipFade;

      // enable / disable the shadow animation
      // if (panel.showShadow) {
      //     showShadow();
      // }
      // else {
      //     hideShadow();
      // }

      // we always use a timeout, even if we skip the animation, to keep the code clean
      var timeout = skip ? 0 : fadeInDur + fadePause;
      setTimeout(function () {
        // show the panel
        if (panel.bgDivId) {
          $("#" + panel.bgDivId).show();
        }
        if (panel.panelDivId) {
          $("#" + panel.panelDivId).show();
        }

        // hide other panels
        for (var i = 0; i < panels.length; i++) {
          var otherPanel = panels[i];

          if (
            otherPanel.panelDivId != null &&
            otherPanel.panelDivId != panel.panelDivId
          ) {
            $("#" + otherPanel.panelDivId).hide();
          }

          if (
            otherPanel.bgDivId != null &&
            otherPanel.bgDivId != panel.bgDivId
          ) {
            $("#" + otherPanel.bgDivId).hide();
          }
        }

        // run the "show" handler
        if (_this.onShowPanel != null) {
          _this.onShowPanel(panelId);
        }

        // fade back in
        if (!skip) {
          _this.runBlackFadeOut();
        }
      }, timeout);

      // start the animation
      if (!skip) {
        _this.runBlackFadeIn();
      }
    };

    // fade parameters
    var fadeInDur = 100;
    var fadePause = 50;
    var fadeOutDur = 100;
    var fadeTo = 1.0;
    var fadeToBlack;
    var isFading = false;

    this.runBlackFadeIn = function (callback) {
      isFading = true;
      var b = Date.now();

      // reset the overlay
      fadeToBlack.css("opacity", 0);
      fadeToBlack.css("display", "block");

      // our loop
      function loop() {
        var now = Date.now(),
          diff = now - b,
          v = Easing.noEase(diff, 0, fadeTo, fadeInDur);

        fadeToBlack.css("opacity", v);

        if (diff < fadeInDur) {
          window.requestAnimationFrame(loop);
        } else {
          fadeToBlack.css("opacity", fadeTo);
          if (callback != null) callback();
        }
      }

      window.requestAnimationFrame(loop);
    };

    this.runBlackFadeOut = function () {
      if (!isFading) return;
      var b = Date.now();

      // our loop
      function loop() {
        var now = Date.now(),
          diff = now - b,
          v = fadeTo - Easing.noEase(diff, 0, fadeTo, fadeInDur);

        fadeToBlack.css("opacity", v);

        if (diff < fadeInDur) {
          window.requestAnimationFrame(loop);
        } else {
          fadeToBlack.css("opacity", 0);
          fadeToBlack.css("display", "none");
          isFading = false;
        }
      }

      window.requestAnimationFrame(loop);
    };

    var shadowIsRotating = false;
    var shadowAngle = 15.0;
    var shadowCanvas = null;
    var shadowImage = null;
    var shadowOpacity = 1.0;
    var shadowIsVisible = false;
    var shadowSpeedup = edition.shadowSpeedup || 1;

    var showShadow = function () {
      if (!shadowIsVisible) {
        if (shadowCanvas != null) {
          var ctx = shadowCanvas.getContext("2d");
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
          ctx.restore();
        }

        shadowOpacity = 0.0;
        shadowIsVisible = true;

        $("#shadowPanel").show();
        if (!shadowIsRotating) {
          beginRotateShadow();
        }
      }
    };

    var hideShadow = function () {
      shadowIsVisible = false;
      shadowIsRotating = false;
      $("#shadowPanel").hide();
    };

    // starts the shadow animation
    var beginRotateShadow = function () {
      var ctx = shadowCanvas.getContext("2d"),
        requestAnimationFrame = window["requestAnimationFrame"],
        lastRotateTime = Date.now(),
        renderShadow = function () {
          if (!shadowIsRotating) {
            return;
          }

          // move .1 radians every 25 msec
          var now = Date.now(),
            delta = now - lastRotateTime;
          shadowAngle += ((delta * 0.1) / 25) * shadowSpeedup;
          lastRotateTime = now;

          // clear the canvas
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

          // update opacity
          if (shadowOpacity < 1.0) {
            shadowOpacity += 0.025;
            shadowOpacity = Math.min(shadowOpacity, 1.0);
            ctx.globalAlpha = shadowOpacity;
          }

          // rotate the context
          ctx.save();
          ctx.translate(shadowImage.width * 0.5, shadowImage.height * 0.5);
          ctx.translate(
            resolution.uiScaledNumber(-300),
            resolution.uiScaledNumber(-510),
          );
          ctx.rotate((shadowAngle * Math.PI) / 180);
          ctx.translate(-shadowImage.width * 0.5, -shadowImage.height * 0.5);

          // draw the image and update the loop
          ctx.drawImage(shadowImage, 0, 0);
          ctx.restore();

          requestAnimationFrame(renderShadow);
        };

      shadowIsRotating = true;
      renderShadow();
    };
  })();

  PubSub.subscribe(PubSub.ChannelId.BoxesUnlocked, function (isFirstUnlock) {
    var nextPanelId = isFirstUnlock ? PanelId.MENU : PanelId.BOXES;

    // switch back to the boxes panel after a short delay
    setTimeout(function () {
      PanelManager.showPanel(nextPanelId);
    }, 1000);
  });

  return PanelManager;
});
