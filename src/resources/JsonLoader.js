import platform from "@/config/platforms/platform-web";

/**
 * Helper function to load and parse JSON from a URL
 * @param {string | URL | Request} url
 * @returns {Promise<any>}
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

        /** @type {Map<string, any>} */
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

    start() {
        // Use the configured base from vite config
        const baseUrl = import.meta.env.BASE_URL || "/";
        const jsonFiles = [];

        // Queue box metadata JSON
        jsonFiles.push({
            url: `${baseUrl}data/config/editions/net-box-text.json`,
            key: "boxMetadata",
        });

        // Queue all level JSON files (00-01 through 11-25)
        for (let box = 0; box <= 11; box++) {
            for (let level = 1; level <= 25; level++) {
                const boxStr = String(box).padStart(2, "0");
                const levelStr = String(level).padStart(2, "0");
                jsonFiles.push({
                    url: `${baseUrl}data/boxes/levels/${boxStr}-${levelStr}.json`,
                    key: `level-${boxStr}-${levelStr}`,
                });
            }
        }

        this.totalJsonFiles = jsonFiles.length;

        // Load all JSON files
        const promises = jsonFiles.map(async ({ url, key }) => {
            try {
                const data = await loadJson(url);
                this.jsonCache.set(key, data);
                this.loadedJsonFiles++;
                if (this.progressCallback) {
                    this.progressCallback(this.loadedJsonFiles, this.totalJsonFiles);
                }
                return { success: true, key };
            } catch (error) {
                // Silent fail for level files that might not exist
                if (key.startsWith("level-")) {
                    this.loadedJsonFiles++;
                    if (this.progressCallback) {
                        this.progressCallback(this.loadedJsonFiles, this.totalJsonFiles);
                    }
                    return { success: false, key, silent: true };
                }

                this.failedJsonFiles++;
                window.console?.error?.(`Failed to load JSON: ${key}`, error);
                if (this.progressCallback) {
                    this.progressCallback(this.loadedJsonFiles, this.totalJsonFiles);
                }
                return { success: false, key };
            }
        });

        Promise.all(promises).then(() => {
            this.menuJsonLoadComplete = true;
            if (this.checkCompleteCallback) {
                this.checkCompleteCallback();
            }
        });
    }

    /**
     * @param {string} key
     * @returns {any}
     */
    getJson(key) {
        return this.jsonCache.get(key);
    }

    /**
     * @returns {Map<string, Array<{levelNumber: string, level: any}>>}
     */
    getAllLevels() {
        const levels = new Map();
        for (const [key, value] of this.jsonCache.entries()) {
            if (key.startsWith("level-")) {
                const match = key.match(/level-(\d{2})-(\d{2})/);
                if (match) {
                    const [, boxNumber, levelNumber] = match;
                    if (!levels.has(boxNumber)) {
                        levels.set(boxNumber, []);
                    }
                    levels.get(boxNumber).push({ levelNumber, level: value });
                }
            }
        }
        return levels;
    }

    /**
     * @returns {any}
     */
    getBoxMetadata() {
        return this.jsonCache.get("boxMetadata");
    }
}

// Export a singleton instance
export default new JsonLoader();
