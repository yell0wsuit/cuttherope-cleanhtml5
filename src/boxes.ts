import JsonLoader from "@/resources/JsonLoader";
import type { LevelJson, LoadedLevelEntry } from "@/types/json";

// Cached boxes data
let cachedBoxes: Array<{ levels: LevelJson[] }> | null = null;

// Get levels from JsonLoader which loads them at runtime from public folder
/**
 * Resolve and memoize level JSON grouped by box.
 * @returns {Array<{ levels: LevelJson[] }>}
 */
const getLevels = (): Array<{ levels: LevelJson[] }> => {
    if (cachedBoxes) {
        return cachedBoxes;
    }

    const groupedLevels: [string, LoadedLevelEntry[]][] = Array.from(JsonLoader.getAllLevels());

    if (groupedLevels.length === 0) {
        // Return empty array if data not loaded yet
        return [];
    }

    cachedBoxes = groupedLevels
        .sort(([boxA], [boxB]) => boxA.localeCompare(boxB))
        .map(([, levels]) => ({
            levels: levels
                .sort((levelA, levelB) => levelA.levelNumber.localeCompare(levelB.levelNumber))
                .map(({ level }) => level),
        }));

    return cachedBoxes;
};

// Export a Proxy that returns the boxes loaded from JSON
// This ensures the data is available when accessed, even if loaded async
export default new Proxy([] as Array<{ levels: LevelJson[] }>, {
    get(target, prop) {
        const boxes = getLevels();
        return Reflect.get(boxes, prop);
    },
    has(target, prop) {
        const boxes = getLevels();
        return prop in boxes;
    },
    ownKeys() {
        const boxes = getLevels();
        return Reflect.ownKeys(boxes);
    },
    getOwnPropertyDescriptor(target, prop) {
        const boxes = getLevels();
        return Reflect.getOwnPropertyDescriptor(boxes, prop);
    },
});
