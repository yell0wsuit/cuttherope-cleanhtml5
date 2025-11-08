declare module "@/platformLoc" {
    interface PlatformLoc {
        getDefaultLangId(): number | null;
    }

    const platformLoc: PlatformLoc;
    export default platformLoc;
}

declare module "@/boxes" {
    import type { LevelJson } from "@/types/json";

    type BoxLevels = { levels: LevelJson[] };
    const boxes: BoxLevels[];
    export default boxes;
}
