import edition from "@/config/editions/net-edition";

class LevelState {
    static loadedMap: any | null = null;

    static pack: number = 0;

    static level: number = 0;

    static survival: boolean = false;

    static loadLevel(pack: number, level: number) {
        LevelState.pack = pack - 1;
        LevelState.level = level - 1;

        const box = edition.boxes[LevelState.pack];
        if (!box) {
            throw new Error(`Box not found for pack index ${LevelState.pack}`);
        }
        LevelState.loadedMap = box.levels[LevelState.level];
    }
}

export default LevelState;
