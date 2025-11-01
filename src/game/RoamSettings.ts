import edition from "@/config/editions/net-edition";
import PubSub from "@/utils/PubSub";
let currentUserId = "";
PubSub.subscribe(PubSub.ChannelId.UserIdChanged, function (/** @type {string} */ userId) {
    currentUserId = userId;
});

/**
 * @type {{ get: any; remove: any; set: any; } | null}
 */
let roamingProvider = null;
PubSub.subscribe(
    PubSub.ChannelId.RoamingSettingProvider,
    function (/** @type {{ [x: string]: any; }} */ provider) {
        // copy methods (which will be minified)
        if (provider) {
            roamingProvider = {
                set: provider["set"],
                get: provider["get"],
                remove: provider["remove"],
            };
        } else {
            roamingProvider = null;
        }

        PubSub.publish(PubSub.ChannelId.RoamingDataChanged);
    }
);

const SCORES_PREFIX = "scores",
    STARS_PREFIX = "stars",
    ACHIEVEMENTS_PREFIX = "achievements";

// appends the current user's id to the key prefix
/**
 * @param {string} prefix
 * @param {number} [boxIndex]
 */
function getFullKey(prefix, boxIndex) {
    let key = prefix;
    if (currentUserId) {
        key += `-${currentUserId}`;
    }

    return key;
}

/* Unfortunately Windows doesn't tell us which value changed. Keeping this
       code in case we ever intergrate with another settings store that does
    function onSettingChanged(key, value) {

        let parts = (key || '').split('-');
        if (parts.length === 0) {
            return;
        }

        let userId, boxIndex, levelIndex, achievementIndex;
        switch(parts[0]) {
            case SCORES_PREFIX:
            case STARS_PREFIX:
                let userId = (parts.length === 3) ? parts[2] : '';
                if (userId === currentUserId) {
                    // only need to change data for current user
                }
                break;
            case ACHIEVEMENTS_PREFIX:
                let userId = (parts.length === 2) ? parts[1] : '';
                if (userId === currentUserId) {
                    // only need to change data for current user
                }
                break;
        }
    }
    */

// deserializes hex (and possibly undefined or null values) from a string
/**
 * @param {string} keyPrefix
 */
function getHexValues(keyPrefix) {
    if (!roamingProvider) {
        return null;
    }

    const key = getFullKey(keyPrefix);
    const values = [];
    const rawValues = (roamingProvider.get(key) || "").split(","); // split csv
    const len = rawValues.length;

    let i, val;

    for (i = 0; i < len; i++) {
        if (i < rawValues.length) {
            // parse value which is stored in hex
            val = parseInt(rawValues[i], 16);
            if (isNaN(val)) {
                val = null;
            }
        } else {
            val = null;
        }
        values.push(val);
    }

    return values;
}

// serializes numbers into hex CSVs with compact nulls
/**
 * @param {string} keyPrefix
 * @param {string | any[] | null} values
 */
function saveHexValues(keyPrefix, values) {
    if (!roamingProvider) {
        return null;
    }

    const key = getFullKey(keyPrefix);

    if (!values) {
        roamingProvider.remove(key);
    } else {
        const rawValues = [],
            len = values.length;
        let i, val;

        for (i = 0; i < len; i++) {
            val = values[i];
            if (val == null) {
                // we have limited storage space so we'll shorten null values
                rawValues.push("");
            } else {
                // encode values as hex
                rawValues.push(val.toString(16));
            }
        }

        // save comma separated values
        roamingProvider.set(key, rawValues.join(","));
    }
}

/**
 * @param {string} keyPrefix
 * @param {number} index
 */
function getValue(keyPrefix, index) {
    if (!roamingProvider) {
        return null;
    }

    const values = getHexValues(keyPrefix);
    if (values) {
        return values.length > index ? values[index] : null;
    }
}

/**
 * @param {string} keyPrefix
 * @param {number} index
 * @param {number | null} value
 */
function saveValue(keyPrefix, index, value) {
    if (!roamingProvider) {
        return;
    }

    const values = getHexValues(keyPrefix);
    if (!values) {
        return;
    }
    const prevValue = values[index];

    // only write if value has changed
    if (prevValue !== value) {
        values[index] = value;
        saveHexValues(keyPrefix, values);
    }
}

const RoamingSettings = {
    // scores
    /**
     * @param {number} boxIndex
     * @param {number} levelIndex
     */
    getScore(boxIndex, levelIndex) {
        return getValue(`${SCORES_PREFIX}-${boxIndex}`, levelIndex);
    },
    /**
     * @param {number} boxIndex
     * @param {number} levelIndex
     * @param {number} score
     */
    setScore(boxIndex, levelIndex, score) {
        saveValue(`${SCORES_PREFIX}-${boxIndex}`, levelIndex, score);
    },

    // stars
    /**
     * @param {number} boxIndex
     * @param {number} levelIndex
     */
    getStars(boxIndex, levelIndex) {
        return getValue(`${STARS_PREFIX}-${boxIndex}`, levelIndex);
    },
    /**
     * @param {number} boxIndex
     * @param {number} levelIndex
     * @param {number} stars
     */
    setStars(boxIndex, levelIndex, stars) {
        saveValue(`${STARS_PREFIX}-${boxIndex}`, levelIndex, stars);
    },

    // achievement counts
    /**
     * @param {number} achievementIndex
     */
    getAchievementCount(achievementIndex) {
        return getValue(ACHIEVEMENTS_PREFIX, achievementIndex);
    },
    /**
     * @param {number} achievementIndex
     * @param {number} count
     */
    setAchievementCount(achievementIndex, count) {
        saveValue(ACHIEVEMENTS_PREFIX, achievementIndex, count);
    },
};

export default RoamingSettings;
