import BaseElement from "visual/BaseElement";
import Vector from "core/Vector";
import ResourceId from "resources/ResourceId";
import ImageElement from "visual/ImageElement";
import ImageMultiDrawer from "visual/ImageMultiDrawer";
import ResourceMgr from "resources/ResourceMgr";
import Mover from "utils/Mover";
import MathHelper from "utils/MathHelper";
import resolution from "resolution";
import Rectangle from "core/Rectangle";
function Pollen() {
    this.parentIndex = 0;
    this.x = 0;
    this.y = 0;

    this.scaleX = 1;
    this.startScaleX = 1;
    this.endScaleX = 1;

    this.scaleY = 1;
    this.startScaleY = 1;
    this.endScaleY = 1;

    this.alpha = 1;
    this.startAlpha = 1;
    this.endAlpha = 1;
}

const PollenDrawer = BaseElement.extend({
    init: function () {
        this._super();

        const pollen = ResourceMgr.getTexture(ResourceId.IMG_OBJ_POLLEN_HD);

        this.qw = pollen.imageWidth;
        this.qh = pollen.imageHeight;

        this.drawer = new ImageMultiDrawer(pollen);
        this.drawer.drawPosIncrement = 0.1;

        this.pollens = [];
    },
    addPollen: function (v, pi) {
        let sX = 1,
            sY = 1,
            size = [0.3, 0.3, 0.5, 0.5, 0.6],
            sizeCounts = size.length,
            rx = size[MathHelper.randomRange(0, sizeCounts - 1)],
            ry = rx;

        if (MathHelper.randomBool()) {
            rx *= 1 + MathHelper.randomRange(0, 1) / 10;
        } else {
            ry *= 1 + MathHelper.randomRange(0, 1) / 10;
        }

        sX *= rx;
        sY *= ry;

        const w = this.qw * sX,
            h = this.qh * sY,
            maxScale = 1,
            d = Math.min(maxScale - sX, maxScale - sY),
            delta = Math.random(),
            pollen = new Pollen();

        pollen.parentIndex = pi;
        pollen.x = v.x;
        pollen.y = v.y;
        pollen.startScaleX = d + sX;
        pollen.startScaleY = d + sY;
        pollen.scaleX = pollen.startScaleX * delta;
        pollen.scaleY = pollen.startScaleY * delta;
        pollen.endScaleX = sX;
        pollen.endScaleY = sY;
        pollen.endAlpha = 0.3;
        pollen.startAlpha = 1;
        pollen.alpha = 0.7 * delta + 0.3;

        const tquad = this.drawer.texture.rects[IMG_OBJ_POLLEN_HD_obj_pollen],
            vquad = new Rectangle(v.x - w / 2, v.y - h / 2, w, h);

        this.drawer.setTextureQuad(this.pollens.length, tquad, vquad, pollen.alpha);
        this.pollens.push(pollen);
    },
    fillWithPollenFromPath: function (fromIndex, toIndex, grab) {
        let MIN_DISTANCE = resolution.POLLEN_MIN_DISTANCE,
            v1 = grab.mover.path[fromIndex],
            v2 = grab.mover.path[toIndex],
            v = Vector.subtract(v2, v1),
            vLen = v.getLength(),
            times = ~~(vLen / MIN_DISTANCE),
            POLLEN_MAX_OFFSET = resolution.POLLEN_MAX_OFFSET,
            i,
            vn;

        v.normalize();

        for (i = 0; i <= times; i++) {
            vn = Vector.add(v1, Vector.multiply(v, i * MIN_DISTANCE));
            vn.x += MathHelper.randomRange(-POLLEN_MAX_OFFSET, POLLEN_MAX_OFFSET);
            vn.y += MathHelper.randomRange(-POLLEN_MAX_OFFSET, POLLEN_MAX_OFFSET);
            this.addPollen(vn, fromIndex);
        }
    },
    update: function (delta) {
        this._super(delta);
        this.drawer.update(delta);

        let len = this.pollens.length,
            i,
            pollen,
            temp,
            w,
            h,
            moveResult,
            a;

        for (i = 0; i < len; i++) {
            pollen = this.pollens[i];

            // increment the scale
            moveResult = Mover.moveToTargetWithStatus(
                pollen.scaleX,
                pollen.endScaleX,
                1,
                delta
            );
            pollen.scaleX = moveResult.value;
            if (moveResult.reachedZero) {
                // swap the start and end values
                temp = pollen.startScaleX;
                pollen.startScaleX = pollen.endScaleX;
                pollen.endScaleX = temp;
            }

            moveResult = Mover.moveToTargetWithStatus(
                pollen.scaleY,
                pollen.endScaleY,
                1,
                delta
            );
            pollen.scaleY = moveResult.value;
            if (moveResult.reachedZero) {
                // swap the start and end values
                temp = pollen.startScaleY;
                pollen.startScaleY = pollen.endScaleY;
                pollen.endScaleY = temp;
            }

            w = this.qw * pollen.scaleX;
            h = this.qh * pollen.scaleY;

            // update the current position
            this.drawer.vertices[i] = new Rectangle(pollen.x - w / 2, pollen.y - h / 2, w, h);

            // increment the alpha
            moveResult = Mover.moveToTargetWithStatus(pollen.alpha, pollen.endAlpha, 1, delta);
            pollen.alpha = moveResult.value;
            if (moveResult.reachedZero) {
                // swap the start and end values
                temp = pollen.startAlpha;
                pollen.startAlpha = pollen.endAlpha;
                pollen.endAlpha = temp;
            }

            // update the alpha in the drawer
            this.drawer.alphas[i] = pollen.alpha;
        }
    },
    draw: function () {
        this.preDraw();
        this.drawer.draw();
        this.postDraw();
    },
});

var IMG_OBJ_POLLEN_HD_obj_pollen = 0;

export default PollenDrawer;
