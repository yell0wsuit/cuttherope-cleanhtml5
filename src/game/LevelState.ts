import edition from "@/config/editions/net-edition";

class LevelState {
    /** @type {any | null} */
    static loadedMap = null;

    /** @type {number} */
    static pack = 0;

    /** @type {number} */
    static level = 0;

    /** @type {boolean} */
    static survival = false;

    /**
     * Loads a specific level from the edition data
     * @param {number} pack
     * @param {number} level
     */
    static loadLevel(pack, level) {
        LevelState.pack = pack - 1;
        LevelState.level = level - 1;

        const box = edition.boxes[LevelState.pack];
        LevelState.loadedMap = box.levels[LevelState.level];
    }
}

export default LevelState;
