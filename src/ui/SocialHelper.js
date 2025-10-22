import platform from "@/platform";
import edition from "@/edition";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import PubSub from "@/utils/PubSub";
import analytics from "@/analytics";

// check for test domain (separate FB app ids)
const host = window.location.host || "";
let appId = "278847552173744"; // cuttherope.ie and cuttherope.net

if (host.indexOf("thinkpixellab") >= 0) {
    // thinkpixellab.com
    appId = "239041062884795";
} else if (host.indexOf(".dev") >= 0) {
    // ctr-net.dev
    appId = "261043477350153";
}

const SocialHelper = {
    siteUrl: edition.siteUrl,
    appId,
    siteDescription: undefined,
    siteName: undefined,
    siteActions: undefined,

    initFB: function () {
        // NOTE: must create settings this way to prevent obfuscation
        const fbInitSettings = {};
        fbInitSettings["appId"] = this.appId;
        fbInitSettings["status"] = true;
        fbInitSettings["cookie"] = true;
        fbInitSettings["xfbml"] = true;
        let FB;
        FB.init(fbInitSettings);

        // report facebook likes
        FB.Event.subscribe("edge.create", function (response) {
            if (analytics.onFacebookLike) {
                analytics.onFacebookLike();
            }
        });
    },

    // remember to return true in the callback
    postToFeed: function (caption, description, imageurl, callback) {
        // see if the platform has custom sharing
        if (platform.customSharing) {
            PubSub.publish(PubSub.ChannelId.Share, caption, description, imageurl);
        } else {
            // otherwise, we'll default to using facebook

            // NOTE: must create settings this way to prevent obfuscation
            const publish = {};
            publish["method"] = "feed";
            publish["name"] = this.siteName;
            publish["caption"] = caption;
            publish["description"] = description;
            publish["link"] = this.siteUrl;
            publish["picture"] = imageurl;
            publish["actions"] = this.siteActions;

            let FB;
            FB.ui(publish, callback);
        }
    },

    initTwitter: function (twttr) {
        // report tweets from users
        twttr["events"]["bind"]("tweet", function (event) {
            if (analytics.onTweet) {
                analytics.onTweet();
            }
        });
    },
};

// listen to language changes
PubSub.subscribe(PubSub.ChannelId.LanguageChanged, () => {
    SocialHelper.siteDescription = Lang.menuText(MenuStringId.SITE_DESC);
    SocialHelper.siteName = Lang.menuText(MenuStringId.SITE_TITLE);
    SocialHelper.siteActions = [
        {
            name: Lang.menuText(MenuStringId.SITE_ACTION),
            link: edition.siteUrl,
        },
    ];
});

export default SocialHelper;
