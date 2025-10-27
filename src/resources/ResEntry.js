/**
 * ResEntry constructor
 * @param {string} path location of the file
 * @param {ResourceType} type resource type (IMAGE, SOUND, etc)
 */
class ResEntry {
    constructor(path, type, options = {}) {
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
    }
}

export default ResEntry;
