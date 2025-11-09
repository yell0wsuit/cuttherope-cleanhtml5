import Vector from "@/core/Vector";
import Canvas from "@/utils/Canvas";
import MathHelper from "@/utils/MathHelper";

const SpeedType = {
    PIXELS: 0, // camera will move with speed pixels per second
    DELAY: 1, // camera will reach the target position in 1/speed seconds
} as const;

type CameraSpeedType = (typeof SpeedType)[keyof typeof SpeedType];

class Camera2D {
    static readonly SpeedType = SpeedType;

    speed: number;
    type: CameraSpeedType;
    pos: Vector;
    target: Vector;
    offset: Vector;

    constructor(speed: number, cameraSpeed: CameraSpeedType) {
        this.speed = speed;
        this.type = cameraSpeed;
        this.pos = Vector.newZero();
        this.target = Vector.newZero();
        this.offset = Vector.newZero();
    }

    // Changes the camera position (but doesn't actually transform the canvas)
    moveTo(x: number, y: number, immediate: boolean): void {
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
    }

    update(delta: number): void {
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
    }

    applyCameraTransformation(): void {
        if ((this.pos.x !== 0 || this.pos.y !== 0) && Canvas.context) {
            Canvas.context.translate(-this.pos.x, -this.pos.y);
        }
    }

    cancelCameraTransformation(): void {
        if ((this.pos.x !== 0 || this.pos.y !== 0) && Canvas.context) {
            Canvas.context.translate(this.pos.x, this.pos.y);
        }
    }
}

export default Camera2D;
