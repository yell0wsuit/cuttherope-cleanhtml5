/**
 * ResEntry constructor
 * @param {string} path location of the file
 * @param {ResourceType} type resource type (IMAGE, SOUND, etc)
 */

/**
 * @typedef {Object} ResEntryOptions
 * @property {string} atlasPath - Path to the texture atlas file
 * @property {string} atlasFormat - Format of the texture atlas
 * @property {string[]} [frameOrder] - Order of frames in the atlas
 * @property {string} [offsetNormalization] - Offset normalization setting
 */

class ResEntry {
    /**
     * @param {string} path
     * @param {number} type
     * @param {ResEntryOptions} [options]
     */
    constructor(
        path,
        type,
        options = {
            atlasPath: "",
            atlasFormat: "",
            frameOrder: [],
            offsetNormalization: "",
        }
    ) {
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
