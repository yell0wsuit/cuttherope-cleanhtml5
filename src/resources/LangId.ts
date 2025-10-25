const LangId = {
    EN: 0,
    FR: 1,
    DE: 2,
    RU: 3,
    KO: 4,
    ZH: 5,
    JA: 6,
    ES: 7,
    CA: 8,
    BR: 9,
    IT: 10,
    NL: 11,

    fromString(val: string): number | null {
        switch (val) {
            case "de":
                return this.DE;
            case "fr":
                return this.FR;
            case "ru":
                return this.RU;
            case "en":
            case "en_GB":
            case "en_US":
                return this.EN;
            case "ko":
                return this.KO;
            case "zh":
                return this.ZH;
            case "ja":
                return this.JA;
            case "es":
                return this.ES;
            case "it":
                return this.IT;
            case "nl":
                return this.NL;
            case "br":
                return this.BR;
            case "ca":
                return this.CA;
        }

        // handle BCP-47 style codes, ex: en-US
        if (val.length >= 3) {
            switch (val.slice(0, 3)) {
                case "de-":
                    return this.DE;
                case "fr-":
                    return this.FR;
                case "ru-":
                    return this.RU;
                case "en-":
                    return this.EN;
                case "ko-":
                    return this.KO;
                case "zh-":
                    return this.ZH;
                case "ja-":
                    return this.JA;
                case "es-":
                    return this.ES;
                case "it-":
                    return this.IT;
                case "nl-":
                    return this.NL;
                case "br-":
                    return this.BR;
                case "ca-":
                    return this.CA;
            }
        }

        return null;
    },

    toCountryCode(langId: number): string {
        switch (langId) {
            case this.DE:
                return "de";
            case this.FR:
                return "fr";
            case this.RU:
                return "ru";
            case this.KO:
                return "ko";
            case this.ZH:
                return "zh";
            case this.JA:
                return "ja";
            case this.ES:
                return "es";
            case this.IT:
                return "it";
            case this.NL:
                return "nl";
            case this.BR:
                return "br";
            case this.CA:
                return "ca";
            case this.EN:
            default:
                return "en";
        }
    },
} as const;

export default LangId;
