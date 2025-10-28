import Animation from "@/visual/Animation";
import Mover from "@/utils/Mover";
import Rectangle from "@/core/Rectangle";
import Quad2D from "@/core/Quad2D";
import Alignment from "@/core/Alignment";
import Vector from "@/core/Vector";
import Radians from "@/utils/Radians";
import Canvas from "@/utils/Canvas";
import RGBAcolor from "@/core/RGBAColor";

class GameObject extends Animation {
    constructor() {
        super();
        this.isDrawBB = false;
    }

    /**
     * @param {Texture2D} texture
     */
    initTexture(texture) {
        super.initTexture(texture);
        this.bb = new Rectangle(0, 0, this.width, this.height);
        this.rbb = new Quad2D(this.bb.x, this.bb.y, this.bb.width, this.bb.height);
        this.anchor = Alignment.CENTER;

        this.rotatedBB = false;
        this.topLeftCalculated = false;
    }

    setBBFromFirstQuad() {
        const firstOffset = this.texture.offsets[0],
            firstRect = this.texture.rects[0];
        //noinspection JSSuspiciousNameCombination
        this.bb = new Rectangle(
            Math.round(firstOffset.x),
            Math.round(firstOffset.y),
            firstRect.width,
            firstRect.height
        );
        this.rbb = new Quad2D(this.bb.x, this.bb.y, this.bb.width, this.bb.height);
    }

    /**
     * @param {{ angle: number; path: string; moveSpeed: number; rotateSpeed: number; }} item
     */
    parseMover(item) {
        this.rotation = item.angle || 0;

        const path = item.path;
        if (path) {
            let moverCapacity = Mover.MAX_CAPACITY;
            if (path[0] === "R") {
                const rad = parseInt(path.slice(2), 10);
                moverCapacity = Math.round(rad / 2 + 1);
            }

            const mover = new Mover(moverCapacity, item.moveSpeed, item.rotateSpeed);
            mover.angle = this.rotation;
            mover.setPathFromString(path, new Vector(this.x, this.y));
            this.setMover(mover);
            mover.start();
        }
    }

    /**
     * @param {Mover} mover
     */
    setMover(mover) {
        this.mover = mover;

        // turn high precision coordinates on for moving objects
        this.drawPosIncrement = 0.0001;
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        super.update(delta);

        if (!this.topLeftCalculated) {
            this.calculateTopLeft();
            this.topLeftCalculated = true;
        }

        if (this.mover) {
            this.mover.update(delta);

            this.x = this.mover.pos.x;
            this.y = this.mover.pos.y;

            if (this.rotatedBB) this.rotateWithBB(this.mover.angle);
            else this.rotation = this.mover.angle;
        }
    }

    /**
     * @param {number} angle
     */
    rotateWithBB(angle) {
        if (!this.rotatedBB) {
            this.rotatedBB = true;
        }
        this.rotation = angle;

        const bb = this.bb;

        if (!bb) {
            return;
        }

        const tl = new Vector(bb.x, bb.y);
        const tr = new Vector(bb.x + bb.w, bb.y);
        const br = new Vector(tr.x, bb.y + bb.h);
        const bl = new Vector(bb.x, br.y);

        // calculate the angle and offset for rotation
        const rad = Radians.fromDegrees(angle);
        const offsetX = this.width / 2 + this.rotationCenterX;
        const offsetY = this.height / 2 + this.rotationCenterY;

        tl.rotateAround(rad, offsetX, offsetY);
        tr.rotateAround(rad, offsetX, offsetY);
        br.rotateAround(rad, offsetX, offsetY);
        tl.rotateAround(rad, offsetX, offsetY);

        const rbb = this.rbb;
        if (rbb) {
            rbb.tlX = tl.x;
            rbb.tlY = tl.y;
            rbb.trX = tr.x;
            rbb.trY = tr.y;
            rbb.brX = br.x;
            rbb.brY = br.y;
            rbb.blX = bl.x;
            rbb.blY = bl.y;
        }
    }

    drawBB() {
        const ctx = Canvas.context;
        const drawX = this.drawX;
        const drawY = this.drawY;
        const bb = this.bb;
        const rbb = this.rbb;

        if (!ctx || !bb) {
            return; // Exit early before any ctx operations
        }

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        if (this.rotatedBB) {
            ctx.beginPath();
            if (rbb) {
                ctx.moveTo(drawX + rbb.tlX, drawY + rbb.tlY);
                ctx.lineTo(drawX + rbb.trX, drawY + rbb.trY);
                ctx.lineTo(drawX + rbb.brX, drawY + rbb.brY);
                ctx.lineTo(drawX + rbb.blX, drawY + rbb.blY);
                ctx.stroke();
                ctx.closePath();
            }
        } else {
            ctx.strokeRect(drawX + bb.x, drawY + bb.y, bb.w, bb.h);
        }
    }

    /**
     * Returns true if the point is inside the object's bounding box
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    pointInObject(x, y) {
        const bb = this.bb;
        const ox = this.drawX + bb.x;
        const oy = this.drawY + bb.y;

        return Rectangle.pointInRect(x, y, ox, oy, bb.w, bb.h);
    }

    /**
     * @param {number} r1x
     * @param {number} r1y
     * @param {number} r2x
     * @param {number} r2y
     */
    rectInObject(r1x, r1y, r2x, r2y) {
        if (!this.bb) {
            return;
        }

        const ox = this.drawX + this.bb.x;
        const oy = this.drawY + this.bb.y;

        return Rectangle.rectInRect(r1x, r1y, r2x, r2y, ox, oy, ox + this.bb.w, oy + this.bb.h);
    }

    /**
     *
     * @param {GameObject} o1
     * @param {GameObject | Star} o2
     * @returns
     */
    static intersect(o1, o2) {
        if (!o1.bb) {
            return;
        }

        const o1x = o1.drawX + o1.bb.x;
        const o1y = o1.drawY + o1.bb.y;
        const o2x = o2.drawX + o2.bb.x;
        const o2y = o2.drawY + o2.bb.y;

        return Rectangle.rectInRect(
            o1x,
            o1y,
            o1x + o1.bb.w,
            o1y + o1.bb.h,
            o2x,
            o2y,
            o2x + o2.bb.w,
            o2y + o2.bb.h
        );
    }
}

export default GameObject;
