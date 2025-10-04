define("resources/LangId", [], function () {
    var LangId = {
        EN: 0,
        FR: 1,
        DE: 2,
        RU: 3,
        KO: 4, //system
        ZH: 5,
        JA: 6,
        ES: 7,
        CA: 8,
        BR: 9, //system
        IT: 10,
        NL: 11,
    };

    LangId.fromString = function (val) {
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

        // handle BCP-47 style codes, ex: en-US
        if (val.length >= 3) {
            switch (val.substr(0, 3)) {
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
    };

    LangId.toCountryCode = function (langId) {
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
    };

    return LangId;
});
