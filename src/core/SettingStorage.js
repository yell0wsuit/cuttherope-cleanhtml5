import edition from "@/config/editions/net-edition";
import PubSub from "@/utils/PubSub";

class SettingStorage {
    static STORAGE_KEY = "ctr-js-data";

    constructor() {
        /** @type {edition} */
        const editionConfig = /** @type {edition} */ (edition);
        this.editionPrefix = editionConfig.settingPrefix || "";
        this.prefix = this.editionPrefix;

        /** @type {Object<string, string>} */
        this.settingCache = {};

        // Subscribe to user ID changes
        PubSub.subscribe(PubSub.ChannelId.UserIdChanged, (/** @type {string} */ userId) => {
            this.prefix = userId ? `${userId}-${this.editionPrefix}` : this.editionPrefix;
        });

        // Run migration once
        this.migrateOldData();
    }

    /**
     * Migration: consolidate existing localStorage keys into the single storage object
     */
    migrateOldData() {
        if (!window.localStorage) return;

        const existingData = localStorage.getItem(SettingStorage.STORAGE_KEY);
        if (existingData) return; // Already migrated

        /** @type {Object<string, string | null>} */
        const dataToMigrate = {};
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key !== SettingStorage.STORAGE_KEY) {
                const value = localStorage.getItem(key);
                dataToMigrate[key] = value;
                keysToRemove.push(key);
            }
        }

        if (Object.keys(dataToMigrate).length > 0) {
            localStorage.setItem(SettingStorage.STORAGE_KEY, JSON.stringify(dataToMigrate));
            keysToRemove.forEach((key) => localStorage.removeItem(key));
        } else {
            localStorage.setItem(SettingStorage.STORAGE_KEY, JSON.stringify({}));
        }
    }

    /**
     * Get all data from consolidated storage
     * @returns {Object<string, string>}
     */
    getAllData() {
        if (!window.localStorage) return {};
        try {
            const data = localStorage.getItem(SettingStorage.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("Error parsing localStorage data:", e);
            return {};
        }
    }

    /**
     * Save data to consolidated storage
     * @param {Object<string, string>} data
     */
    saveAllData(data) {
        if (!window.localStorage) return;
        try {
            localStorage.setItem(SettingStorage.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving localStorage data:", e);
        }
    }

    /**
     * Get setting by key
     * @param {string} key
     * @returns {string | null}
     */
    get(key) {
        if (!window.localStorage) return null;
        if (key in this.settingCache) return this.settingCache[key];
        const data = this.getAllData();
        return data[this.prefix + key] || null;
    }

    /**
     * Set setting value
     * @param {string} key
     * @param {string | number | null} value
     */
    set(key, value) {
        if (!window.localStorage) return;
        const data = this.getAllData();
        const fullKey = this.prefix + key;

        if (value == null) {
            delete this.settingCache[key];
            delete data[fullKey];
        } else {
            const strVal = value.toString();
            this.settingCache[key] = strVal;
            data[fullKey] = strVal;
        }

        this.saveAllData(data);
    }

    /**
     * Remove setting by key
     * @param {string} key
     */
    remove(key) {
        if (!window.localStorage) return;
        delete this.settingCache[key];
        const data = this.getAllData();
        delete data[this.prefix + key];
        this.saveAllData(data);
    }

    /**
     * Get boolean value with default
     * @param {string} key
     * @param {boolean | null} defaultValue
     * @returns {boolean | null}
     */
    getBoolOrDefault(key, defaultValue) {
        const val = this.get(key);
        return val == null ? defaultValue : val === "true";
    }

    /**
     * Get integer value with default
     * @param {string} key
     * @param {number | null} defaultValue
     * @returns {number | null}
     */
    getIntOrDefault(key, defaultValue) {
        const val = this.get(key);
        return val == null ? defaultValue : parseInt(val, 10);
    }
}

// Export singleton instance
export default new SettingStorage();
