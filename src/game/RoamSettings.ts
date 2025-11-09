import PubSub from "@/utils/PubSub";

interface RoamingProvider {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
}

let currentUserId = "";
PubSub.subscribe(PubSub.ChannelId.UserIdChanged, (userId: unknown) => {
    currentUserId = userId as string;
});

let roamingProvider: RoamingProvider | null = null;
PubSub.subscribe(PubSub.ChannelId.RoamingSettingProvider, (provider: unknown) => {
    // copy methods (which will be minified)
    if (provider && typeof provider === "object") {
        const providerObj = provider as Record<string, unknown>;
        roamingProvider = {
            set: providerObj["set"] as RoamingProvider["set"],
            get: providerObj["get"] as RoamingProvider["get"],
            remove: providerObj["remove"] as RoamingProvider["remove"],
        };
    } else {
        roamingProvider = null;
    }

    PubSub.publish(PubSub.ChannelId.RoamingDataChanged);
});

const SCORES_PREFIX = "scores";
const STARS_PREFIX = "stars";
const ACHIEVEMENTS_PREFIX = "achievements";

// appends the current user's id to the key prefix
const getFullKey = (prefix: string, boxIndex?: number): string => {
    let key = prefix;
    if (currentUserId) {
        key += `-${currentUserId}`;
    }

    return key;
};

/* Unfortunately Windows doesn't tell us which value changed. Keeping this
       code in case we ever intergrate with another settings store that does
    const onSettingChanged = (key: string, value: string | null) => {

        let parts = (key || '').split('-');
        if (parts.length === 0) {
            return;
        }

        let userId, boxIndex, levelIndex, achievementIndex;
        switch(parts[0]) {
            case SCORES_PREFIX:
            case STARS_PREFIX:
                userId = (parts.length === 3) ? parts[2] : "";
                if (userId === currentUserId) {
                    // only need to change data for current user
                }
                break;
            case ACHIEVEMENTS_PREFIX:
                userId = (parts.length === 2) ? parts[1] : "";
                if (userId === currentUserId) {
                    // only need to change data for current user
                }
                break;
        }
    }
*/

// deserializes hex (and possibly undefined or null values) from a string
const getHexValues = (keyPrefix: string): (number | null)[] | null => {
    if (!roamingProvider) {
        return null;
    }

    const key = getFullKey(keyPrefix);
    const values: (number | null)[] = [];
    const rawValues = (roamingProvider.get(key) || "").split(","); // split csv
    const len = rawValues.length;

    for (let i = 0; i < len; i++) {
        let val: number | null;
        if (i < rawValues.length) {
            // parse value which is stored in hex
            val = parseInt(rawValues[i] || "", 16);
            if (isNaN(val)) {
                val = null;
            }
        } else {
            val = null;
        }
        values.push(val);
    }

    return values;
};

// serializes numbers into hex CSVs with compact nulls
const saveHexValues = (keyPrefix: string, values: (number | null)[] | null): void => {
    if (!roamingProvider) {
        return;
    }

    const key = getFullKey(keyPrefix);

    if (!values) {
        roamingProvider.remove(key);
    } else {
        const rawValues: string[] = [];
        const len = values.length;

        for (let i = 0; i < len; i++) {
            const val = values[i];
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
};

const getValue = (keyPrefix: string, index: number): number | null => {
    if (!roamingProvider) {
        return null;
    }

    const values = getHexValues(keyPrefix);
    if (values) {
        return values.length > index ? (values[index] ?? null) : null;
    }
    return null;
};

const saveValue = (keyPrefix: string, index: number, value: number | null): void => {
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
};

class RoamSettings {
    // scores
    static getScore(boxIndex: number, levelIndex: number): number | null {
        return getValue(`${SCORES_PREFIX}-${boxIndex}`, levelIndex);
    }

    static setScore(boxIndex: number, levelIndex: number, score: number): void {
        saveValue(`${SCORES_PREFIX}-${boxIndex}`, levelIndex, score);
    }

    // stars
    static getStars(boxIndex: number, levelIndex: number): number | null {
        return getValue(`${STARS_PREFIX}-${boxIndex}`, levelIndex);
    }

    static setStars(boxIndex: number, levelIndex: number, stars: number): void {
        saveValue(`${STARS_PREFIX}-${boxIndex}`, levelIndex, stars);
    }

    // achievement counts
    static getAchievementCount(achievementIndex: number): number | null {
        return getValue(ACHIEVEMENTS_PREFIX, achievementIndex);
    }

    static setAchievementCount(achievementIndex: number, count: number): void {
        saveValue(ACHIEVEMENTS_PREFIX, achievementIndex, count);
    }
}

export default RoamSettings;
