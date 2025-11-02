import Alignment from "@/core/Alignment";
import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";
import ConstrainedPoint from "@/physics/ConstrainedPoint";
import CTRGameObject from "@/game/CTRGameObject";
import BaseElement from "@/visual/BaseElement";
import Animation from "@/visual/Animation";
import ResourceId from "@/resources/ResourceId";
import ResourceMgr from "@/resources/ResourceMgr";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import TrackType from "@/visual/TrackType";
import SoundMgr from "@/game/CTRSoundMgr";
import Radians from "@/utils/Radians";
import MathHelper from "@/utils/MathHelper";

export const ROCKET_FRAMES = {
    LAUNCHER: 0,
    IGNITION: 1,
    FLAME_SMALL: 2,
    FLAME_MEDIUM: 3,
    FLAME_LARGE: 4,
    CLOUD: 5,
    SPARKLE_4: 6,
    SPARKLE_3: 7,
    SPARKLE_2: 8,
    SPARKLE_1: 9,
    ROCKET: 10,
};

export const ROCKET_DEFAULT_SCALE = 0.7;

const TimelineId = {
    ROTATE_POSITIVE: 0,
    ROTATE_NEGATIVE: 1,
    EXHAUST: 2,
};

class Rocket extends CTRGameObject {
    constructor() {
        super();

        this.anchor = Alignment.CENTER;
        this.state = Rocket.State.IDLE;
        this.point = new ConstrainedPoint();
        this.point.disableGravity = true;
        this.point.setWeight(0.5);
        this.angle = 0;
        this.t1 = Vector.newZero();
        this.t2 = Vector.newZero();
        this.lastTouch = Vector.newZero();
        this.time = -1;
        this.impulse = 0;
        this.impulseFactor = 0.6;
        this.startCandyRotation = 0;
        this.startRotation = 0;
        this.isOperating = -1;
        this.isRotatable = false;
        this.rotateHandled = false;
        this.anglePercent = 0;
        this.additionalAngle = 0;
        this.perp = false;
        this.perpSetted = false;
        this.activeBungee = null;
        this.loopInstanceKey = null;
        this.onExhausted = null;
        /**
         * @type {import('@/physics/ConstrainedPoint').default | null}
         */
        this.attachedStar = null;

        this.particles = null;
        this.cloudParticles = null;

        this.container = new BaseElement();
        this.container.anchor = Alignment.CENTER;
        this.container.parentAnchor = Alignment.CENTER;

        this.sparks = new Animation();
        this.sparks.initTextureWithId(ResourceId.IMG_OBJ_ROCKET);
        this.sparks.anchor = Alignment.CENTER;
        this.sparks.parentAnchor = Alignment.CENTER;
        this.sparks.setEnabled(false);
        this.sparks.doRestoreCutTransparency();
        this.sparks.addAnimationEndpoints(
            0,
            0.1,
            Timeline.LoopType.REPLAY,
            ROCKET_FRAMES.IGNITION,
            ROCKET_FRAMES.FLAME_LARGE
        );
        this.container.addChild(this.sparks);

        this.addRotationTimelines();
    }

    addRotationTimelines() {
        const createRotationTimeline = (delta) => {
            const tl = new Timeline();
            tl.addKeyFrame(KeyFrame.makeRotation(0, KeyFrame.TransitionType.LINEAR, 0));
            tl.addKeyFrame(KeyFrame.makeRotation(delta, KeyFrame.TransitionType.LINEAR, 0.1));
            const track = tl.getTrack(TrackType.ROTATION);
            if (track) {
                track.relative = true;
            }
            tl.onFinished = this.timelineFinished.bind(this);
            return tl;
        };

        this.addTimelineWithID(createRotationTimeline(45), TimelineId.ROTATE_POSITIVE);
        this.addTimelineWithID(createRotationTimeline(-45), TimelineId.ROTATE_NEGATIVE);

        const exhaust = new Timeline();
        exhaust.addKeyFrame(
            KeyFrame.makeScale(
                ROCKET_DEFAULT_SCALE,
                ROCKET_DEFAULT_SCALE,
                KeyFrame.TransitionType.LINEAR,
                0
            )
        );
        exhaust.addKeyFrame(KeyFrame.makeScale(0, 0, KeyFrame.TransitionType.LINEAR, 0.2));
        exhaust.onFinished = this.timelineFinished.bind(this);
        this.addTimelineWithID(exhaust, TimelineId.EXHAUST);
    }

    finalizeSetup() {
        this.container.width = this.width;
        this.container.height = this.height;
        this.container.rotationCenterX = this.rotationCenterX;
        this.container.rotationCenterY = this.rotationCenterY;
        this.syncSparkScale();
    }

    syncSparkScale() {
        this.sparks.scaleX = this.sparks.scaleY = this.scaleX || ROCKET_DEFAULT_SCALE;
    }

