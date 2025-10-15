/**
 * ResEntry constructor
 * @param path {string} location of the file
 * @param type {ResourceType} resource type (IMAGE, SOUND, etc)
 */
const ResEntry = function (path, type, options = {}) {
    this.path = path;
    this.type = type;

    if (options.atlasPath) {
        this.atlasPath = options.atlasPath;
    }

    if (options.atlasFormat) {
        this.atlasFormat = options.atlasFormat;
    }

    if (options.frameOrder) {
        this.frameOrder = options.frameOrder.slice();
    }

    if (options.offsetNormalization) {
        this.offsetNormalization = options.offsetNormalization;
    }
};

export default ResEntry;
