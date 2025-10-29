import SettingStorage from "@/core/SettingStorage";
import QueryStrings from "@/ui/QueryStrings";
import LangId from "@/resources/LangId";
import platformLoc from "@/platformLoc";
import PubSub from "@/utils/PubSub";
import verifyType from "@/utils/TypeVerify";

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
    static getMusicEnabled() {
        return /** @type {boolean} */ (SettingStorage.getBoolOrDefault(this.SettingKeys.MUSIC, true));
    }

    /**
     * @param {boolean} musicEnabled
     */
    static setMusicEnabled(musicEnabled) {
        SettingStorage.set(this.SettingKeys.MUSIC, musicEnabled.toString());
    }

    // sound effects
    /**
     * @returns {boolean}
     */
    static getSoundEnabled() {
        return /** @type {boolean} */ (SettingStorage.getBoolOrDefault(this.SettingKeys.SOUND, true));
    }

    /**
     * @param {boolean} soundEnabled
     */
    static setSoundEnabled(soundEnabled) {
        SettingStorage.set(this.SettingKeys.SOUND, soundEnabled.toString());
    }

    // click-to-cut
    /**
     * @returns {boolean}
     */
    static getClickToCut() {
        return /** @type {boolean} */ (SettingStorage.getBoolOrDefault(this.SettingKeys.CLICK_TO_CUT, false));
    }

    /**
     * @param {boolean} clickToCutEnabled
     */
    static setClickToCut(clickToCutEnabled) {
        SettingStorage.set(this.SettingKeys.CLICK_TO_CUT, clickToCutEnabled.toString());
    }

    // locale
    static getLangId() {
        // first see if a querystring override was specified
        if (QueryStrings.lang) {
            return LangId.fromString(QueryStrings.lang);
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

        return langId;
    }

    /**
     * @param {string | number} langId
     */
    static setLangId(langId) {
        SettingStorage.set(this.SettingKeys.LANGUAGE, langId);
    }

    static getIsHD() {
        return SettingStorage.getBoolOrDefault(this.SettingKeys.IS_HD, null);
    }

    // sd or hd resolution
    /**
     * @param {boolean} isHD
     */
    static setIsHD(isHD) {
        SettingStorage.set(this.SettingKeys.IS_HD, isHD.toString());
    }

    static clear() {
        SettingStorage.remove(this.SettingKeys.IS_HD);
    }
}

export default CTRSettings;
