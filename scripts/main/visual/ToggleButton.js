define("visual/ToggleButton", [
    "visual/BaseElement",
    "visual/GenericButton",
    "core/Alignment",
], function (BaseElement, GenericButton, Alignment) {
    const ToggleButtonId = {
        FACE1: 0,
        FACE2: 1,
    };

    const ToggleButton = BaseElement.extend({
        init: function (up1, down1, up2, down2, id) {
            this._super();

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
        },
        onButtonPressed: function (n) {
            switch (n) {
                case ToggleButtonId.FACE1:
                case ToggleButtonId.FACE2:
                    this.toggle();
                    break;
            }
            if (this.onButtonPressed) {
                this.onButtonPressed(this.buttonId);
            }
        },
        setTouchIncrease: function (left, right, top, bottom) {
            this.b1.setTouchIncrease(left, right, top, bottom);
            this.b2.setTouchIncrease(left, right, top, bottom);
        },
        toggle: function () {
            this.b1.setEnabled(!this.b1.isEnabled());
            this.b2.setEnabled(!this.b2.isEnabled());
        },
        isOn: function () {
            return this.b2.isEnabled();
        },
    });

    return ToggleButton;
});
