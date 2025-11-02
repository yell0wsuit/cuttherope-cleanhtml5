export type BoxLocale =
    | "en"
    | "ko"
    | "zh"
    | "ja"
    | "nl"
    | "it"
    | "ca"
    | "br"
    | "es"
    | "fr"
    | "de"
    | "ru";

export type BoxTextJson = { en: string } & Partial<Record<Exclude<BoxLocale, "en">, string>>;

export interface RawBoxMetadataJson {
    id: string;
    boxText: BoxTextJson;
    boxImage?: string | null;
    boxDoor?: string | null;
    boxType: "HOLIDAY" | "NORMAL" | "MORECOMING";
    unlockStars?: number | null;
    support?: number | null;
    showEarth?: boolean;
    levelBackgroundId?: string | null;
    levelOverlayId?: string | null;
    levelCount?: number;
}

export type LevelScalar = number | string | boolean | null | undefined;

export interface LevelEntity {
    name: number | string;
    [key: string]: LevelScalar;
}

export interface LevelJsonCore {
    settings: LevelEntity[];
    objects: LevelEntity[];
}

export interface LevelJson extends LevelJsonCore {
    [locale: string]: LevelEntity[] | LevelScalar | undefined;
}

export interface LoadedLevelEntry {
    levelNumber: string;
    level: LevelJson;
}

export type JsonCacheEntry = RawBoxMetadataJson[] | LevelJson;
