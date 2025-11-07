import edition from "@/config/editions/net-edition";
import settings from "@/game/CTRSettings";
import LangId from "@/resources/LangId";
import JsonLoader from "@/resources/JsonLoader";
import Log from "@/utils/Log";
import type { BoxTextJson, MenuStringEntry } from "@/types/json";

/**
 * Helper to return the correct string from a localized entry.
 * Defaults to English if no translation is available.
 */
const getLocalizedText = (locEntry: BoxTextJson): string => {
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
    boxText(boxIndex: number, includeNumber: boolean): string {
        const locEntry = edition.boxText[boxIndex];
        if (!locEntry) {
            return "";
        }

        let text = getLocalizedText(locEntry);

        if (text && includeNumber) {
            text = `${boxIndex + 1}. ${text}`;
        }

        return text;
    }

    menuText(menuStringId: number): string {
        const menuStrings = JsonLoader.getMenuStrings();
        if (!menuStrings) {
            Log.alert("Menu strings not loaded yet");
            return "";
        }

        for (const locEntry of menuStrings) {
            if (locEntry.id === menuStringId) {
                return getLocalizedText(locEntry);
            }
        }

        Log.debug(`Missing menu string for id: ${menuStringId}`);
        return "";
    }

    getText(locEntry: BoxTextJson): string {
        return getLocalizedText(locEntry);
    }

    getCurrentId(): LangId {
        return settings.getLangId();
    }
}

export default new Lang();
