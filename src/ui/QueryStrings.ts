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

class QueryStrings {
    /**
     * Parsed query string parameters.
     * @type {Record<string, string>}
     */
    static #params = qs;

    /**
     * Perform a case-insensitive substring check against the current URL.
     * @param {string} val
     */
    static #urlContains(val) {
        return window.location.href.toLowerCase().includes(val.toLowerCase());
    }

    /**
     * Parse a numeric parameter.
     * @param {string} key
     * @returns {number | null}
     */
    static #getInt(key) {
        const raw = QueryStrings.#params[key];
        return raw == null || raw === "" ? null : parseInt(raw, 10);
    }

    /**
     * Evaluate a boolean flag encoded as `flagName=true`.
     * @param {string} flagName
     * @returns {boolean}
     */
    static #getFlag(flagName) {
        return QueryStrings.#urlContains(`${flagName}=true`);
    }

    /** @type {string | undefined} */
    static lang = QueryStrings.#params["lang"];

    /** @type {boolean} */
    static showBoxBackgrounds = QueryStrings.#getFlag("boxBackgrounds");

    /** @type {boolean} */
    static showFrameRate = Boolean(import.meta.env.DEV || QueryStrings.#getFlag("showFrameRate"));

    /** @type {boolean} */
    static forceHtml5Audio = QueryStrings.#getFlag("html5audio");

    /**
     * Unlock all boxes (dev-only; returns undefined unless explicitly requested).
     * @type {true | undefined}
     */
    static unlockAllBoxes = import.meta.env.DEV || (QueryStrings.#getFlag("unlockAllBoxes") ? true : undefined);

    /**
     * Force the pinned box UI to display.
     * @type {boolean}
     */
    static forcePinnedBox = Boolean(QueryStrings.unlockAllBoxes || QueryStrings.#getFlag("enablePinnedBox"));

    /** @type {number | undefined} */
    static createScoresForBox = QueryStrings.#getInt("createScoresForBox") ?? undefined;

    /** @type {number | null} */
    static minFps = QueryStrings.#getInt("minFps");

    /** @type {number | null} */
    static box = QueryStrings.#getInt("box");

    /** @type {number | null} */
    static level = QueryStrings.#getInt("level");
}

export default QueryStrings;
