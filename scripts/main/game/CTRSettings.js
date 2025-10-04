define("game/CTRSettings", [
    "core/SettingStorage",
    "ui/QueryStrings",
    "resources/LangId",
    "platformLoc",
    "utils/PubSub",
], function (SettingStorage, QueryStrings, LangId, platformLoc, PubSub) {
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
        getMusicEnabled: function () {
            return SettingStorage.getBoolOrDefault(SettingKeys.MUSIC, true);
        },
        setMusicEnabled: function (musicEnabled) {
            SettingStorage.set(SettingKeys.MUSIC, musicEnabled);
        },

        // sound effects
        getSoundEnabled: function () {
            return SettingStorage.getBoolOrDefault(SettingKeys.SOUND, true);
        },
        setSoundEnabled: function (soundEnabled) {
            SettingStorage.set(SettingKeys.SOUND, soundEnabled);
        },

        // click-to-cut
        getClickToCut: function () {
            return SettingStorage.getBoolOrDefault(SettingKeys.CLICK_TO_CUT, false);
        },
        setClickToCut: function (clickToCutEnabled) {
            SettingStorage.set(SettingKeys.CLICK_TO_CUT, clickToCutEnabled);
        },

        // locale
        getLangId: function () {
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
        setLangId: function (langId) {
            SettingStorage.set(SettingKeys.LANGUAGE, langId);
        },

        getIsHD: function () {
            return SettingStorage.getBoolOrDefault(SettingKeys.IS_HD, null);
        },
        // sd or hd resolution
        setIsHD: function (isHD) {
            SettingStorage.set(SettingKeys.IS_HD, isHD);
        },

        clear: function () {
            SettingStorage.remove(SettingKeys.IS_HD);
        },
    };

    return CTRSettings;
});
