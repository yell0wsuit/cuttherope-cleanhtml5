import ctrExport from "@/config/exports/CtrExport";
import QueryStrings from "@/ui/QueryStrings";
import PubSub from "@/utils/PubSub";
ctrExport("forceHTML5Audio", QueryStrings.forceHtml5Audio);

/*window["showFpsCounter"] = () => {
    settings.fpsEnabled = true;
};*/

/*ctrExport("initFB", SocialHelper.initFB);
ctrExport("initTwitter", SocialHelper.initTwitter);*/

ctrExport("onLevelWon", function (/** @type {() => void} */ callback) {
    PubSub.subscribe(PubSub.ChannelId.LevelWon, () => {
        // don't pass along the level info, just tell subscriber
        // that the level completed
        callback();
    });
});

ctrExport("pauseGame", () => {
    PubSub.publish(PubSub.ChannelId.PauseGame);
});

ctrExport("enable", () => {
    PubSub.publish(PubSub.ChannelId.EnableGame);
});

ctrExport("disable", () => {
    PubSub.publish(PubSub.ChannelId.DisableGame);
});

export default window["ZeptoLab"];
