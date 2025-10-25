import SettingStorage from "@/core/SettingStorage";
import QueryStrings from "@/ui/QueryStrings";
import LangId from "@/resources/LangId";
import platformLoc from "@/platformLoc";
import PubSub from "@/utils/PubSub";
const SettingKeys = {
    MUSIC: "music",
    SOUND: "sound",
    CLICK_TO_CUT: "clickToCut",
    IS_HD: "isHD",
    LANGUAGE: "language",
};

const CTRSettings = {
    showMenu: true,

    disableTextSelection: true,

    fpsEnabled: QueryStrings.showFrameRate,

    // OmNom will say hello on first level of every session
    showGreeting: true,

    // game music
    getMusicEnabled() {
        return SettingStorage.getBoolOrDefault(SettingKeys.MUSIC, true);
    },
    setMusicEnabled(musicEnabled) {
        SettingStorage.set(SettingKeys.MUSIC, musicEnabled);
    },

    // sound effects
    getSoundEnabled() {
        return SettingStorage.getBoolOrDefault(SettingKeys.SOUND, true);
    },
    setSoundEnabled(soundEnabled) {
        SettingStorage.set(SettingKeys.SOUND, soundEnabled);
    },

    // click-to-cut
    getClickToCut() {
        return SettingStorage.getBoolOrDefault(SettingKeys.CLICK_TO_CUT, false);
    },
    setClickToCut(clickToCutEnabled) {
        SettingStorage.set(SettingKeys.CLICK_TO_CUT, clickToCutEnabled);
    },

    // locale
    getLangId() {
        // first see if a querystring override was specified
        if (QueryStrings.lang) {
            return LangId.fromString(QueryStrings.lang);
        }

        // next, check the local storage setting
        let langId = SettingStorage.getIntOrDefault(SettingKeys.LANGUAGE, null);
        if (langId == null) {
            // see if the platform can provide a default language
            langId = platformLoc.getDefaultLangId();

            // default to english
            if (langId == null) {
                langId = LangId.EN;
            }
        }

        return langId;
    },
    setLangId(langId) {
        SettingStorage.set(SettingKeys.LANGUAGE, langId);
    },

    getIsHD() {
        return SettingStorage.getBoolOrDefault(SettingKeys.IS_HD, null);
    },
    // sd or hd resolution
    setIsHD(isHD) {
        SettingStorage.set(SettingKeys.IS_HD, isHD);
    },

    clear() {
        SettingStorage.remove(SettingKeys.IS_HD);
    },
};

export default CTRSettings;
