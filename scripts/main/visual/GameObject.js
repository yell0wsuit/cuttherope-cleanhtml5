define("visual/GameObject", [
    "visual/Animation",
    "utils/Mover",
    "core/Rectangle",
    "core/Quad2D",
    "core/Alignment",
    "core/Vector",
    "utils/Radians",
    "utils/Canvas",
    "core/RGBAColor",
], function (Animation, Mover, Rectangle, Quad2D, Alignment, Vector, Radians, Canvas, RGBAcolor) {
    const GameObject = Animation.extend({
        init: function () {
            this._super();
            this.isDrawBB = false;
        },
        initTexture: function (texture) {
            this._super(texture);
            this.bb = new Rectangle(0, 0, this.width, this.height);
            this.rbb = new Quad2D(this.bb.x, this.bb.y, this.bb.width, this.bb.height);
            this.anchor = Alignment.CENTER;

            this.rotatedBB = false;
            this.topLeftCalculated = false;
        },
        setBBFromFirstQuad: function () {
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
        },
        parseMover: function (item) {
            this.rotation = item.angle || 0;

            const path = item.path;
            if (path) {
                let moverCapacity = Mover.MAX_CAPACITY;
                if (path[0] === "R") {
                    const rad = parseInt(path.substr(2), 10);
                    moverCapacity = Math.round(rad / 2 + 1);
                }

                const mover = new Mover(moverCapacity, item.moveSpeed, item.rotateSpeed);
                mover.angle = this.rotation;
                mover.setPathFromString(path, new Vector(this.x, this.y));
                this.setMover(mover);
                mover.start();
            }
        },
        setMover: function (mover) {
            this.mover = mover;

            // turn high precision coordinates on for moving objects
            this.drawPosIncrement = 0.0001;
        },
        update: function (delta) {
            this._super(delta);

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
        },
        rotateWithBB: function (angle) {
            if (!this.rotatedBB) {
                this.rotatedBB = true;
            }
            this.rotation = angle;

            const bb = this.bb,
                tl = new Vector(bb.x, bb.y),
                tr = new Vector(bb.x + bb.w, bb.y),
                br = new Vector(tr.x, bb.y + bb.h),
                bl = new Vector(bb.x, br.y);

            // calculate the angle and offset for rotation
            const rad = Radians.fromDegrees(angle),
                offsetX = this.width / 2 + this.rotationCenterX,
                offsetY = this.height / 2 + this.rotationCenterY;

            tl.rotateAround(rad, offsetX, offsetY);
            tr.rotateAround(rad, offsetX, offsetY);
            br.rotateAround(rad, offsetX, offsetY);
            tl.rotateAround(rad, offsetX, offsetY);

            const rbb = this.rbb;
            rbb.tlX = tl.x;
            rbb.tlY = tl.y;
            rbb.trX = tr.x;
            rbb.trY = tr.y;
            rbb.brX = br.x;
            rbb.brY = br.y;
            rbb.blX = bl.x;
            rbb.blY = bl.y;
        },
        drawBB: function () {
            const ctx = Canvas.context,
                drawX = this.drawX,
                drawY = this.drawY,
                bb = this.bb,
                rbb = this.rbb;
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            if (this.rotatedBB) {
                ctx.beginPath();
                ctx.moveTo(drawX + rbb.tlX, drawY + rbb.tlY);
                ctx.lineTo(drawX + rbb.trX, drawY + rbb.trY);
                ctx.lineTo(drawX + rbb.brX, drawY + rbb.brY);
                ctx.lineTo(drawX + rbb.blX, drawY + rbb.blY);
                ctx.stroke();
                ctx.closePath();
            } else {
                ctx.strokeRect(drawX + bb.x, drawY + bb.y, bb.w, bb.h);
            }
        },
        /**
         * Returns true if the point is inside the object's bounding box
         * @param x {number}
         * @param y {number}
         * @return {boolean}
         */
        pointInObject: function (x, y) {
            const bb = this.bb,
                ox = this.drawX + bb.x,
                oy = this.drawY + bb.y;

            return Rectangle.pointInRect(x, y, ox, oy, bb.w, bb.h);
        },
        /**
         * @param r1x {number}
         * @param r1y {number}
         * @param r2x {number}
         * @param r2y {number}
         */
        rectInObject: function (r1x, r1y, r2x, r2y) {
            const ox = this.drawX + this.bb.x,
                oy = this.drawY + this.bb.y;

            return Rectangle.rectInRect(r1x, r1y, r2x, r2y, ox, oy, ox + this.bb.w, oy + this.bb.h);
        },
    });

    GameObject.intersect = function (o1, o2) {
        const o1x = o1.drawX + o1.bb.x,
            o1y = o1.drawY + o1.bb.y,
            o2x = o2.drawX + o2.bb.x,
            o2y = o2.drawY + o2.bb.y;

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
    };

    return GameObject;
});
