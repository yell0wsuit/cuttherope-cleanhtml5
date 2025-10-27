import BaseElement from "@/visual/BaseElement";
import Constants from "@/utils/Constants";
import ImageElement from "@/visual/ImageElement";
import ResourceId from "@/resources/ResourceId";
import Alignment from "@/core/Alignment";
import resolution from "@/resolution";
import Vector from "@/core/Vector";
import Radians from "@/utils/Radians";
import Canvas from "@/utils/Canvas";

const IMG_OBJ_VINIL_obj_vinil = 0;
const IMG_OBJ_VINIL_obj_vinil_highlight = 1;
const IMG_OBJ_VINIL_odj_vinil_sticker = 2;
const IMG_OBJ_VINIL_obj_vinil_center = 3;
const IMG_OBJ_VINIL_obj_controller_active = 4;
const IMG_OBJ_VINIL_obj_controller = 5;

const CONTOUR_ALPHA = 0.2;
const CONTROLLER_MIN_SCALE = 0.75;
const STICKER_MIN_SCALE = 0.4;
const CENTER_SCALE_FACTOR = 0.5;
const HUNDRED_PERCENT_SCALE_SIZE = 167.0;
const CIRCLE_VERTEX_COUNT = 80;
const INNER_CIRCLE_WIDTH = 15 * resolution.PM;
const OUTER_CIRCLE_WIDTH = 7 * resolution.PM;
const ACTIVE_CIRCLE_WIDTH = 3 * resolution.PM;
const CONTROLLER_SHIFT_PARAM1 = 22.5 * resolution.PM;
const CONTROLLER_SHIFT_PARAM2 = 0.03 * resolution.PM;

class StickerImage extends ImageElement {
    constructor() {
        super();
        this.initTextureWithId(ResourceId.IMG_OBJ_VINIL);
        this.setTextureQuad(IMG_OBJ_VINIL_odj_vinil_sticker);
    }
}

class RotatedCircle extends BaseElement {
    /**
     * @type {string[]}
     */
    containedObjects;

    /**
     * @type {RotatedCircle[]}
     */
    circles;

    /**
     * @type {number}
     */
    soundPlaying;

    /**
     * @type {Vector}
     */
    lastTouch;

    /**
     * @type {StickerImage}
     */
    vinilStickerL;

    /**
     * @type {StickerImage}
     */
    vinilStickerR;

    /**
     * @type {ImageElement}
     */
    vinilActiveControllerL;

    /**
     * @type {ImageElement}
     */
    vinilActiveControllerR;

    /**
     * @type {ImageElement}
     */
    vinil;

    /**
     * @type {boolean}
     */
    passColorToChilds;

