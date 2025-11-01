import edition from "@/config/editions/net-edition";
import settings from "@/game/CTRSettings";
import LangId from "@/resources/LangId";
import menuStrings from "@/resources/MenuStrings";
import Log from "@/utils/Log";

/**
 * @typedef {import('@/config/editions/net-edition').BoxText} BoxText
 */

/**
 * Helper to return the correct string from a localized entry.
 * Defaults to English if no translation is available.
 */
const getLocalizedText = (/** @type {BoxText} */ locEntry) => {
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

/**
 * Language manager class that handles localization text lookups.
 */
class Lang {
    /**
     * Get localized box text.
     * @param {number} boxIndex
     * @param {boolean} includeNumber
     * @returns {string}
     */
    boxText(boxIndex, includeNumber) {
        const locEntry = edition.boxText[boxIndex];
        let text = getLocalizedText(locEntry);

        if (text && includeNumber) {
            text = `${boxIndex + 1}. ${text}`;
        }

        return text;
    }

    /**
     * Get localized menu text.
     * @param {number} menuStringId
     * @returns {string}
     */
    menuText(menuStringId) {
        for (const locEntry of menuStrings) {
            if (locEntry.id === menuStringId) {
                return getLocalizedText(locEntry);
            }
        }

        Log.debug(`Missing menu string for id: ${menuStringId}`);
        return "";
    }

    /**
     * Direct access to the text resolver.
     * @param {BoxText} locEntry
     * @returns {string}
     */
    getText(locEntry) {
        return getLocalizedText(locEntry);
    }

    /**
     * Get the current language ID.
     * @returns {LangId}
     */
    getCurrentId() {
        return settings.getLangId();
    }
}

export default new Lang();
