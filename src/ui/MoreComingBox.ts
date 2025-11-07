import Box from "@/ui/Box";

class MoreComingBox extends Box {
    includeBoxNumberInTitle: boolean;

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

    isRequired = (): boolean => {
        // not a box required for game completion
        return false;
    };

    isGameBox = (): boolean => {
        return false;
    };

    isClickable = (): boolean => {
        return false;
    };
}

export default MoreComingBox;
