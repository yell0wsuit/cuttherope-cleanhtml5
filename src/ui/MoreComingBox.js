import Box from "@/ui/Box";

class MoreComingBox extends Box {
    constructor(boxIndex, bgimg, reqstars, islocked, type) {
        super(boxIndex, bgimg, reqstars, islocked, type);
        this.includeBoxNumberInTitle = false;
    }

    isRequired() {
        // not a box required for game completion
        return false;
    }

    isGameBox() {
        return false;
    }

    isClickable() {
        return false;
    }
}

export default MoreComingBox;
