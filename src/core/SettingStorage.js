import edition from "@/edition";
import PubSub from "@/utils/PubSub";

const editionPrefix = edition.settingPrefix || "";
const STORAGE_KEY = "cut-the-rope-data";

let prefix = editionPrefix;

PubSub.subscribe(PubSub.ChannelId.UserIdChanged, function (userId) {
    if (userId) {
        prefix = userId + "-" + editionPrefix;
    } else {
        prefix = editionPrefix;
    }
});

const settingCache = {};
let storageData = null;

const isPlainObject = (value) =>
    value != null && typeof value === "object" && !Array.isArray(value);

const cloneBucket = (bucket) => {
    if (!isPlainObject(bucket)) {
        return {};
    }

    const clone = {};

    for (const [key, value] of Object.entries(bucket)) {
        if (value != null) {
            clone[key] = value.toString();
        }
    }

    return clone;
};

const normalizeStorageData = (data) => {
    if (!isPlainObject(data)) {
        return {};
    }

    const normalized = {};
    const rootEntries = {};

    const assignToRoot = (key, value) => {
        if (value == null) {
            return;
        }

        rootEntries[key] = value.toString();
    };

    const handleBucketObject = (bucketKey, bucketValue) => {
        if (!isPlainObject(bucketValue)) {
            assignToRoot(bucketKey, bucketValue);
            return;
        }

        normalized[bucketKey] = cloneBucket(bucketValue);
    };

    if ("" in data && isPlainObject(data[""])) {
        const defaultBucket = data[""];
        delete data[""];
        for (const [key, value] of Object.entries(defaultBucket)) {
            assignToRoot(key, value);
        }
    }

    for (const [bucketKey, bucketValue] of Object.entries(data)) {
        if (bucketKey === "__global__") {
            if (isPlainObject(bucketValue)) {
                for (const [key, value] of Object.entries(bucketValue)) {
                    assignToRoot(key, value);
                }
            }

            continue;
        }

        handleBucketObject(bucketKey, bucketValue);
    }

    for (const [key, value] of Object.entries(rootEntries)) {
        normalized[key] = value;
    }

    return normalized;
};

const getCacheKey = (key) => `${prefix}::${key}`;

const ensureStorageLoaded = () => {
    if (storageData != null || !window.localStorage) {
        return;
    }

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        storageData = {};
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        storageData = normalizeStorageData(parsed);
    } catch (error) {
        console.warn("Failed to parse stored settings", error);
        storageData = {};
    }
};

const saveStorageData = () => {
    if (!window.localStorage) {
        return;
    }

    if (!storageData || Object.keys(storageData).length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
};

const getPrefixBucket = (createIfMissing = false) => {
    ensureStorageLoaded();

    if (!storageData) {
        storageData = {};
    }

    if (!prefix || prefix.length === 0) {
        return storageData;
    }

    let bucket = storageData[prefix];

    if (!isPlainObject(bucket)) {
        if (!createIfMissing) {
            return undefined;
        }

        bucket = {};
        storageData[prefix] = bucket;
    }

    return bucket;
};

const cacheValue = (key, value) => {
    if (value == null) {
        delete settingCache[getCacheKey(key)];
    } else {
        settingCache[getCacheKey(key)] = value;
    }
};

const persistValue = (key, value) => {
    const bucket = getPrefixBucket(value != null);

    if (!bucket) {
        return;
    }

    if (value == null) {
        delete bucket[key];

        if (prefix && prefix.length > 0 && Object.keys(bucket).length === 0) {
            delete storageData[prefix];
        }
    } else {
        bucket[key] = value;
    }

    saveStorageData();
};

const SettingStorage = {
    get: function (key) {
        if (!window.localStorage) {
            return null;
        }
        //console.log("GET",key);
        const cacheKey = getCacheKey(key);
        if (cacheKey in settingCache) {
            return settingCache[cacheKey];
        }

        const bucket = getPrefixBucket(false);
        if (bucket && key in bucket) {
            const value = bucket[key];
            cacheValue(key, value);
            return value;
        }

        return null;
    },
    set: function (key, value) {
        if (window.localStorage) {
            //console.log("SET",key,value);
            const cacheKey = getCacheKey(key);
            if (value == null) {
                delete settingCache[cacheKey];
                persistValue(key, null);
            } else {
                const stringValue = value.toString();
                settingCache[cacheKey] = stringValue;
                persistValue(key, stringValue);
            }
        }
    },
    remove: function (key) {
        if (window.localStorage) {
            //console.log("REMOVE",key)
            delete settingCache[getCacheKey(key)];
            persistValue(key, null);
        }
    },
    getBoolOrDefault: function (key, defaultValue) {
        const val = this.get(key);
        if (val == null) {
            return defaultValue;
        }
        return val === "true";
    },
    getIntOrDefault: function (key, defaultValue) {
        const val = this.get(key);
        if (val == null) {
            return defaultValue;
        }
        return parseInt(val, 10);
    },
};

export default SettingStorage;