    constructor() {
        super();
        this.containedObjects = [];
        this.circles = [];
        this.soundPlaying = Constants.UNDEFINED;
        this.lastTouch = Vector.newUndefined();

        this.vinilStickerL = new StickerImage();
        this.vinilStickerL.anchor = Alignment.RIGHT | Alignment.VCENTER;
        this.vinilStickerL.scaleX = 1;
        this.vinilStickerL.parentAnchor = Alignment.CENTER;
        this.vinilStickerL.rotationCenterX = this.vinilStickerL.width / 2 + 0.5;
        this.vinilStickerL.drawPosIncrement = 0.001;

        this.vinilStickerR = new StickerImage();
        this.vinilStickerR.scaleX = -1;
        this.vinilStickerR.anchor = Alignment.RIGHT | Alignment.VCENTER;
        this.vinilStickerR.parentAnchor = Alignment.CENTER;
        this.vinilStickerR.rotationCenterX = this.vinilStickerR.width / 2 - 0.5;
        this.vinilStickerR.drawPosIncrement = 0.001;

        this.vinilCenter = ImageElement.create(
            ResourceId.IMG_OBJ_VINIL,
            IMG_OBJ_VINIL_obj_vinil_center
        );
        this.vinilCenter.anchor = Alignment.CENTER;

        this.vinilHighlightL = ImageElement.create(
            ResourceId.IMG_OBJ_VINIL,
            IMG_OBJ_VINIL_obj_vinil_highlight
        );
        this.vinilHighlightL.anchor = Alignment.TOP | Alignment.RIGHT;

        this.vinilHighlightR = ImageElement.create(
            ResourceId.IMG_OBJ_VINIL,
            IMG_OBJ_VINIL_obj_vinil_highlight
        );
        this.vinilHighlightR.scaleX = -1;
        this.vinilHighlightR.anchor = Alignment.TOP | Alignment.LEFT;

        this.vinilControllerL = ImageElement.create(
            ResourceId.IMG_OBJ_VINIL,
            IMG_OBJ_VINIL_obj_controller
        );
        this.vinilControllerL.anchor = Alignment.CENTER;
        this.vinilControllerL.rotation = 90.0;

        this.vinilControllerR = ImageElement.create(
            ResourceId.IMG_OBJ_VINIL,
            IMG_OBJ_VINIL_obj_controller
        );
        this.vinilControllerR.anchor = Alignment.CENTER;
        this.vinilControllerR.rotation = -90.0;

        this.vinilActiveControllerL = ImageElement.create(
            ResourceId.IMG_OBJ_VINIL,
            IMG_OBJ_VINIL_obj_controller_active
        );
        this.vinilActiveControllerL.anchor = this.vinilControllerL.anchor;
        this.vinilActiveControllerL.rotation = this.vinilControllerL.rotation;
        this.vinilActiveControllerL.visible = false;

        this.vinilActiveControllerR = ImageElement.create(
            ResourceId.IMG_OBJ_VINIL,
            IMG_OBJ_VINIL_obj_controller_active
        );
        this.vinilActiveControllerR.anchor = this.vinilControllerR.anchor;
        this.vinilActiveControllerR.rotation = this.vinilControllerR.rotation;
        this.vinilActiveControllerR.visible = false;

        this.vinil = ImageElement.create(ResourceId.IMG_OBJ_VINIL, IMG_OBJ_VINIL_obj_vinil);
        this.vinil.anchor = Alignment.CENTER;

        this.passColorToChilds = false;

        this.addChild(this.vinilStickerL);
        this.addChild(this.vinilStickerR);
        this.addChild(this.vinilActiveControllerL);
        this.addChild(this.vinilActiveControllerR);
        this.addChild(this.vinilControllerL);
        this.addChild(this.vinilControllerR);
    }

    /**
     * @param {number} value
     */
    setSize(value) {
        this.size = value;

        const newScale = this.size / HUNDRED_PERCENT_SCALE_SIZE;
        this.vinilHighlightL.scaleX =
            this.vinilHighlightL.scaleY =
            this.vinilHighlightR.scaleY =
                newScale;
        this.vinilHighlightR.scaleX = -newScale;

        this.vinil.scaleX = this.vinil.scaleY = newScale;

        const newStickerScale = newScale >= STICKER_MIN_SCALE ? newScale : STICKER_MIN_SCALE;
        this.vinilStickerL.scaleX =
            this.vinilStickerL.scaleY =
            this.vinilStickerR.scaleY =
                newStickerScale;
        this.vinilStickerR.scaleX = -newStickerScale;

        const newControllerScale =
            newScale >= CONTROLLER_MIN_SCALE ? newScale : CONTROLLER_MIN_SCALE;
        this.vinilControllerL.scaleX =
            this.vinilControllerL.scaleY =
            this.vinilControllerR.scaleX =
            this.vinilControllerR.scaleY =
                newControllerScale;
        this.vinilActiveControllerL.scaleX =
            this.vinilActiveControllerL.scaleY =
            this.vinilActiveControllerR.scaleX =
            this.vinilActiveControllerR.scaleY =
                newControllerScale;

        this.vinilCenter.scaleX = 1.0 - (1.0 - newStickerScale) * CENTER_SCALE_FACTOR;
        this.vinilCenter.scaleY = this.vinilCenter.scaleX;

        this.sizeInPixels = this.vinilHighlightL.width * this.vinilHighlightL.scaleX;

        this.updateChildPositions();
    }

