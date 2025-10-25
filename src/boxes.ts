import JsonLoader from "@/resources/JsonLoader";

// Cached boxes data
let cachedBoxes = null;

// Get levels from JsonLoader which loads them at runtime from public folder
const getLevels = () => {
    if (cachedBoxes) {
        return cachedBoxes;
    }

    const groupedLevels = Array.from(JsonLoader.getAllLevels());

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
export default new Proxy([], {
    get(target, prop) {
        const boxes = getLevels();
        return boxes[prop];
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
