define("visual/Camera2D", [
    "utils/Class",
    "core/Vector",
    "utils/Canvas",
    "utils/MathHelper",
], function (Class, Vector, Canvas, MathHelper) {
    var Camera2D = Class.extend({
        /**
         * Camera2D constructor
         * @param speed {number}
         * @param cameraSpeed {CameraSpeed}
         */
        init: function (speed, cameraSpeed) {
            this.speed = speed;
            this.type = cameraSpeed;
            this.pos = Vector.newZero();
            this.target = Vector.newZero();
            this.offset = Vector.newZero();
        },
        /**
         * Changes the camera position (but doesn't actually transform the canvas)
         * @param x {number}
         * @param y {number}
         * @param immediate {boolean}
         */
        moveTo: function (x, y, immediate) {
            this.target.x = x;
            this.target.y = y;

            if (immediate) {
                this.pos.copyFrom(this.target);
            } else if (this.type === Camera2D.SpeedType.DELAY) {
                this.offset = Vector.subtract(this.target, this.pos);
                this.offset.multiply(this.speed);
            } else if (this.type === Camera2D.SpeedType.PIXELS) {
                this.offset = Vector.subtract(this.target, this.pos);
                this.offset.normalize();
                this.offset.multiply(this.speed);
            }
        },
        /**
         * @param delta {number} time delta
         */
        update: function (delta) {
            if (!this.pos.equals(this.target)) {
                // add to the current position and round
                this.pos.add(Vector.multiply(this.offset, delta));
                this.pos.round();

                // see if we passed the target
                if (
                    !MathHelper.sameSign(this.offset.x, this.target.x - this.pos.x) ||
                    !MathHelper.sameSign(this.offset.y, this.target.y - this.pos.y)
                ) {
                    this.pos.copyFrom(this.target);
                }

                //console.log('camera pos update x:' + this.pos.x + ' y:' + this.pos.y);
            }
        },
        applyCameraTransformation: function () {
            if (this.pos.x !== 0 || this.pos.y !== 0) {
                Canvas.context.translate(-this.pos.x, -this.pos.y);
            }
        },
        cancelCameraTransformation: function () {
            if (this.pos.x !== 0 || this.pos.y !== 0) {
                Canvas.context.translate(this.pos.x, this.pos.y);
            }
        },
    });

    /**
     * @enum {number}
     */
    Camera2D.SpeedType = {
        PIXELS: 0, // camera will move with speed pixels per second
        DELAY: 1, // camera will reach the target position in 1/speed seconds
    };

    return Camera2D;
});
