define("resources/ResEntry", [], function () {
    /**
     * ResEntry constructor
     * @param path {string} location of the file
     * @param type {ResourceType} resource type (IMAGE, SOUND, etc)
     */
    const ResEntry = function (path, type) {
        this.path = path;
        this.type = type;
    };

    return ResEntry;
});
