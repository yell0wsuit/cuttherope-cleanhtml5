define("ui/LevelPanel", [
  "ui/PanelId",
  "ui/Panel",
  "resolution",
  "platform",
  "ui/ScoreManager",
  "ui/BoxManager",
  "utils/PubSub",
  "game/CTRSoundMgr",
  "resources/ResourceId",
  "resources/Lang",
  "visual/Text",
  "resources/MenuStringId",
  "edition",
  "core/Alignment",
  "ui/Dialogs",
], function (
  PanelId,
  Panel,
  resolution,
  platform,
  ScoreManager,
  BoxManager,
  PubSub,
  SoundMgr,
  ResourceId,
  Lang,
  Text,
  MenuStringId,
  edition,
  Alignment,
  Dialogs,
) {
  var backgroundId = edition.levelBackgroundId || "levelBackground",
    LevelPanel = new Panel(PanelId.LEVELS, "levelPanel", backgroundId, true);

  // cache interface manager reference
  var im = null;

  LevelPanel.init = function (interfaceManager) {
    im = interfaceManager;

    // generate level elements
    var levelCount = ScoreManager.levelCount(BoxManager.currentBoxIndex);
    var $levelOptions = $("#levelOptions");

    // initialize for a 3x3 grid
    var leftOffset = 0,
      topOffset = 0,
      lineLength = resolution.uiScaledNumber(420),
      inc = resolution.uiScaledNumber(153),
      modClass = "",
      columns = 3,
      lastRowCount = levelCount % 3;

    if (levelCount > 9 && levelCount <= 12) {
      // expand to 4x3 grid
      leftOffset = -80;
      topOffset = 10;
      columns = 4;
      lineLength = resolution.uiScaledNumber(500);
      inc = resolution.uiScaledNumber(153);
    } else if (levelCount > 12) {
      // expand to a 5x5 grid
      leftOffset = -30;
      topOffset = -40;
      inc = resolution.uiScaledNumber(101);
      modClass = "option-small";
      ((columns = 5), (lastRowCount = levelCount % 5));
    }

    var curTop = topOffset,
      curLeft = leftOffset,
      el;

    var adLevel = function $addLevel(i, inc, extraPad) {
      // create the level button
      $("<div/>")
        .attr("id", "option" + (i + 1))
        .data("level", i)
        .addClass("option locked ctrPointer " + modClass)
        .css({ left: curLeft + (extraPad || 0), top: curTop })
        .click(onLevelClick)
        .appendTo($levelOptions);

      curLeft += inc;
      if (curLeft > lineLength) {
        curLeft = leftOffset;
        curTop += inc;
      }
    };

    for (
      var i = 0, filledRowCount = levelCount - lastRowCount;
      i < filledRowCount;
      i++
    ) {
      adLevel(i, inc);
    }

    if (lastRowCount > 0) {
      (function (j) {
        var extraPad = ((columns - lastRowCount) * inc) / 2;
        for (; j < levelCount; j++) {
          adLevel(j, inc, extraPad);
        }
      })(i);
    }
  };

  LevelPanel.onShow = function () {
    updateLevelOptions();
    $("#levelScore").delay(200).fadeIn(700);
    $("#levelBack").delay(200).fadeIn(700);
    $("#levelOptions").delay(200).fadeIn(700);
    $("#levelResults").delay(200).fadeOut(700);
  };

  // listen to purchase event
  var isPaid = false;
  PubSub.subscribe(PubSub.ChannelId.SetPaidBoxes, function (paid) {
    isPaid = paid;
    updateLevelOptions();
  });

  // update level UI when boxes are updated (paid upgrade or roaming data change)
  PubSub.subscribe(
    PubSub.ChannelId.UpdateVisibleBoxes,
    function (visibleBoxes) {
      updateLevelOptions();
    },
  );

  function requiresPurchase(levelIndex) {
    if (isPaid) {
      return false;
    }

    if (edition.levelRequiresPurchase) {
      return edition.levelRequiresPurchase(
        BoxManager.currentBoxIndex,
        levelIndex,
      );
    }

    return false;
  }

  function onLevelClick(event) {
    var levelIndex = parseInt($(this).data("level"), 10);
    if (ScoreManager.isLevelUnlocked(BoxManager.currentBoxIndex, levelIndex)) {
      im.openLevel(levelIndex + 1);
    } else if (requiresPurchase(levelIndex)) {
      Dialogs.showPayDialog();
    } else {
      // no action
      return;
    }

    SoundMgr.playSound(ResourceId.SND_TAP);
  }

  // draw the level options based on current scores and stars
  function updateLevelOptions() {
    var boxIndex = BoxManager.currentBoxIndex,
      levelCount = ScoreManager.levelCount(boxIndex),
      $level,
      stars,
      $levelInfo,
      i,
      levelRequiresPurchase;

    for (i = 0; i < levelCount; i++) {
      // get a reference to the level button
      $level = $("#option" + (i + 1));
      if ($level) {
        // show and prepare the element, otherwise hide it
        if (i < levelCount) {
          $level.show();

          levelRequiresPurchase = requiresPurchase(i);

          // if the level has a score show it, otherwise make it locked
          stars = ScoreManager.getStars(boxIndex, i);
          if (stars != null) {
            $levelInfo = $("<div class='txt'/>")
              .append($(Text.drawBig({ text: i + 1, scaleToUI: true })))
              .append($("<div>").addClass("stars" + stars));

            $level
              .removeClass("locked purchase")
              .addClass("open ctrPointer")
              .empty()
              .append($levelInfo);
          } else {
            $level
              .removeClass("open")
              .addClass("locked")
              .toggleClass("purchase ctrPointer", levelRequiresPurchase)
              .empty();
          }
        } else {
          $level.hide();
        }
      }
    }

    // update the scores
    // currently assuming each level has three stars
    var text =
      ScoreManager.achievedStars(BoxManager.currentBoxIndex) +
      "/" +
      ScoreManager.levelCount(BoxManager.currentBoxIndex) * 3;
    Text.drawBig({ text: text, imgSel: "#levelScore img", scaleToUI: true });
    BoxManager.updateBoxLocks();
    ScoreManager.updateTotalScoreText();
  }

  return LevelPanel;
});
