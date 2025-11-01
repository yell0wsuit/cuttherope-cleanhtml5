import BaseElement from "@/visual/BaseElement";
import ImageElement from "@/visual/ImageElement";
import Rectangle from "@/core/Rectangle";
import Constants from "@/utils/Constants";
import Alignment from "@/core/Alignment";
import type Texture2D from "@/core/Texture2D";
const TOUCH_MOVE_AND_UP_ZONE_INCREASE = 15;

class GenericButton extends BaseElement {
    buttonId: number;
    state: any;
    static StateType: {
        UP: 0;
        DOWN: 1;
    };
    touchLeftInc: number;
    touchRightInc: number;
    touchTopInc: number;
    touchBottomInc: number;
    onButtonPressed: null;
    forcedTouchZone: Rectangle;
    drawX: any;
    drawY: any;

    /**
     * @param {number} id
     */
    constructor(id: number) {
        super();

        this.buttonId = id;
        this.state = GenericButton.StateType.UP;

        this.touchLeftInc = 0.0;
        this.touchRightInc = 0.0;
        this.touchTopInc = 0.0;
        this.touchBottomInc = 0.0;

        /**
         * @type {((n: number) => void) | null}
         */
        this.onButtonPressed = null;

        this.forcedTouchZone = new Rectangle(
            Constants.UNDEFINED,
            Constants.UNDEFINED,
            Constants.UNDEFINED,
            Constants.UNDEFINED
        );
    }

    /**
     * @param {ImageElement} up
     * @param {ImageElement} down
     */
    initWithElements(up: ImageElement, down: ImageElement) {
        up.parentAnchor = down.parentAnchor = Alignment.TOP | Alignment.LEFT;
        this.addChildWithID(up, GenericButton.StateType.UP);
        this.addChildWithID(down, GenericButton.StateType.DOWN);
        this.setState(GenericButton.StateType.UP);
    }

    /**
     * @param {Texture2D} upTexture
     * @param {Texture2D} downTexture
     */
    initWithTextures(upTexture: Texture2D, downTexture: Texture2D) {
        const up = new ImageElement();
        up.initTexture(upTexture);

        const down = new ImageElement();
        down.initTexture(downTexture);

        this.initWithElements(up, down);
    }

    /**
     * @param {Rectangle} rect
     */
    forceTouchRect(rect: Rectangle) {
        this.forcedTouchZone = rect;
    }

    /**
     * @param {number} left
     * @param {number} right
     * @param {number} top
     * @param {number} bottom
     */
    setTouchIncrease(left: number, right: number, top: number, bottom: number) {
        this.touchLeftInc = left;
        this.touchRightInc = right;
        this.touchTopInc = top;
        this.touchBottomInc = bottom;
    }

    /**
     * @param {number} s
     */
    setState(s: number) {
        this.state = s;
        const up = this.getChild(GenericButton.StateType.UP),
            down = this.getChild(GenericButton.StateType.DOWN);

        up.setEnabled(s === GenericButton.StateType.UP);
        down.setEnabled(s === GenericButton.StateType.DOWN);
    }

    /**
     * @param {number} tx
     * @param {number} ty
     * @param {boolean} td
     */
    isInTouchZone(tx: number, ty: number, td: boolean) {
        const tzIncrease = td ? 0 : TOUCH_MOVE_AND_UP_ZONE_INCREASE;

        if (this.forcedTouchZone.w !== Constants.UNDEFINED) {
            return Rectangle.pointInRect(
                tx,
                ty,
                this.drawX + this.forcedTouchZone.x - tzIncrease,
                this.drawY + this.forcedTouchZone.y - tzIncrease,
                this.forcedTouchZone.w + tzIncrease * 2,
                this.forcedTouchZone.h + tzIncrease * 2
            );
        } else {
            return Rectangle.pointInRect(
                tx,
                ty,
                this.drawX - this.touchLeftInc - tzIncrease,
                this.drawY - this.touchTopInc - tzIncrease,
                this.width + (this.touchLeftInc + this.touchRightInc) + tzIncrease * 2,
                this.height + (this.touchTopInc + this.touchBottomInc) + tzIncrease * 2
            );
        }
    }

    /**
     * @param {number} tx
     * @param {number} ty
     */
    override onTouchDown(tx: number, ty: number) {
        super.onTouchDown(tx, ty);

        if (this.state === GenericButton.StateType.UP) {
            if (this.isInTouchZone(tx, ty, true)) {
                this.setState(GenericButton.StateType.DOWN);
                return true;
            }
        }

        return false;
    }

    /**
     * @param {number} tx
     * @param {number} ty
     */
    override onTouchUp(tx: number, ty: number) {
        super.onTouchUp(tx, ty);

        if (this.state === GenericButton.StateType.DOWN) {
            this.setState(GenericButton.StateType.UP);
            if (this.isInTouchZone(tx, ty, false)) {
                if (this.onButtonPressed) {
                    this.onButtonPressed(this.buttonId);
                }
                return true;
            }
        }

        return false;
    }

    /**
     * @param {number} tx
     * @param {number} ty
     */
    override onTouchMove(tx: number, ty: number) {
        super.onTouchMove(tx, ty);

        if (this.state === GenericButton.StateType.DOWN) {
            if (!this.isInTouchZone(tx, ty, false)) {
                this.setState(GenericButton.StateType.UP);
            } else {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {BaseElement} child
     * @param {number} id
     */
    override addChildWithID(child: BaseElement, id: number) {
        super.addChildWithID(child, id);

        child.parentAnchor = Alignment.TOP | Alignment.LEFT;

        if (id === GenericButton.StateType.DOWN) {
            this.width = child.width;
            this.height = child.height;
            this.setState(GenericButton.StateType.UP);
        }
    }
}

GenericButton.StateType = {
    UP: 0,
    DOWN: 1,
};

export default GenericButton;
