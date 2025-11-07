import BaseElement from "@/visual/BaseElement";
import ImageElement from "@/visual/ImageElement";
import Rectangle from "@/core/Rectangle";
import Constants from "@/utils/Constants";
import Alignment from "@/core/Alignment";
import type Texture2D from "@/core/Texture2D";

const TOUCH_MOVE_AND_UP_ZONE_INCREASE = 15;

const StateType = {
    UP: 0,
    DOWN: 1,
} as const;

type StateNumType = (typeof StateType)[keyof typeof StateType];

class GenericButton extends BaseElement {
    static readonly StateType = StateType;

    buttonId: number;
    state: StateNumType;
    touchLeftInc: number;
    touchRightInc: number;
    touchTopInc: number;
    touchBottomInc: number;
    onButtonPressed: ((buttonId: number) => void) | null;
    forcedTouchZone: Rectangle;

    constructor(id: number) {
        super();

        this.buttonId = id;
        this.state = StateType.UP;

        this.touchLeftInc = 0.0;
        this.touchRightInc = 0.0;
        this.touchTopInc = 0.0;
        this.touchBottomInc = 0.0;

        this.onButtonPressed = null;

        this.forcedTouchZone = new Rectangle(
            Constants.UNDEFINED,
            Constants.UNDEFINED,
            Constants.UNDEFINED,
            Constants.UNDEFINED
        );
    }

    initWithElements(up: ImageElement, down: ImageElement): void {
        up.parentAnchor = down.parentAnchor = Alignment.TOP | Alignment.LEFT;
        this.addChildWithID(up, GenericButton.StateType.UP);
        this.addChildWithID(down, GenericButton.StateType.DOWN);
        this.setState(GenericButton.StateType.UP);
    }

    initWithTextures(upTexture: Texture2D, downTexture: Texture2D): void {
        const up = new ImageElement();
        up.initTexture(upTexture);

        const down = new ImageElement();
        down.initTexture(downTexture);

        this.initWithElements(up, down);
    }

    forceTouchRect(rect: Rectangle): void {
        this.forcedTouchZone = rect;
    }

    setTouchIncrease(left: number, right: number, top: number, bottom: number): void {
        this.touchLeftInc = left;
        this.touchRightInc = right;
        this.touchTopInc = top;
        this.touchBottomInc = bottom;
    }

    setState(s: StateNumType): void {
        this.state = s;
        const up = this.getChild(GenericButton.StateType.UP);
        const down = this.getChild(GenericButton.StateType.DOWN);

        if (!up || !down) {
            throw new Error("Button elements not initialized");
        }

        up.setEnabled(s === GenericButton.StateType.UP);
        down.setEnabled(s === GenericButton.StateType.DOWN);
    }

    isInTouchZone(tx: number, ty: number, td: boolean): boolean {
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

    onTouchDown(tx: number, ty: number): boolean {
        super.onTouchDown(tx, ty);

        if (this.state === GenericButton.StateType.UP) {
            if (this.isInTouchZone(tx, ty, true)) {
                this.setState(GenericButton.StateType.DOWN);
                return true;
            }
        }

        return false;
    }

    onTouchUp(tx: number, ty: number): boolean {
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

    onTouchMove(tx: number, ty: number): boolean {
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

    override addChildWithID(child: BaseElement, id: number): void {
        super.addChildWithID(child, id);

        child.parentAnchor = Alignment.TOP | Alignment.LEFT;

        if (id === GenericButton.StateType.DOWN) {
            this.width = child.width;
            this.height = child.height;
            this.setState(GenericButton.StateType.UP);
        }
    }
}

export default GenericButton;
