import edition from "@/config/editions/net-edition";
import PubSub from "@/utils/PubSub";

/**
 * @typedef {Object} Edition
 * @property {string} settingPrefix - Prefix for localStorage keys
 */

const STORAGE_KEY = "ctr-js-data";
const editionPrefix = /** @type {Edition} */ (edition).settingPrefix || "";
let prefix = editionPrefix;

PubSub.subscribe(PubSub.ChannelId.UserIdChanged, function (/** @type {string} */ userId) {
    if (userId) {
        prefix = `${userId}-${editionPrefix}`;
    } else {
        prefix = editionPrefix;
    }
});

/**
 * Migration: consolidate existing localStorage keys into the single storage object
 */
function migrateOldData() {
    if (!window.localStorage) {
        return;
    }

    // Check if we've already migrated
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (existingData) {
        return; // Already migrated
    }

    /** @type {Object<string, string | null>} */
    const dataToMigrate = {};
    const keysToRemove = [];

    // Iterate through all localStorage keys and find game-related ones
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== STORAGE_KEY) {
            // Check if this is likely a game key (starts with common prefixes)
            // or contains patterns like 'bp', 'bs', 'music', 'sound', etc.
            const value = localStorage.getItem(key);
            dataToMigrate[key] = value;
            keysToRemove.push(key);
        }
    }

    // Save all data to the new consolidated key
    if (Object.keys(dataToMigrate).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToMigrate));

        // Remove old keys
        keysToRemove.forEach((key) => {
            localStorage.removeItem(key);
        });
    } else {
        // No data to migrate, but create the storage key
        localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    }
}

/**
 * Get all data from the consolidated storage
 * @returns {Object<string, string>} The parsed data object from localStorage
 */
function getAllData() {
    if (!window.localStorage) {
        return {};
    }

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Error parsing localStorage data:", e);
        return {};
    }
}

/**
 * Save all data to the consolidated storage
 * @param {Object<string, string>} data - The data object to save to localStorage
 */
function saveAllData(data) {
    if (!window.localStorage) {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error saving localStorage data:", e);
    }
}

// Run migration on initialization
migrateOldData();

/** @type {Object<string, string>} */
const settingCache = {};

const SettingStorage = {
    /**
     * Get a setting value by key
     * @param {string} key - The setting key to retrieve
     * @returns {string | null} The setting value or null if not found
     */
    get(key) {
        if (!window.localStorage) {
            return null;
        }
        //console.log("GET",key);
        if (key in settingCache) {
            return settingCache[key];
        }

        const data = getAllData();
        return data[prefix + key] || null;
    },
    /**
     * Set a setting value by key
     * @param {string} key - The setting key to set
     * @param {string | number | null} value - The value to store (will be converted to string)
     */
    set(key, value) {
        if (window.localStorage) {
            //console.log("SET",key,value);
            const data = getAllData();
            const fullKey = prefix + key;

            if (value == null) {
                delete settingCache[key];
                delete data[fullKey];
            } else {
                settingCache[key] = value.toString();
                data[fullKey] = value.toString();
            }

            saveAllData(data);
        }
    },
    /**
     * Remove a setting by key
     * @param {string} key - The setting key to remove
     */
    remove(key) {
        if (window.localStorage) {
            //console.log("REMOVE",key)
            delete settingCache[key];

            const data = getAllData();
            delete data[prefix + key];
            saveAllData(data);
        }
    },
    /**
     * Get a boolean setting value with a default fallback
     * @param {string} key - The setting key to retrieve
     * @param {boolean | null} defaultValue - The default value to return if key is not found
     * @returns {boolean | null} The boolean value or the default value
     */
    getBoolOrDefault(key, defaultValue) {
        const val = this.get(key);
        if (val == null) {
            return defaultValue;
        }
        return val === "true";
    },
    /**
     * Get an integer setting value with a default fallback
     * @param {string} key - The setting key to retrieve
     * @param {number | null} defaultValue - The default value to return if key is not found
     * @returns {number | null} The parsed integer value or the default value
     */
    getIntOrDefault(key, defaultValue) {
        const val = this.get(key);
        if (val == null) {
            return defaultValue;
        }
        return parseInt(val, 10);
    },
};

export default SettingStorage;
