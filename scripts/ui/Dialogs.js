define("ui/Dialogs", [
  "game/CTRRootController",
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
], function (
  RootController,
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
) {
  // show a popup
  var Dialogs = {
    showPopup: function (contentDivId) {
      RootController.pauseLevel();
      $(".popupOuterFrame").hide();
      $(".popupInnerFrame").hide();
      $("#popupWindow").fadeIn(500, function () {
        $("#" + contentDivId).show();
        $(".popupOuterFrame").fadeIn(500);
      });
    },

    closePopup: function () {
      SoundMgr.playSound(ResourceId.SND_TAP);
      $("#popupWindow").fadeOut(500, function () {
        RootController.resumeLevel();
      });
    },

    showPayDialog: function () {
      SoundMgr.playSound(ResourceId.SND_TAP);
      Dialogs.showPopup("payDialog");
    },

    showSlowComputerPopup: function () {
      // remove the text images
      var $slowComputer = $("#slowComputer");
      $slowComputer.children("img").remove();

      // add the title and text
      var $titleImg = $(
          Text.drawBig({
            text: Lang.menuText(MenuStringId.SLOW_TITLE),
            alignment: Alignment.CENTER,
            width: 1200 * resolution.CANVAS_SCALE,
            scale: 1.25 * resolution.UI_TEXT_SCALE,
          }),
        ),
        $textImg = $(
          Text.drawBig({
            text: Lang.menuText(MenuStringId.SLOW_TEXT),
            width: 1200 * resolution.CANVAS_SCALE,
            scale: 0.8 * resolution.UI_TEXT_SCALE,
          }),
        );

      $textImg.css("margin-left", resolution.uiScaledNumber(30));
      $slowComputer.append($titleImg).append($textImg);

      // shrink button text slightly so it will fit in RU and DE
      Text.drawBig({
        text: Lang.menuText(MenuStringId.LETS_PLAY),
        imgSel: "#slowComputerBtn img",
        scale: 0.8 * resolution.UI_TEXT_SCALE,
      });

      Dialogs.showPopup("slowComputer");
    },
  };

  function onPayClick() {
    PubSub.publish(PubSub.ChannelId.PurchaseBoxesPrompt);
    Dialogs.closePopup();
  }

  // localize dialog text
  PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
    Text.drawBig({
      text: Lang.menuText(MenuStringId.UPGRADE_TO_FULL),
      imgParentId: "payMessage",
      width: resolution.uiScaledNumber(650),
      alignment: Alignment.CENTER,
      scale: 0.8 * resolution.UI_TEXT_SCALE,
    });

    Text.drawBig({
      text: Lang.menuText(MenuStringId.BUY_FULL_GAME),
      imgParentId: "payBtn",
      scale: 0.6 * resolution.UI_TEXT_SCALE,
    });
  });

  $(function () {
    // trigger purchase when pay button is clicked
    $("#payImg").click(onPayClick);
    $("#payBtn").click(onPayClick);

    // close dialog buttons
    $("#payClose").click(Dialogs.closePopup);
    $("#slowComputerBtn").click(Dialogs.closePopup);
    $("#missingOkBtn").click(Dialogs.closePopup);
    $("#resetNoBtn").click(Dialogs.closePopup);
  });

  return Dialogs;
});
