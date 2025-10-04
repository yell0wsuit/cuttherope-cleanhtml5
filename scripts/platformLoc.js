define("platformLoc", ["resources/LangId"], function (LangId) {
    var DefaultLoc = {
        getDefaultLangId: function () {
            return LangId.EN;
        },
    };

    return DefaultLoc;
});
