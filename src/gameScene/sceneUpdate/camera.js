import Camera2D from "@/visual/Camera2D";
import MathHelper from "@/utils/MathHelper";
import Vector from "@/core/Vector";
import resolution from "@/resolution";
import * as GameSceneConstants from "@/gameScene/constants";

export function updateCamera(delta) {
    const SCREEN_WIDTH = resolution.CANVAS_WIDTH;
    const SCREEN_HEIGHT = resolution.CANVAS_HEIGHT;
    const cameraTarget =
        this.twoParts !== GameSceneConstants.PartsType.NONE ? this.starL : this.star;
    const xScroll = cameraTarget.pos.x - SCREEN_WIDTH / 2;
    const yScroll = cameraTarget.pos.y - SCREEN_HEIGHT / 2;
    const targetX = MathHelper.fitToBoundaries(xScroll, 0, this.mapWidth - SCREEN_WIDTH);
    const targetY = MathHelper.fitToBoundaries(yScroll, 0, this.mapHeight - SCREEN_HEIGHT);

    this.camera.moveTo(targetX, targetY, false);

    // NOTE: mac sources indicate this is temporary?
    if (!(this.freezeCamera && this.camera.type === Camera2D.SpeedType.DELAY)) {
        this.camera.update(delta);
    }

    if (this.camera.type === Camera2D.SpeedType.PIXELS) {
        const IGNORE_TOUCHES_DISTANCE = resolution.IGNORE_TOUCHES_DISTANCE;
        const PREVIEW_CAMERA_SPEED = resolution.PREVIEW_CAMERA_SPEED;
        const PREVIEW_CAMERA_SPEED2 = resolution.PREVIEW_CAMERA_SPEED2;
        const MAX_PREVIEW_CAMERA_SPEED = resolution.MAX_PREVIEW_CAMERA_SPEED;
        const MIN_PREVIEW_CAMERA_SPEED = resolution.MIN_PREVIEW_CAMERA_SPEED;

        const starDistance = this.camera.pos.distance(new Vector(targetX, targetY));
        if (starDistance < IGNORE_TOUCHES_DISTANCE) {
            this.ignoreTouches = false;
        }

        if (this.fastenCamera) {
            if (this.camera.speed < resolution.CAMERA_SPEED_THRESHOLD) {
                this.camera.speed *= 1.5;
            }
        } else if (starDistance > this.initialCameraToStarDistance / 2.0) {
            this.camera.speed += delta * PREVIEW_CAMERA_SPEED;
            this.camera.speed = Math.min(MAX_PREVIEW_CAMERA_SPEED, this.camera.speed);
        } else {
            this.camera.speed -= delta * PREVIEW_CAMERA_SPEED2;
            this.camera.speed = Math.max(MIN_PREVIEW_CAMERA_SPEED, this.camera.speed);
        }

        if (
            Math.abs(this.camera.pos.x - targetX) < 1 &&
            Math.abs(this.camera.pos.y - targetY) < 1
        ) {
            this.camera.type = Camera2D.SpeedType.DELAY;
            this.camera.speed = resolution.CAMERA_SPEED;
        }
    } else {
        this.time += delta;
    }
}
