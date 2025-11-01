import edition from "@/config/editions/net-edition";

class LevelState {
    /** @type {any | null} */
    static loadedMap: any | null = null;

    /** @type {number} */
    static pack: number = 0;

    /** @type {number} */
    static level: number = 0;

    /** @type {boolean} */
    static survival: boolean = false;

    /**
     * Loads a specific level from the edition data
     * @param {number} pack
     * @param {number} level
     */
    static loadLevel(pack: number, level: number) {
        LevelState.pack = pack - 1;
        LevelState.level = level - 1;

        const box = edition.boxes[LevelState.pack];
        LevelState.loadedMap = box.levels[LevelState.level];
    }
}

export default LevelState;
