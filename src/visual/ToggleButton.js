import BaseElement from "@/visual/BaseElement";
import GenericButton from "@/visual/GenericButton";
import Alignment from "@/core/Alignment";

const ToggleButtonId = {
    FACE1: 0,
    FACE2: 1,
};

class ToggleButton extends BaseElement {
    /**
     * @param {ImageElement} up1
     * @param {ImageElement} down1
     * @param {ImageElement} up2
     * @param {ImageElement} down2
     * @param {number} id
     */
    constructor(up1, down1, up2, down2, id) {
        super();

        this.buttonId = id;

        this.b1 = new GenericButton(ToggleButtonId.FACE1);
        this.b1.initWithElements(up1, down1);

        this.b2 = new GenericButton(ToggleButtonId.FACE2);
        this.b2.initWithElements(up2, down2);

        this.b1.parentAnchor = this.b2.parentAnchor = Alignment.TOP | Alignment.LEFT;
        this.width = this.b1.width;
        this.height = this.b1.height;

        this.addChildWithID(this.b1, ToggleButtonId.FACE1);
        this.addChildWithID(this.b2, ToggleButtonId.FACE2);

        this.b2.setEnabled(false);
        this.b1.onButtonPressed = this.onButtonPressed.bind(this);
        this.b2.onButtonPressed = this.onButtonPressed.bind(this);
    }

    /**
     * @param {number} n
     */
    onButtonPressed(n) {
        switch (n) {
            case ToggleButtonId.FACE1:
            case ToggleButtonId.FACE2:
                this.toggle();
                break;
        }
        if (this.onButtonPressed) {
            this.onButtonPressed(this.buttonId);
        }
    }

    /**
     * @param {number} left
     * @param {number} right
     * @param {number} top
     * @param {number} bottom
     */
    setTouchIncrease(left, right, top, bottom) {
        this.b1.setTouchIncrease(left, right, top, bottom);
        this.b2.setTouchIncrease(left, right, top, bottom);
    }

    toggle() {
        this.b1.setEnabled(!this.b1.isEnabled());
        this.b2.setEnabled(!this.b2.isEnabled());
    }

    isOn() {
        return this.b2.isEnabled();
    }
}

export default ToggleButton;
