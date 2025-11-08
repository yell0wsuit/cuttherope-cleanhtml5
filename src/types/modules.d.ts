declare module "@/core/SettingStorage" {
    interface SettingStorage {
        getBoolOrDefault(key: string, defaultValue: boolean | null): boolean | null;
        getIntOrDefault(key: string, defaultValue: number | null): number | null;
        set(key: string, value: string | number | boolean | null): void;
        remove(key: string): void;
    }

    const settingStorage: SettingStorage;
    export default settingStorage;
}

declare module "@/resources/LangId" {
    class LangId {
        static readonly EN: number;
        static readonly FR: number;
        static readonly DE: number;
        static readonly RU: number;
        static readonly KO: number;
        static readonly ZH: number;
        static readonly JA: number;
        static readonly ES: number;
        static readonly CA: number;
        static readonly BR: number;
        static readonly IT: number;
        static readonly NL: number;

        static fromString(value: string): number | null;
        static toCountryCode(langId: number): string;
    }

    export default LangId;
}

declare module "@/platformLoc" {
    interface PlatformLoc {
        getDefaultLangId(): number | null;
    }

    const platformLoc: PlatformLoc;
    export default platformLoc;
}

declare module "@/resources/ResourcePacks" {
    const ResourcePacks: {
        readonly StandardMenuSounds: readonly number[];
        readonly StandardGameSounds: readonly number[];
        readonly FullGameAdditionalSounds: readonly number[];
        readonly StandardGameImages: readonly number[];
        readonly FullGameAdditionalGameImages: readonly number[];
        readonly StandardMenuImageFilenames: readonly string[];
    };

    export default ResourcePacks;
}

declare module "@/resources/JsonLoader" {
    import type { RawBoxMetadataJson, LoadedLevelEntry, MenuStringEntry } from "@/types/json";

    const JsonLoader: {
        getBoxMetadata(): RawBoxMetadataJson[] | null | undefined;
        getAllLevels(): Iterable<[string, LoadedLevelEntry[]]>;
        getMenuStrings(): MenuStringEntry[] | undefined;
    };

    export default JsonLoader;
}

declare module "@/game/CTRRootController" {
    export interface CTRRootController {
        activeChildID: number;
        onChildDeactivated(childType: number): void;
        pauseLevel(): void;
        resumeLevel(): void;
        restartLevel(): void;
        startLevel(boxIndex: number, levelIndex: number): void;
        stopLevel(): void;
        isLevelActive(): boolean;
    }

    const rootController: CTRRootController;
    export default rootController;
}

declare module "@/ui/EasterEggManager" {
    interface EasterEggManager {
        domReady(): void;
        appReady(): void;
    }

    const easterEggManager: EasterEggManager;
    export default easterEggManager;
}

declare module "@/game/GameView" {
    import View from "@/core/View";

    interface GameViewElementType {
        readonly GAME_SCENE: number;
        readonly PAUSE_BUTTON: number;
        readonly RESTART_BUTTON: number;
        readonly NEXT_BUTTON: number;
        readonly PAUSE_MENU: number;
        readonly RESULTS: number;
    }

    class GameView extends View {
        static readonly ElementType: GameViewElementType;

        draw(): void;
        show(): void;
    }

    export default GameView;
}

declare module "@/boxes" {
    import type { LevelJson } from "@/types/json";

    type BoxLevels = { levels: LevelJson[] };
    const boxes: BoxLevels[];
    export default boxes;
}

declare module "@/config/resolutions/scale" {
    import type { ResolutionProfile } from "@/types/resolution";

    export default function scaleResolution<T extends ResolutionProfile>(
        target: T
    ): T & {
        uiScaledNumber(n: number): number;
    };
}

declare module "@/config/resolutions/*" {
    import type Rectangle from "@/core/Rectangle";
    import type { ResolutionProfile } from "@/types/resolution";

    const profile: ResolutionProfile & {
        CANVAS_WIDTH?: number;
        CANVAS_HEIGHT?: number;
        CANVAS_SCALE?: number;
        STAR_BB?: Rectangle;
        TARGET_BB?: Rectangle;
    };
    export default profile;
}
declare module "@/ZoomManager" {
    interface ZoomManager {
        domReady(): void;
        getCanvasZoom(): number;
        getUIZoom(): number;
    }

    const zoomManager: ZoomManager;
    export default zoomManager;
}
