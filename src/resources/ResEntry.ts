/**
 * ResEntry constructor
 * @param {string} path location of the file
 * @param {ResourceType} type resource type (IMAGE, SOUND, etc)
 */

interface ResEntryOptions {
    atlasPath: string;
    atlasFormat: string;
    frameOrder?: string[];
    offsetNormalization?: string;
}

class ResEntry {
    path: string;
    type: number;
    atlasPath?: string;
    atlasFormat?: string;
    frameOrder?: string[];
    offsetNormalization?: string;

    /**
     * @param {string} path
     * @param {number} type
     * @param {ResEntryOptions} [options]
     */
    constructor(
        path: string,
        type: number,
        options: ResEntryOptions = {
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
