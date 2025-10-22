import platform from "@/platform";
import edition from "@/edition";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import PubSub from "@/utils/PubSub";
import analytics from "@/analytics";
const SocialHelper = new (function () {
    this.siteUrl = edition.siteUrl;

    // cuttherope.ie and cuttherope.net
    this.appId = "278847552173744";

    // check for test domain (seperate FB app ids)
    const host = window.location.host || "";
    if (host.indexOf("thinkpixellab") >= 0) {
        // thinkpixellab.com
        this.appId = "239041062884795";
    } else if (host.indexOf(".dev") >= 0) {
        // ctr-net.dev
        this.appId = "261043477350153";
    }

    // listen to language changes
    PubSub.subscribe(PubSub.ChannelId.LanguageChanged, () => {
        this.siteDescription = Lang.menuText(MenuStringId.SITE_DESC);
        this.siteName = Lang.menuText(MenuStringId.SITE_TITLE);
        this.siteActions = [
            {
                name: Lang.menuText(MenuStringId.SITE_ACTION),
                link: edition.siteUrl,
            },
        ];
    });

    this.initFB = function () {
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
    };

    // remember to return true in the callback
    this.postToFeed = function (caption, description, imageurl, callback) {
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
    };

    this.initTwitter = function (twttr) {
        // report tweets from users
        twttr["events"]["bind"]("tweet", function (event) {
            if (analytics.onTweet) {
                analytics.onTweet();
            }
        });
    };
})();

export default SocialHelper;
