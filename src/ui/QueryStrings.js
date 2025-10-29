// putting all query strings in a central location so that we can easily add/remove for ship

// parse the query strings into a dictionary
const getQueryStrings = () => {
    /** @type {Record<string, string>} */
    const assoc = {};
    const queryString = location.search.substring(1) || "";
    const keyValues = queryString.split("&");
    const decode = (/** @type {string} */ s) => decodeURIComponent(s.replace(/\+/g, " "));

    for (let i = 0, len = keyValues.length; i < len; i++) {
        const kv = keyValues[i].split("=");
        if (kv.length > 1) {
            assoc[decode(kv[0])] = decode(kv[1]);
        }
    }
    return assoc;
};

const qs = getQueryStrings();

// case insensitive lookup
const urlContains = (/** @type {string} */ val) => {
    const url = window.location.href.toLowerCase();
    return url.indexOf(val.toLowerCase()) >= 0;
};

// debug querystrings
/*if (false || false) {
    QueryStrings.box = qs["box"] == null ? null : parseInt(qs["box"], 10);
    QueryStrings.level = qs["level"] == null ? null : parseInt(qs["level"], 10);
    QueryStrings.minFps = qs["minFps"] == null ? null : parseInt(qs["minFps"], 10);
    QueryStrings.unlockAllBoxes =
        (QueryStrings.box != null && QueryStrings.level != null) || urlContains("unlockAllBoxes=true");
    QueryStrings.forcePinnedBox = QueryStrings.unlockAllBoxes || urlContains("enablePinnedBox=true");
    QueryStrings.createScoresForBox =
        qs["createScoresForBox"] == null ? null : parseInt(qs["createScoresForBox"], 10);
}*/

const QueryStrings = {
    // these are ok to leave in for ship
    lang: qs["lang"],
    showBoxBackgrounds: urlContains("boxBackgrounds=true"),
    showFrameRate: import.meta.env.DEV || urlContains("showFrameRate=true"),
    forceHtml5Audio: urlContains("html5audio=true"),

    // for testing
    unlockAllBoxes: import.meta.env.DEV || undefined,
    createScoresForBox: undefined,
    minFps: qs["minFps"] == null ? null : parseInt(qs["minFps"], 10),
    box: qs["box"] == null ? null : parseInt(qs["box"], 10),
    level: qs["level"] == null ? null : parseInt(qs["level"], 10),
};

export default QueryStrings;
