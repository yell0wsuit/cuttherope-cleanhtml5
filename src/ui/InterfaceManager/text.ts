import Text from "@/visual/Text";
import Lang from "@/resources/Lang";

// sets scaled menu text for the image specified by the selector query
export const setImageBigText = (
    /** @type {string} */ selector: string,
    /** @type {number} */ menuStringId: number
) => {
    Text.drawBig({
        text: Lang.menuText(menuStringId),
        imgSel: selector,
        scaleToUI: true,
    });
};
