// putting all query strings in a central location so that we can easily add/remove for ship

// parse the query strings into a dictionary
const getQueryStrings = () => {
    /** @type {Record<string, string>} */
    const assoc: Record<string, string> = {};
    const queryString = location.search.substring(1) || "";
    const keyValues = queryString.split("&");
    const decode = (/** @type {string} */ s: string) => decodeURIComponent(s.replace(/\+/g, " "));

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
    static #params: Record<string, string> = qs;

    /**
     * Perform a case-insensitive substring check against the current URL.
     * @param {string} val
     */
    static #urlContains(val: string) {
        return window.location.href.toLowerCase().includes(val.toLowerCase());
    }

    /**
     * Parse a numeric parameter.
     * @param {string} key
     * @returns {number | null}
     */
    static #getInt(key: string): number | null {
        const raw = QueryStrings.#params[key];
        return raw == null || raw === "" ? null : parseInt(raw, 10);
    }

    /**
     * Evaluate a boolean flag encoded as `flagName=true`.
     * @param {string} flagName
     * @returns {boolean}
     */
    static #getFlag(flagName: string): boolean {
        return QueryStrings.#urlContains(`${flagName}=true`);
    }

    /** @type {string | undefined} */
    static lang: string | undefined = QueryStrings.#params["lang"];

    /** @type {boolean} */
    static showBoxBackgrounds: boolean = QueryStrings.#getFlag("boxBackgrounds");

    /** @type {boolean} */
    static showFrameRate: boolean = Boolean(
        import.meta.env.DEV || QueryStrings.#getFlag("showFrameRate")
    );

    /** @type {boolean} */
    static forceHtml5Audio: boolean = QueryStrings.#getFlag("html5audio");

    /**
     * Unlock all boxes (dev-only; returns undefined unless explicitly requested).
     * @type {true | undefined}
     */
    static unlockAllBoxes: true | undefined =
        import.meta.env.DEV || (QueryStrings.#getFlag("unlockAllBoxes") ? true : undefined);

    /**
     * Force the pinned box UI to display.
     * @type {boolean}
     */
    static forcePinnedBox: boolean = Boolean(
        QueryStrings.unlockAllBoxes || QueryStrings.#getFlag("enablePinnedBox")
    );

    /** @type {number | undefined} */
    static createScoresForBox: number | undefined =
        QueryStrings.#getInt("createScoresForBox") ?? undefined;

    /** @type {number | null} */
    static minFps: number | null = QueryStrings.#getInt("minFps");

    /** @type {number | null} */
    static box: number | null = QueryStrings.#getInt("box");

    /** @type {number | null} */
    static level: number | null = QueryStrings.#getInt("level");
}

export default QueryStrings;
