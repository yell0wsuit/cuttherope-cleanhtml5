import Box from "@/ui/Box";

class MoreComingBox extends Box {
    override includeBoxNumberInTitle: boolean;

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

    override isRequired = (): boolean => {
        // not a box required for game completion
        return false;
    };

    override isGameBox = (): boolean => {
        return false;
    };

    override isClickable = (): boolean => {
        return false;
    };
}

export default MoreComingBox;
