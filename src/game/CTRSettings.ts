import SettingStorage from "@/core/SettingStorage";
import QueryStrings from "@/ui/QueryStrings";
import LangId from "@/resources/LangId";
import platformLoc from "@/platformLoc";

type LangIdentifier = number;

const SETTING_KEYS = {
    MUSIC: "music",
    SOUND: "sound",
    CLICK_TO_CUT: "clickToCut",
    IS_HD: "isHD",
    LANGUAGE: "language",
} as const;

const SETTING_DEFAULTS = {
    music: true,
    sound: true,
    clickToCut: false,
} as const;

type SettingKey = keyof typeof SETTING_KEYS;

class CTRSettings {
    static readonly SettingKeys = SETTING_KEYS;

    static showMenu = true;
    static disableTextSelection = true;
    static fpsEnabled: boolean = QueryStrings.showFrameRate;

    // OmNom will say hello on first level of every session
    static showGreeting = true;

    static getMusicEnabled(): boolean {
        return (
            SettingStorage.getBoolOrDefault(this.SettingKeys.MUSIC, SETTING_DEFAULTS.music) ??
            SETTING_DEFAULTS.music
        );
    }

    static setMusicEnabled(musicEnabled: boolean): void {
        SettingStorage.set(this.SettingKeys.MUSIC, musicEnabled.toString());
    }

    static getSoundEnabled(): boolean {
        return (
            SettingStorage.getBoolOrDefault(this.SettingKeys.SOUND, SETTING_DEFAULTS.sound) ??
            SETTING_DEFAULTS.sound
        );
    }

    static setSoundEnabled(soundEnabled: boolean): void {
        SettingStorage.set(this.SettingKeys.SOUND, soundEnabled.toString());
    }

    static getClickToCut(): boolean {
        return (
            SettingStorage.getBoolOrDefault(
                this.SettingKeys.CLICK_TO_CUT,
                SETTING_DEFAULTS.clickToCut
            ) ?? SETTING_DEFAULTS.clickToCut
        );
    }

    static setClickToCut(clickToCutEnabled: boolean): void {
        SettingStorage.set(this.SettingKeys.CLICK_TO_CUT, clickToCutEnabled.toString());
    }

    static getLangId(): LangIdentifier {
        if (QueryStrings.lang) {
            const queryLangId = LangId.fromString(QueryStrings.lang);
            if (queryLangId != null) {
                return queryLangId;
            }
        }

        let langId = SettingStorage.getIntOrDefault(this.SettingKeys.LANGUAGE, null);
        if (langId == null) {
            langId = platformLoc.getDefaultLangId();

            if (langId == null) {
                langId = LangId.EN;
            }
        }

        return langId;
    }

    static setLangId(langId: string | number): void {
        SettingStorage.set(this.SettingKeys.LANGUAGE, langId);
    }

    static getIsHD(): boolean | null {
        return SettingStorage.getBoolOrDefault(this.SettingKeys.IS_HD, null);
    }

    static setIsHD(isHD: boolean): void {
        SettingStorage.set(this.SettingKeys.IS_HD, isHD.toString());
    }

    static clear(): void {
        SettingStorage.remove(this.SettingKeys.IS_HD);
    }
}

export type { SettingKey, LangIdentifier };
export default CTRSettings;
