import RGBAColor from "@/core/RGBAColor";
import Alignment from "@/core/Alignment";
import Constants from "@/utils/Constants";
import Canvas from "@/utils/Canvas";
import ActionType from "@/visual/ActionType";
import Timeline from "@/visual/Timeline";
import Radians from "@/utils/Radians";

class BaseElement {
    constructor() {
        /** @type {BaseElement | null} */
        this.parent = null;

        /** @type {boolean} */
        this.visible = true;
        /** @type {boolean} */
        this.touchable = true;
        /** @type {boolean} */
        this.updateable = true;

        /** @type {string | null} */
        this.name = null;

        /** @type {number} */
        this.x = 0;
        /** @type {number} */
        this.y = 0;

        // absolute coords of top left corner
        /** @type {number} */
        this.drawX = 0;
        /** @type {number} */
        this.drawY = 0;

        /** @type {number} */
        this.width = 0;
        /** @type {number} */
        this.height = 0;

        /** @type {number} */
        this.rotation = 0;

        // rotation center offset from the element center
        /** @type {number} */
        this.rotationCenterX = 0;
        /** @type {number} */
        this.rotationCenterY = 0;

        // use scaleX = -1 for horizontal flip, scaleY = -1 for vertical
        /** @type {number} */
        this.scaleX = 1;
        /** @type {number} */
        this.scaleY = 1;

        /** type {RGBAColor} */
        this.color = RGBAColor.solidOpaque.copy();

        /** type {number} */
        this.translateX = 0;
        this.translateY = 0;

        /**
         * Sets the anchor on the element
         *  type {number}
         */
        this.anchor = Alignment.TOP | Alignment.LEFT;
        /** type {number} */
        this.parentAnchor = Alignment.UNDEFINED;

        /** type {bool} children will inherit transformations of the parent */
        this.passTransformationsToChilds = true;

        /** type {boolean} children will inherit color of the parent */
        this.passColorToChilds = true;

        /** type {boolean} touch events can be handled by multiple children */
        this.passTouchEventsToAllChilds = false;

        /**
         * @protected
         */
        this.children = [];

        /**
         * @protected
         */
        this.timelines = [];

        /**
         * @type {number}
         */
        this.currentTimelineIndex = Constants.UNDEFINED;

        /**
         * @type {Timeline}
         */
        this.currentTimeline = null;
    }

    /**
     * @private
     */
    calculateTopLeft() {
        const parentAnchor = this.parentAnchor,
            parent = this.parent,
            anchor = this.anchor;

        // align to parent
        if (parentAnchor !== 0 /*Alignment.UNDEFINED*/) {
            // calculate the x offset first
            if (parentAnchor & 1 /*Alignment.LEFT*/) this.drawX = parent.drawX + this.x;
            else if (parentAnchor & 2 /*Alignment.HCENTER*/)
                this.drawX = parent.drawX + this.x + parent.width / 2;
            else if (parentAnchor & 4 /*Alignment.RIGHT*/)
                this.drawX = parent.drawX + this.x + parent.width;

            // now calculate y offset
            if (parentAnchor & 8 /*Alignment.TOP*/) this.drawY = parent.drawY + this.y;
            else if (parentAnchor & 16 /*Alignment.VCENTER*/)
                this.drawY = parent.drawY + this.y + parent.height / 2;
            else if (parentAnchor & 32 /*Alignment.BOTTOM*/)
                this.drawY = parent.drawY + this.y + parent.height;
        } else {
            this.drawX = this.x;
            this.drawY = this.y;
        }

        // align self anchor
        if (!((anchor & 8) /*Alignment.TOP*/)) {
            if (anchor & 16 /*Alignment.VCENTER*/) this.drawY -= this.height / 2;
            else if (anchor & 32 /*Alignment.BOTTOM*/) this.drawY -= this.height;
        }

        if (!((anchor & 1) /*Alignment.LEFT*/)) {
            if (anchor & 2 /*Alignment.HCENTER*/) this.drawX -= this.width / 2;
            else if (anchor & 4 /*Alignment.RIGHT*/) this.drawX -= this.width;
        }
    }

    preDraw() {
        this.calculateTopLeft();

        const changeScale =
                this.scaleX !== 0 && this.scaleY !== 0 && (this.scaleX !== 1 || this.scaleY !== 1),
            changeRotation = this.rotation !== 0,
            changeTranslate = this.translateX !== 0 || this.translateY !== 0,
            ctx = Canvas.context;

        // save existing canvas state first and then reset
        ctx.save();

        // apply transformations
        if (changeScale || changeRotation) {
            const rotationOffsetX = ~~(this.drawX + this.width / 2 + this.rotationCenterX),
                rotationOffsetY = ~~(this.drawY + this.height / 2 + this.rotationCenterY),
                translatedRotation = rotationOffsetX !== 0 || rotationOffsetY !== 0;

            // move to the right position in the canvas before changes
            if (translatedRotation) {
                ctx.translate(rotationOffsetX, rotationOffsetY);
            }

            if (changeRotation) {
                ctx.rotate(Radians.fromDegrees(this.rotation));
            }
            if (changeScale) {
                ctx.scale(this.scaleX, this.scaleY);
            }

            // move back to previous position
            if (translatedRotation) {
                ctx.translate(-rotationOffsetX, -rotationOffsetY);
            }
        }

        if (changeTranslate) {
            ctx.translate(this.translateX, this.translateY);
        }

        // change the alpha
        this.previousAlpha = ctx.globalAlpha;
        if (this.color.a !== 1 && this.color.a !== this.previousAlpha) {
            ctx.globalAlpha = this.color.a;
        }
    }

