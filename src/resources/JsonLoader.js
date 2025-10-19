import platform from "@/platform";

let menuJsonLoadComplete = false;
let loadedJsonFiles = 0;
let failedJsonFiles = 0;
let totalJsonFiles = 0;
let checkCompleteCallback = null;
let progressCallback = null;

// Cache for loaded JSON data
const jsonCache = new Map();

const loadJson = (url) => {
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            window.console?.error?.("Failed to load JSON:", url, error);
            throw error;
        });
};

const JsonLoader = {
    init: function () {
        menuJsonLoadComplete = false;
        loadedJsonFiles = 0;
        failedJsonFiles = 0;
        totalJsonFiles = 0;
        jsonCache.clear();
    },

    getJsonFileCount: function () {
        return totalJsonFiles;
    },

    onProgress: function (callback) {
        progressCallback = callback;
    },

    onMenuComplete: function (callback) {
        checkCompleteCallback = callback;
    },

    start: function () {
        // Use the configured base from vite config
        const baseUrl = import.meta.env.BASE_URL || "/";
        const jsonFiles = [];

        // Queue box metadata JSON
        jsonFiles.push({
            url: `${baseUrl}data/config/editions/net-box-text.json`,
            key: "boxMetadata",
        });

        // Queue all level JSON files (01-01 through 11-25)
        for (let box = 1; box <= 11; box++) {
            for (let level = 1; level <= 25; level++) {
                const boxStr = String(box).padStart(2, "0");
                const levelStr = String(level).padStart(2, "0");
                jsonFiles.push({
                    url: `${baseUrl}data/boxes/levels/${boxStr}-${levelStr}.json`,
                    key: `level-${boxStr}-${levelStr}`,
                });
            }
        }

        totalJsonFiles = jsonFiles.length;

        // Load all JSON files
        const promises = jsonFiles.map(({ url, key }) => {
            return loadJson(url)
                .then((data) => {
                    jsonCache.set(key, data);
                    loadedJsonFiles++;
                    if (progressCallback) {
                        progressCallback(loadedJsonFiles, totalJsonFiles);
                    }
                    return { success: true, key };
                })
                .catch((error) => {
                    // Silent fail for level files that might not exist
                    if (key.startsWith("level-")) {
                        loadedJsonFiles++;
                        if (progressCallback) {
                            progressCallback(loadedJsonFiles, totalJsonFiles);
                        }
                        return { success: false, key, silent: true };
                    }

                    failedJsonFiles++;
                    window.console?.error?.(`Failed to load JSON: ${key}`, error);
                    if (progressCallback) {
                        progressCallback(loadedJsonFiles, totalJsonFiles);
                    }
                    return { success: false, key };
                });
        });

        Promise.all(promises).then(() => {
            menuJsonLoadComplete = true;
            if (checkCompleteCallback) {
                checkCompleteCallback();
            }
        });
    },

    getJson: function (key) {
        return jsonCache.get(key);
    },

    getAllLevels: function () {
        const levels = new Map();
        for (const [key, value] of jsonCache.entries()) {
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
    },

    getBoxMetadata: function () {
        return jsonCache.get("boxMetadata");
    },
};

export default JsonLoader;
