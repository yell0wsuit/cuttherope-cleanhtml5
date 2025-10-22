// putting all query strings in a central location so that we can easily add/remove for ship
const QueryStrings = new (function () {
    // parse the query strings into a dictionary
    function getQueryStrings() {
        const assoc = {},
            queryString = location.search.substring(1) || "",
            keyValues = queryString.split("&"),
            decode = function (s) {
                return decodeURIComponent(s.replace(/\+/g, " "));
            };
        let i, len, kv;

        for (i = 0, len = keyValues.length; i < len; i++) {
            kv = keyValues[i].split("=");
            if (kv.length > 1) {
                assoc[decode(kv[0])] = decode(kv[1]);
            }
        }
        return assoc;
    }

    const qs = getQueryStrings();

    // case insensitive lookup
    const urlContains = function (val) {
        const url = window.location.href.toLowerCase();
        return url.indexOf(val.toLowerCase()) >= 0;
    };

    // debug querystrings
    /*if (false || false) {
        this.box = qs["box"] == null ? null : parseInt(qs["box"], 10);
        this.level = qs["level"] == null ? null : parseInt(qs["level"], 10);
        this.minFps = qs["minFps"] == null ? null : parseInt(qs["minFps"], 10);
        this.unlockAllBoxes =
            (this.box != null && this.level != null) || urlContains("unlockAllBoxes=true");
        this.forcePinnedBox = this.unlockAllBoxes || urlContains("enablePinnedBox=true");
        this.createScoresForBox =
            qs["createScoresForBox"] == null ? null : parseInt(qs["createScoresForBox"], 10);
    }*/

    // these are ok to leave in for ship
    this.lang = qs["lang"];
    this.showBoxBackgrounds = urlContains("boxBackgrounds=true");
    this.showFrameRate = urlContains("showFrameRate=true");
    this.forceHtml5Audio = urlContains("html5audio=true");

    // for testing
    if (import.meta.env.DEV) {
        this.unlockAllBoxes = true;
        this.showFrameRate = true;
    }
})();

export default QueryStrings;
