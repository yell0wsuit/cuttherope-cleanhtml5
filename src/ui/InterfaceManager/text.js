import Text from "@/visual/Text";
import Lang from "@/resources/Lang";

// sets scaled menu text for the image specified by the selector query
export const setImageBigText = (selector, menuStringId) =>
    Text.drawBig({
        text: Lang.menuText(menuStringId),
        imgSel: selector,
        scaleToUI: true,
    });
