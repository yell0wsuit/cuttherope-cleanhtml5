define("ctrExports", [
  "config/exports/CtrExport",
  "ui/QueryStrings",
  "ui/SocialHelper",
  "game/CTRSettings",
  "utils/PubSub",
], function (ctrExport, QueryStrings, SocialHelper, settings, PubSub) {
  ctrExport("forceHTML5Audio", QueryStrings.forceHtml5Audio);

  window["showFpsCounter"] = function () {
    settings.fpsEnabled = true;
  };

  ctrExport("initFB", SocialHelper.initFB);
  ctrExport("initTwitter", SocialHelper.initTwitter);

  ctrExport("onLevelWon", function (callback) {
    PubSub.subscribe(PubSub.ChannelId.LevelWon, function (info) {
      // don't pass along the level info, just tell subscriber
      // that the level completed
      callback();
    });
  });

  ctrExport("pauseGame", function () {
    PubSub.publish(PubSub.ChannelId.PauseGame);
  });

  ctrExport("enable", function () {
    PubSub.publish(PubSub.ChannelId.EnableGame);
  });

  ctrExport("disable", function () {
    PubSub.publish(PubSub.ChannelId.DisableGame);
  });

  return window["ZeptoLab"];
});