    update(delta) {
        super.update(delta);

        this.point.update(delta);
        this.container.update(delta);

        if (this.mover && !this.mover.paused) {
            this.point.pos.x = this.x;
            this.point.pos.y = this.y;
        } else {
            this.x = this.point.pos.x;
            this.y = this.point.pos.y;
        }

        this.container.rotation = this.rotation;
        this.container.x = this.x;
        this.container.y = this.y;

        const prevDelta = Vector.subtract(this.point.prevPos, this.point.pos);
        let magnitude = prevDelta.getLength();
        if (magnitude < 1) {
            magnitude = 1;
        }

        const emissionOrigin = new Vector(this.x, this.y);
        const forward = Vector.forAngle(this.angle);
        const offset = Vector.multiply(forward, 35);
        emissionOrigin.add(offset);

        const initialAngle = this.angle - Math.PI;

        if (this.particles) {
            this.particles.x = emissionOrigin.x;
            this.particles.y = emissionOrigin.y;
            this.particles.angle = this.rotation;
            this.particles.initialAngle = initialAngle;
            this.particles.speed = magnitude * 50;
        }

        if (this.cloudParticles) {
            this.cloudParticles.x = emissionOrigin.x;
            this.cloudParticles.y = emissionOrigin.y;
            this.cloudParticles.angle = this.rotation;
            this.cloudParticles.initialAngle = initialAngle;
            this.cloudParticles.speed = magnitude * 40;
        }
    }

    draw() {
        this.container.draw();
        super.draw();
    }

    updateRotation() {
        if (!this.bb) {
            return;
        }

        const halfWidth = this.bb.w / 2;
        this.t1.x = this.x - halfWidth;
        this.t2.x = this.x + halfWidth;
        this.t1.y = this.t2.y = this.y;
        this.angle = Radians.fromDegrees(this.rotation);
        this.t1.rotateAround(this.angle, this.x, this.y);
        this.t2.rotateAround(this.angle, this.x, this.y);
    }

    getRotateAngleForStartEndCenter(start, end, center) {
        const v1 = Vector.subtract(start, center);
        const v2 = Vector.subtract(end, center);
        const r = v2.normalizedAngle() - v1.normalizedAngle();
        return Radians.toDegrees(r);
    }

    handleTouch(position) {
        this.lastTouch.copyFrom(position);
    }

    handleRotate(position) {
        const angleDelta = this.getRotateAngleForStartEndCenter(this.lastTouch, position, new Vector(this.x, this.y));
        const normalized = MathHelper.normalizeAngle360(angleDelta);
        this.rotation = MathHelper.normalizeAngle360(this.rotation + normalized);
        this.lastTouch.copyFrom(position);
        this.rotateHandled = true;
        this.rotateWithBB(this.rotation);
    }

    handleRotateFinal(position) {
        this.rotation = MathHelper.normalizeAngle360(this.rotation);
        const snapIndex = Math.round(this.rotation / 45);
        const snapTarget = 45 * snapIndex;

        this.removeTimeline(TimelineId.ROTATE_NEGATIVE);
        const tl = new Timeline();
        tl.addKeyFrame(KeyFrame.makeRotation(this.rotation, KeyFrame.TransitionType.LINEAR, 0));
        tl.addKeyFrame(KeyFrame.makeRotation(snapTarget, KeyFrame.TransitionType.LINEAR, 0.1));
        tl.onFinished = this.timelineFinished.bind(this);
        this.addTimelineWithID(tl, TimelineId.ROTATE_NEGATIVE);
        this.playTimeline(TimelineId.ROTATE_NEGATIVE);
    }

    startAnimation(instanceKey) {
        if (instanceKey) {
            this.loopInstanceKey = instanceKey;
        }
        this.sparks.setEnabled(true);
        this.sparks.playTimeline(0);
        SoundMgr.playSound(ResourceId.SND_ROCKET_START);
        if (this.loopInstanceKey) {
            SoundMgr.playLoopedSound(ResourceId.SND_ROCKET_FLY, this.loopInstanceKey);
        }
    }

    stopAnimation() {
        this.playTimeline(TimelineId.EXHAUST);

        const current = this.sparks.currentTimeline;
        if (current && current.state === Timeline.StateType.PLAYING) {
            this.sparks.stopCurrentTimeline();
        }
        this.sparks.setEnabled(false);

        if (this.particles) {
            this.particles.stopSystem();
            this.particles = null;
        }
        if (this.cloudParticles) {
            this.cloudParticles.stopSystem();
            this.cloudParticles = null;
        }

        if (this.loopInstanceKey) {
            SoundMgr.stopLoopedSoundInstance(ResourceId.SND_ROCKET_FLY, this.loopInstanceKey);
            this.loopInstanceKey = null;
        }
    }

    releaseConstraint(target) {
        this.point.removeConstraint(target);
    }

    timelineFinished(timeline) {
        this.rotateWithBB(this.rotation);
        if (timeline === this.getTimeline(TimelineId.EXHAUST) && typeof this.onExhausted === "function") {
            this.onExhausted(this);
        }
    }

    setBoundingBoxFromFrame() {
        const texture = this.texture || ResourceMgr.getTexture(ResourceId.IMG_OBJ_ROCKET);
        if (!texture) {
            return;
        }
        const rect = texture.rects[ROCKET_FRAMES.ROCKET];
        const offset = texture.offsets[ROCKET_FRAMES.ROCKET] || Vector.newZero();
        const width = rect.w * 0.6;
        const height = rect.h * 0.05;
        const centerX = offset.x + rect.w / 2;
        const centerY = offset.y + rect.h / 2;
        this.bb = new Rectangle(centerX - width / 2, centerY - height / 2, width, height);
    }
}

Rocket.State = {
    IDLE: 0,
    DISTANCE: 1,
    FLY: 2,
    EXHAUST: 3,
};

export default Rocket;