    hasOneHandle() {
        return !this.vinilControllerL.visible;
    }

    /**
     * @param {boolean} value
     */
    setHasOneHandle(value) {
        this.vinilControllerL.visible = !value;
    }

    isLeftControllerActive() {
        return this.vinilActiveControllerL.visible;
    }

    /**
     * @param {boolean} value
     */
    setIsLeftControllerActive(value) {
        this.vinilActiveControllerL.visible = value;
    }

    isRightControllerActive() {
        return this.vinilActiveControllerR.visible;
    }

    /**
     * @param {boolean} value
     */
    setIsRightControllerActive(value) {
        this.vinilActiveControllerR.visible = value;
    }

    containsSameObjectWithAnotherCircle() {
        const len = this.circles.length;
        console.log(this.circles);
        let i, anotherCircle;
        for (i = 0; i < len; i++) {
            anotherCircle = this.circles[i];
            if (anotherCircle != this && this.containsSameObjectWithCircle(anotherCircle)) {
                return true;
            }
        }
        return false;
    }

    draw() {
        const ctx = Canvas.context;
        if (this.isRightControllerActive() || this.isLeftControllerActive()) {
            const lineWidth = (ACTIVE_CIRCLE_WIDTH + resolution.PM) * this.vinilControllerL.scaleX;
            if (!this.sizeInPixels) {
                return;
            }
            const radius = this.sizeInPixels + ~~(lineWidth / 2);
            if (ctx) {
                ctx.beginPath();
                ctx.lineWidth = lineWidth;
                ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI, false);
                ctx.stroke();
            }
        }

        this.vinilHighlightL.color = this.color;
        this.vinilHighlightR.color = this.color;
        this.vinilControllerL.color = this.color;
        this.vinilControllerR.color = this.color;
        this.vinil.color = this.color;
        this.vinil.draw();

        const len = this.circles.length;
        const selfIndex = this.circles.indexOf(this);
        if (!ctx) {
            return;
        }
        const previousAlpha = ctx.globalAlpha;
        let i, anotherCircle;

        if (previousAlpha !== CONTOUR_ALPHA) {
            ctx.globalAlpha = CONTOUR_ALPHA;
        }

        for (i = 0; i < len; i++) {
            anotherCircle = this.circles[i];

            if (!this.sizeInPixels || !anotherCircle.sizeInPixels) {
                return;
            }

            if (
                anotherCircle != this &&
                anotherCircle.containsSameObjectWithAnotherCircle() &&
                this.circles.indexOf(anotherCircle) < selfIndex
            ) {
                this.drawCircleIntersection(
                    this.x,
                    this.y,
                    this.sizeInPixels,
                    anotherCircle.x,
                    anotherCircle.y,
                    anotherCircle.sizeInPixels,
                    OUTER_CIRCLE_WIDTH * anotherCircle.vinilHighlightL.scaleX * 0.5
                );
            }
        }

        if (previousAlpha !== CONTOUR_ALPHA) {
            ctx.globalAlpha = previousAlpha;
        }

        this.vinilHighlightL.draw();
        this.vinilHighlightR.draw();

        super.draw();

