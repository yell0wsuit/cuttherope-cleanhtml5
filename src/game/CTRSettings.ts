import SettingStorage from "@/core/SettingStorage";
import QueryStrings from "@/ui/QueryStrings";
import LangId from "@/resources/LangId";
import platformLoc from "@/platformLoc";
import PubSub from "@/utils/PubSub";

class CTRSettings {
    static SettingKeys = {
        MUSIC: "music",
        SOUND: "sound",
        CLICK_TO_CUT: "clickToCut",
        IS_HD: "isHD",
        LANGUAGE: "language",
    };

    static showMenu = true;
    static disableTextSelection = true;
    static fpsEnabled = QueryStrings.showFrameRate;

    // OmNom will say hello on first level of every session
    static showGreeting = true;

    // game music
    /**
     * @returns {boolean}
     */
    static getMusicEnabled(): boolean {
        return /** @type {boolean} */ SettingStorage.getBoolOrDefault(this.SettingKeys.MUSIC, true);
    }

    /**
     * @param {boolean} musicEnabled
     */
    static setMusicEnabled(musicEnabled: boolean) {
        SettingStorage.set(this.SettingKeys.MUSIC, musicEnabled.toString());
    }

    // sound effects
    /**
     * @returns {boolean}
     */
    static getSoundEnabled(): boolean {
        return /** @type {boolean} */ SettingStorage.getBoolOrDefault(this.SettingKeys.SOUND, true);
    }

    /**
     * @param {boolean} soundEnabled
     */
    static setSoundEnabled(soundEnabled: boolean) {
        SettingStorage.set(this.SettingKeys.SOUND, soundEnabled.toString());
    }

    // click-to-cut
    /**
     * @returns {boolean}
     */
    static getClickToCut(): boolean {
        return /** @type {boolean} */ SettingStorage.getBoolOrDefault(
            this.SettingKeys.CLICK_TO_CUT,
            false
        );
    }

    /**
     * @param {boolean} clickToCutEnabled
     */
    static setClickToCut(clickToCutEnabled: boolean) {
        SettingStorage.set(this.SettingKeys.CLICK_TO_CUT, clickToCutEnabled.toString());
    }

    // locale
    /**
     * @returns {number}
     */
    static getLangId(): number {
        // first see if a querystring override was specified
        if (QueryStrings.lang) {
            const queryLangId = LangId.fromString(QueryStrings.lang);
            if (queryLangId != null) {
                return queryLangId;
            }
        }

        // next, check the local storage setting
        let langId = SettingStorage.getIntOrDefault(this.SettingKeys.LANGUAGE, null);
        if (langId == null) {
            // see if the platform can provide a default language
            langId = platformLoc.getDefaultLangId();

            // default to english
            if (langId == null) {
                langId = LangId.EN;
            }
        }

        return /** @type {number} */ langId;
    }

    /**
     * @param {string | number} langId
     */
    static setLangId(langId: string | number) {
        SettingStorage.set(this.SettingKeys.LANGUAGE, langId);
    }

    static getIsHD() {
        return SettingStorage.getBoolOrDefault(this.SettingKeys.IS_HD, null);
    }

    // sd or hd resolution
    /**
     * @param {boolean} isHD
     */
    static setIsHD(isHD: boolean) {
        SettingStorage.set(this.SettingKeys.IS_HD, isHD.toString());
    }

    static clear() {
        SettingStorage.remove(this.SettingKeys.IS_HD);
    }
}

export default CTRSettings;
