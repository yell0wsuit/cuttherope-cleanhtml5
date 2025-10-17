import edition from "@/edition";
import PubSub from "@/utils/PubSub";
let currentUserId = "";
PubSub.subscribe(PubSub.ChannelId.UserIdChanged, function (userId) {
    currentUserId = userId;
});

let roamingProvider = null;
PubSub.subscribe(PubSub.ChannelId.RoamingSettingProvider, function (provider) {
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
});

const SCORES_PREFIX = "scores",
    STARS_PREFIX = "stars",
    ACHIEVEMENTS_PREFIX = "achievements";

// appends the current user's id to the key prefix
function getFullKey(prefix, boxIndex) {
    let key = prefix;
    if (currentUserId) {
        key += "-" + currentUserId;
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
function getHexValues(keyPrefix) {
    if (!roamingProvider) {
        return null;
    }

    const key = getFullKey(keyPrefix),
        values = [],
        rawValues = (roamingProvider.get(key) || "").split(","), // split csv
        len = rawValues.length;
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

function getValue(keyPrefix, index) {
    if (!roamingProvider) {
        return null;
    }

    const values = getHexValues(keyPrefix);
    return values.length > index ? values[index] : null;
}

function saveValue(keyPrefix, index, value) {
    if (!roamingProvider) {
        return;
    }

    const values = getHexValues(keyPrefix),
        prevValue = values[index];

    // only write if value has changed
    if (prevValue !== value) {
        values[index] = value;
        saveHexValues(keyPrefix, values);
    }
}

const RoamingSettings = {
    // scores
    getScore: function (boxIndex, levelIndex) {
        return getValue(SCORES_PREFIX + "-" + boxIndex, levelIndex);
    },
    setScore: function (boxIndex, levelIndex, score) {
        saveValue(SCORES_PREFIX + "-" + boxIndex, levelIndex, score);
    },

    // stars
    getStars: function (boxIndex, levelIndex) {
        return getValue(STARS_PREFIX + "-" + boxIndex, levelIndex);
    },
    setStars: function (boxIndex, levelIndex, stars) {
        saveValue(STARS_PREFIX + "-" + boxIndex, levelIndex, stars);
    },

    // achievement counts
    getAchievementCount: function (achievementIndex) {
        return getValue(ACHIEVEMENTS_PREFIX, achievementIndex);
    },
    setAchievementCount: function (achievementIndex, count) {
        saveValue(ACHIEVEMENTS_PREFIX, achievementIndex, count);
    },
};

export default RoamingSettings;
