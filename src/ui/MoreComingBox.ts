import Box from "@/ui/Box";

class MoreComingBox extends Box {
    /**
     * @param {number} boxIndex
     * @param {string | null} bgimg
     * @param {number} reqstars
     * @param {boolean} islocked
     * @param {string} type
     */
    constructor(
        boxIndex: number,
        bgimg: string | null,
        reqstars: number,
        islocked: boolean,
        type: string
    ) {
        super(boxIndex, bgimg, reqstars, islocked, type);
        this.includeBoxNumberInTitle = false;
    }

    override isRequired() {
        // not a box required for game completion
        return false;
    }

    override isGameBox() {
        return false;
    }

    override isClickable() {
        return false;
    }
}

export default MoreComingBox;
