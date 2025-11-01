import ImageElement from "@/visual/ImageElement";
import ToggleButton from "@/visual/ToggleButton";
import ResourceId from "@/resources/ResourceId";

const IMG_OBJ_STAR_IDLE_gravity_down = 56;
const IMG_OBJ_STAR_IDLE_gravity_up = 57;

class GravityButton extends ToggleButton {
    constructor() {
        const itn = ImageElement.create(
            ResourceId.IMG_OBJ_STAR_IDLE,
            IMG_OBJ_STAR_IDLE_gravity_down
        );
        const itp = ImageElement.create(
            ResourceId.IMG_OBJ_STAR_IDLE,
            IMG_OBJ_STAR_IDLE_gravity_down
        );
        const itn2 = ImageElement.create(
            ResourceId.IMG_OBJ_STAR_IDLE,
            IMG_OBJ_STAR_IDLE_gravity_up
        );
        const itp2 = ImageElement.create(
            ResourceId.IMG_OBJ_STAR_IDLE,
            IMG_OBJ_STAR_IDLE_gravity_up
        );

        super(itn, itp, itn2, itp2, GravityButton.DefaultId);

        this.setTouchIncrease(10, 10, 10, 10);
    }
}

GravityButton.DefaultId = 0;

export default GravityButton;
