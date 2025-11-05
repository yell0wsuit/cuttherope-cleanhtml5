/** @typedef {import("@/types/json").JsonCacheEntry} JsonCacheEntry */
/** @typedef {import("@/types/json").LevelJson} LevelJson */
/** @typedef {import("@/types/json").LoadedLevelEntry} LoadedLevelEntry */
/** @typedef {import("@/types/json").RawBoxMetadataJson} RawBoxMetadataJson */

/**
 * Helper function to load and parse JSON from a URL
 * @param {string | URL | Request} url
 * @returns {Promise<unknown>}
 */
const loadJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch (error) {
        window.console?.error?.("Failed to parse JSON:", url, error);
        throw error;
    }
};

class JsonLoader {
    constructor() {
        /** @type {boolean} */
        this.menuJsonLoadComplete = false;

        /** @type {number} */
        this.loadedJsonFiles = 0;

        /** @type {number} */
        this.failedJsonFiles = 0;

        /** @type {number} */
        this.totalJsonFiles = 0;

        /** @type {(() => void) | null} */
        this.checkCompleteCallback = null;

        /** @type {((loaded: number, total: number) => void) | null} */
        this.progressCallback = null;

        /** @type {Map<string, JsonCacheEntry>} */
        this.jsonCache = new Map();
    }

    getJsonFileCount() {
        return this.totalJsonFiles;
    }

    /**
     * @param {(loaded: number, total: number) => void} callback
     */
    onProgress(callback) {
        this.progressCallback = callback;
    }

    /**
     * @param {() => void} callback
     */
    onMenuComplete(callback) {
        this.checkCompleteCallback = callback;
    }

    async start() {
        // Use the configured base from vite config
        const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

        try {
            // First, load the box metadata to get level counts
            const boxMetadataUrl = `${baseUrl}/data/config/editions/net-box-text.json`;
            const boxMetadata = /** @type {RawBoxMetadataJson[]} */ (
                await loadJson(boxMetadataUrl)
            );
            this.jsonCache.set("boxMetadata", boxMetadata);

            /**
             * Files queued for JSON loading.
             * @type {Array<{ url: string; key: string; type: "level" }>}
             */
            const levelFiles = [];

            // Queue level files based on levelCount from metadata
            boxMetadata.forEach((box, index) => {
                if (box.levelCount && typeof box.levelCount === "number") {
                    const boxStr = String(index).padStart(2, "0");
                    for (let level = 1; level <= box.levelCount; level++) {
                        const levelStr = String(level).padStart(2, "0");
                        levelFiles.push({
                            url: `${baseUrl}/data/boxes/levels/${boxStr}-${levelStr}.json`,
                            key: `level-${boxStr}-${levelStr}`,
                            type: "level",
                        });
                    }
                }
            });

            // Set total to metadata (1) + level files
            this.totalJsonFiles = 1 + levelFiles.length;
            this.loadedJsonFiles = 1; // Box metadata already loaded

            if (this.progressCallback) {
                this.progressCallback(this.loadedJsonFiles, this.totalJsonFiles);
            }

            // Load all level JSON files
            const promises = levelFiles.map(async ({ url, key, type }) => {
                try {
                    const data = await loadJson(url);
                    this.jsonCache.set(key, /** @type {LevelJson} */ (data));
                    this.loadedJsonFiles++;
                    if (this.progressCallback) {
                        this.progressCallback(this.loadedJsonFiles, this.totalJsonFiles);
                    }
                    return { success: true, key };
                } catch (error) {
                    // Silent fail for level files that might not exist
                    this.loadedJsonFiles++;
                    if (this.progressCallback) {
                        this.progressCallback(this.loadedJsonFiles, this.totalJsonFiles);
                    }
                    return { success: false, key, silent: true };
                }
            });

            await Promise.all(promises);
            this.menuJsonLoadComplete = true;
            if (this.checkCompleteCallback) {
                this.checkCompleteCallback();
            }
        } catch (error) {
            this.failedJsonFiles++;
            window.console?.error?.("Failed to load box metadata", error);
            this.menuJsonLoadComplete = true;
            if (this.checkCompleteCallback) {
                this.checkCompleteCallback();
            }
        }
    }

    /**
     * @param {string} key
     * @returns {JsonCacheEntry | undefined}
     */
    getJson(key) {
        return this.jsonCache.get(key);
    }

    /**
     * @returns {Map<string, LoadedLevelEntry[]>}
     */
    getAllLevels() {
        /** @type {Map<string, LoadedLevelEntry[]>} */
        const levels = new Map();
        for (const [key, value] of this.jsonCache.entries()) {
            if (key.startsWith("level-")) {
                const match = key.match(/level-(\d{2})-(\d{2})/);
                if (match) {
                    const [, boxNumber, levelNumber] = match;
                    if (!levels.has(boxNumber)) {
                        levels.set(boxNumber, []);
                    }
                    levels.get(boxNumber)?.push({
                        levelNumber,
                        level: /** @type {LevelJson} */ (value),
                    });
                }
            }
        }
        return levels;
    }

    /**
     * @returns {RawBoxMetadataJson[] | undefined}
     */
    getBoxMetadata() {
        const metadata = this.jsonCache.get("boxMetadata");
        if (Array.isArray(metadata)) {
            return metadata;
        }
        return undefined;
    }
}

// Export a singleton instance
export default new JsonLoader();