    draw() {
        this.preDraw();
        this.postDraw();
    }

    drawBB() {
        const ctx = Canvas.context;
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.drawX, this.drawY, this.width, this.height);
    }

    postDraw() {
        const ctx = Canvas.context,
            alphaChanged = this.color.a !== 1 && this.color.a !== this.previousAlpha;

        // for debugging, draw vector from the origin towards 0 degrees
        if (this.drawZeroDegreesLine) {
            const originX = this.drawX + (this.width >> 1) + this.rotationCenterX,
                originY = this.drawY + (this.height >> 1) + this.rotationCenterY;

            ctx.save();
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#ff0000"; // red line
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(originX, originY - 100);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        if (!this.passTransformationsToChilds) {
            if (this.isDrawBB) {
                this.drawBB();
            }

            ctx.restore();

            if (this.passColorToChilds) {
                // canvas state includes alpha so we have to set it again
                if (alphaChanged) {
                    Canvas.context.globalAlpha = this.color.a;
                }
            }
        } else if (!this.passColorToChilds) {
            if (alphaChanged) {
                Canvas.context.globalAlpha = this.previousAlpha;
            }
        }

        // draw children
        const children = this.children,
            numChildren = children.length;
        for (let i = 0; i < numChildren; i++) {
            const child = children[i];
            if (child.visible) child.draw();
        }

        if (this.passTransformationsToChilds) {
            if (this.isDrawBB) {
                this.drawBB();
            }

            ctx.restore();
        } else if (this.passColorToChilds) {
            if (alphaChanged) {
                Canvas.context.globalAlpha = this.previousAlpha;
            }
        }
    }

    /**
     * Updates timelines with the elapsed time
     * @param {number} delta
     */
    update(delta) {
        const children = this.children,
            numChildren = children.length;
        for (let i = 0; i < numChildren; i++) {
            const child = children[i];
            if (child.updateable) child.update(delta);
        }

        if (this.currentTimeline) {
            this.currentTimeline.update(delta);
        }
    }

    /**
     * @param {string} name
     * @return {BaseElement}
     */
    getChildWithName(name) {
        const children = this.children,
            numChildren = children.length;
        for (let i = 0; i < numChildren; i++) {
            const child = children[i];
            if (child.name === name) return child;

            const descendant = child.getChildWithName(name);
            if (descendant !== null) return descendant;
        }

        return null;
    }

    setSizeToChildsBounds() {
        this.calculateTopLeft();

        let minX = this.drawX,
            minY = this.drawY,
            maxX = this.drawX + this.width,
            maxY = this.drawY + this.height;
        const children = this.children,
            numChildren = children.length;

        for (let i = 0; i < numChildren; i++) {
            const child = children[i];
            child.calculateTopLeft();

            if (child.drawX < minX) minX = child.drawX;
            if (child.drawY < minY) minY = child.drawY;

            const childMaxX = child.drawX + child.width,
                childMaxY = child.drawY + child.height;
            if (childMaxX > maxX) maxX = childMaxX;
            if (childMaxY > maxY) maxY = childMaxY;
        }

        this.width = maxX - minX;
        this.height = maxY - minY;
    }

    /**
     * @param {ActionData} a action data
     * @return {boolean} true if an action was handled
     */
    handleAction(a) {
        switch (a.actionName) {
            case ActionType.SET_VISIBLE:
                this.visible = a.actionSubParam !== 0;
                break;
            case ActionType.SET_UPDATEABLE:
                this.updateable = a.actionSubParam !== 0;
                break;
            case ActionType.SET_TOUCHABLE:
                this.touchable = a.actionSubParam !== 0;
                break;
            case ActionType.PLAY_TIMELINE:
                this.playTimeline(a.actionSubParam);
                break;
            case ActionType.PAUSE_TIMELINE:
                this.pauseCurrentTimeline();
                break;
            case ActionType.STOP_TIMELINE:
                this.stopCurrentTimeline();
                break;
            case ActionType.JUMP_TO_TIMELINE_FRAME: {
                const timeline = this.currentTimeline;
                timeline.jumpToTrack(a.actionParam, a.actionSubParam);
                break;
            }
            default:
                return false;
        }

        return true;
    }

    /**
     * @param {BaseElement} child child to add
     * @return {number} index of added child
     */
    addChild(child) {
        this.children.push(child);
        child.parent = this;
        return this.children.length - 1;
    }

    addChildWithID(child, index) {
        this.children[index] = child;
        child.parent = this;
    }

    /**
     * @param {number} i index of the child to remove
     */
    removeChildWithID(i) {
        const child = this.children.splice(i, 1);
        child.parent = null;
    }

    removeAllChildren() {
        this.children.length = 0;
    }

    /**
     * @param {BaseElement} c child to remove
     */
    removeChild(c) {
        const children = this.children,
            numChildren = children.length;
        for (let i = 0; i < numChildren; i++) {
            const child = children[i];
            if (c === child) {
                this.removeChildWithID(i);
                return;
            }
        }
    }

    /**
     * @param {number} i index of child
     * @return {BaseElement}
     */
    getChild(i) {
        return this.children[i];
    }

    /**
     * @return {number} number of children
     */
    childCount() {
        return this.children.length;
    }

    /**
     * @return {Array.<BaseElement>} children
     */
    getChildren() {
        return this.children;
    }

    addTimeline(timeline) {
        const index = this.timelines.length;
        this.addTimelineWithID(timeline, index);
        return index;
    }

    addTimelineWithID(timeline, index) {
        timeline.element = this;
        this.timelines[index] = timeline;
    }

    removeTimeline(index) {
        if (this.currentTimelineIndex === index) this.stopCurrentTimeline();

        if (index < this.timelines.length) {
            this.timelines.splice(index, 1);
        }
    }

    playTimeline(index) {
        if (this.currentTimeline) {
            if (this.currentTimeline.state !== Timeline.StateType.STOPPED) {
                this.currentTimeline.stop();
            }
        }
        this.currentTimelineIndex = index;
        this.currentTimeline = this.timelines[index];
        if (this.currentTimeline) {
            const timelineResource = this.currentTimeline.resourceId;
            if (timelineResource !== undefined && timelineResource !== this.resId) {
                const shouldRestoreCut = this.restoreCutTransparency;
                this.initTextureWithId(timelineResource);
                if (shouldRestoreCut) {
                    this.doRestoreCutTransparency();
                }
            }

            this.currentTimeline.play();
        }
    }

    pauseCurrentTimeline() {
        this.currentTimeline.pause();
    }

    stopCurrentTimeline() {
        this.currentTimeline.stop();
        this.currentTimeline = null;
        this.currentTimelineIndex = Constants.UNDEFINED;
    }

    /**
     * @param {number} index
     * @return {Timeline}
     */
    getTimeline(index) {
        return this.timelines[index];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    onTouchDown(x, y) {
        let ret = false;
        const count = this.children.length;
        for (let i = count - 1; i >= 0; i--) {
            const child = this.children[i];
            if (child && child.touchable) {
                if (child.onTouchDown(x, y) && ret === false) {
                    ret = true;
                    if (!this.passTouchEventsToAllChilds) {
                        return ret;
                    }
                }
            }
        }
        return ret;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    onTouchUp(x, y) {
        let ret = false;
        const count = this.children.length;
        for (let i = count - 1; i >= 0; i--) {
            const child = this.children[i];
            if (child && child.touchable) {
                if (child.onTouchUp(x, y) && ret === false) {
                    ret = true;
                    if (!this.passTouchEventsToAllChilds) {
                        return ret;
                    }
                }
            }
        }
        return ret;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    onTouchMove(x, y) {
        let ret = false;
        const count = this.children.length;
        for (let i = count - 1; i >= 0; i--) {
            const child = this.children[i];
            if (child && child.touchable) {
                if (child.onTouchMove(x, y) && ret === false) {
                    ret = true;
                    if (!this.passTouchEventsToAllChilds) {
                        return ret;
                    }
                }
            }
        }
        return ret;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    onDoubleClick(x, y) {
        let ret = false;
        const count = this.children.length;
        for (let i = count - 1; i >= 0; i--) {
            const child = this.children[i];
            if (child && child.touchable) {
                if (child.onDoubleClick(x, y) && ret === false) {
                    ret = true;
                    if (!this.passTouchEventsToAllChilds) {
                        return ret;
                    }
                }
            }
        }
        return ret;
    }

    /**
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.visible = enabled;
        this.touchable = enabled;
        this.updateable = enabled;
    }

    /**
     * @return {boolean}
     */
    isEnabled() {
        return this.visible && this.touchable && this.updateable;
    }

    show() {
        const children = this.children,
            numChildren = children.length;
        for (let i = 0; i < numChildren; i++) {
            const child = children[i];
            if (child.visible) child.show();
        }
    }

    hide() {
        const children = this.children,
            numChildren = children.length;
        for (let i = 0; i < numChildren; i++) {
            const child = children[i];
            if (child.visible) child.hide();
        }
    }
}

export default BaseElement;
