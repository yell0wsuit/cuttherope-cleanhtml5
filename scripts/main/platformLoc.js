define("platformLoc", ["resources/LangId"], function (LangId) {
    const DefaultLoc = {
        getDefaultLangId: function () {
            return LangId.EN;
        },
    };

    return DefaultLoc;
});
