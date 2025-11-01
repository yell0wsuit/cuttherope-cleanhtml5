/**
 * Language identifier enumeration and utility class.
 * Provides methods for converting between language codes and internal language IDs.
 */
class LangId {
    /** @type {number} English */
    static EN: number = 0;
    /** @type {number} French */
    static FR: number = 1;
    /** @type {number} German */
    static DE: number = 2;
    /** @type {number} Russian */
    static RU: number = 3;
    /** @type {number} Korean (system) */
    static KO: number = 4;
    /** @type {number} Chinese */
    static ZH: number = 5;
    /** @type {number} Japanese */
    static JA: number = 6;
    /** @type {number} Spanish */
    static ES: number = 7;
    /** @type {number} Catalan */
    static CA: number = 8;
    /** @type {number} Brazilian Portuguese (system) */
    static BR: number = 9;
    /** @type {number} Italian */
    static IT: number = 10;
    /** @type {number} Dutch */
    static NL: number = 11;

    /**
     * Converts a language code string to a LangId constant.
     * Supports both ISO 639-1 codes (e.g., "en") and BCP-47 style codes (e.g., "en-US").
     *
     * @param {string} val - The language code to convert
     * @returns {number | null} The corresponding LangId constant, or null if not recognized
     */
    static fromString(val: string): number | null {
        switch (val) {
            case "de":
                return LangId.DE;
            case "fr":
                return LangId.FR;
            case "ru":
                return LangId.RU;
            case "en":
            case "en_GB":
            case "en_US":
                return LangId.EN;
            case "ko":
                return LangId.KO;
            case "zh":
                return LangId.ZH;
            case "ja":
                return LangId.JA;
            case "es":
                return LangId.ES;
            case "it":
                return LangId.IT;
            case "nl":
                return LangId.NL;
            case "br":
                return LangId.BR;
            case "ca":
                return LangId.CA;
        }

        // Handle BCP-47 style codes, ex: en-US
        if (val.length >= 3) {
            switch (val.slice(0, 3)) {
                case "de-":
                    return LangId.DE;
                case "fr-":
                    return LangId.FR;
                case "ru-":
                    return LangId.RU;
                case "en-":
                    return LangId.EN;
                case "ko-":
                    return LangId.KO;
                case "zh-":
                    return LangId.ZH;
                case "ja-":
                    return LangId.JA;
                case "es-":
                    return LangId.ES;
                case "it-":
                    return LangId.IT;
                case "nl-":
                    return LangId.NL;
                case "br-":
                    return LangId.BR;
                case "ca-":
                    return LangId.CA;
            }
        }

        return null;
    }

    /**
     * Converts a LangId constant to its corresponding ISO 639-1 language code.
     *
     * @param {number} langId - The LangId constant to convert
     * @returns {string} The corresponding ISO 639-1 language code (defaults to "en" if not recognized)
     */
    static toCountryCode(langId: number): string {
        switch (langId) {
            case LangId.DE:
                return "de";
            case LangId.FR:
                return "fr";
            case LangId.RU:
                return "ru";
            case LangId.KO:
                return "ko";
            case LangId.ZH:
                return "zh";
            case LangId.JA:
                return "ja";
            case LangId.ES:
                return "es";
            case LangId.IT:
                return "it";
            case LangId.NL:
                return "nl";
            case LangId.BR:
                return "br";
            case LangId.CA:
                return "ca";
            case LangId.EN:
            default:
                return "en";
        }
    }
}

export default LangId;