        this.vinilCenter.draw();
    }

    /**
     * @param {number} cx1
     * @param {number} cy1
     * @param {number} radius1
     * @param {number} cx2
     * @param {number} cy2
     * @param {number} radius2
     * @param {number} width
     */
    drawCircleIntersection(cx1, cy1, radius1, cx2, cy2, radius2, width) {
        const circleDistance = Vector.distance(cx1, cy1, cx2, cy2);
        if (circleDistance >= radius1 + radius2 || radius1 >= circleDistance + radius2) {
            return;
        }

        //circleDistance = a + b
        const a =
            (radius1 * radius1 - radius2 * radius2 + circleDistance * circleDistance) /
            (2 * circleDistance);
        const b = circleDistance - a;
        const beta = Math.acos(b / radius2);
        const diff = new Vector(cx1 - cx2, cy1 - cy2);
        const centersAngle = diff.angle();

        let startAngle = centersAngle - beta;
        let endAngle = centersAngle + beta;

        if (cx2 > cx1) {
            startAngle += Math.PI;
            endAngle += Math.PI;
        }

        const ctx = Canvas.context;
        if (ctx) {
            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.arc(cx2, cy2, radius2, startAngle, endAngle, false);
            ctx.stroke();
        }
    }

    updateChildPositions() {
        this.vinil.x = this.vinilCenter.x = this.x;
        this.vinil.y = this.vinilCenter.y = this.y;

        const highlightDeltaX =
            (this.vinilHighlightL.width / 2) * (1.0 - this.vinilHighlightL.scaleX);
        const highlightDeltaY =
            (this.vinilHighlightL.height / 2) * (1.0 - this.vinilHighlightL.scaleY);

        if (!this.sizeInPixels || !this.size) {
            return;
        }

        const controllerDeltaX =
            this.sizeInPixels -
            (CONTROLLER_SHIFT_PARAM1 - CONTROLLER_SHIFT_PARAM2 * this.size) +
            (1.0 - this.vinilControllerL.scaleX) * (this.vinilControllerL.width / 2);

        this.vinilHighlightL.x = this.x + highlightDeltaX;
        this.vinilHighlightR.x = this.x - highlightDeltaX;
        this.vinilHighlightL.y = this.vinilHighlightR.y = this.y - highlightDeltaY;

        this.vinilControllerL.x = this.x - controllerDeltaX;
        this.vinilControllerR.x = this.x + controllerDeltaX;
        this.vinilControllerL.y = this.vinilControllerR.y = this.y;

        this.vinilActiveControllerL.x = this.vinilControllerL.x;
        this.vinilActiveControllerL.y = this.vinilControllerL.y;
        this.vinilActiveControllerR.x = this.vinilControllerR.x;
        this.vinilActiveControllerR.y = this.vinilControllerR.y;
    }

    /**
     * @param {RotatedCircle} anotherCircle
     */
    containsSameObjectWithCircle(anotherCircle) {
        // check for copy of self
        if (
            this.x === anotherCircle.x &&
            this.y === anotherCircle.y &&
            this.size === anotherCircle.size
        ) {
            return false;
        }

        const len = this.containedObjects.length;
        let i, object;
        for (i = 0; i < len; i++) {
            if (anotherCircle.containedObjects.indexOf(this.containedObjects[i]) >= 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {RotatedCircle} zone
     */
    copy(zone) {
        const copiedCircle = new RotatedCircle();
        copiedCircle.zone = zone;
        copiedCircle.x = this.x;
        copiedCircle.y = this.y;
        copiedCircle.rotation = this.rotation;
        copiedCircle.circles = this.circles;
        copiedCircle.containedObjects = this.containedObjects;
        copiedCircle.operating = Constants.UNDEFINED;

        if (!this.size) {
            return;
        }

        const copiedSize = this.size * resolution.PM;
        const copiedRadians = Radians.fromDegrees(copiedCircle.rotation);
        copiedCircle.handle1 = new Vector(copiedCircle.x - copiedSize, copiedCircle.y);
        copiedCircle.handle2 = new Vector(copiedCircle.x + copiedSize, copiedCircle.y);
        copiedCircle.handle1.rotateAround(copiedRadians, copiedCircle.x, copiedCircle.y);
        copiedCircle.handle2.rotateAround(copiedRadians, copiedCircle.x, copiedCircle.y);

        copiedCircle.setSize(this.size);
        copiedCircle.setHasOneHandle(this.hasOneHandle());

        // circle controllers should not be visible
        copiedCircle.vinilControllerL.visible = false;
        copiedCircle.vinilControllerR.visible = false;

        return copiedCircle;
    }
}

export default RotatedCircle;
