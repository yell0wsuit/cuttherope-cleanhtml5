import edition from "@/edition";
import settings from "@/game/CTRSettings";
import LangId from "@/resources/LangId";
import menuStrings from "@/resources/MenuStrings";
import Log from "@/utils/Log";
// helper to return the correct string from a loc entry
const getLocalizedText = function (locEntry) {
    // note: we default to english if entry is blank
    // !LANG
    switch (settings.getLangId()) {
        case LangId.FR:
            return locEntry.fr || locEntry.en;
        case LangId.DE:
            return locEntry.de || locEntry.en;
        case LangId.RU:
            return locEntry.ru || locEntry.en;
        case LangId.ES:
            return locEntry.es || locEntry.en;
        case LangId.BR:
            return locEntry.br || locEntry.en;
        case LangId.CA:
            return locEntry.ca || locEntry.en;
        case LangId.IT:
            return locEntry.it || locEntry.en;
        case LangId.NL:
            return locEntry.nl || locEntry.en;
        case LangId.KO:
            return locEntry.ko || locEntry.en;
        case LangId.ZH:
            return locEntry.zh || locEntry.en;
        case LangId.JA:
            return locEntry.ja || locEntry.en;
        case LangId.EN:
        default:
            return locEntry.en;
    }
};

const Lang = {
    boxText: function (boxIndex, includeNumber) {
        const locEntry = edition.boxText[boxIndex];
        let text = getLocalizedText(locEntry);

        // all boxes except last one get prepended numbers
        if (text && includeNumber) {
            text = `${boxIndex + 1}. ${text}`;
        }

        return text;
    },
    menuText: function (menuStringId) {
        let locEntry, i;
        const len = menuStrings.length;
        for (i = 0; i < len; i++) {
            locEntry = menuStrings[i];
            if (locEntry.id === menuStringId) {
                return getLocalizedText(locEntry);
            }
        }

        Log.debug(`Missing menu string for id: ${menuStringId}`);
        return "";
    },
    getText: getLocalizedText,
    getCurrentId: function () {
        return settings.getLangId();
    },
};

export default Lang;
