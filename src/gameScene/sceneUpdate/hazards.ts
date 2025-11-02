import CandyBreak from "@/game/CandyBreak";
import Mover from "@/utils/Mover";
import Radians from "@/utils/Radians";
import Rectangle from "@/core/Rectangle";
import ResourceId from "@/resources/ResourceId";
import ResourceMgr from "@/resources/ResourceMgr";
import Sock from "@/game/Sock";
import SoundMgr from "@/game/CTRSoundMgr";
import Vector from "@/core/Vector";
import resolution from "@/resolution";
import * as GameSceneConstants from "@/gameScene/constants";
import { IS_XMAS } from "@/resources/ResData";
import Rocket, { ROCKET_FRAMES } from "@/game/Rocket";
import RocketSparks from "@/game/RocketSparks";
import RocketClouds from "@/game/RocketClouds";
import ConstraintType from "@/physics/ConstraintType";
import GameObject from "@/visual/GameObject";
import MathHelper from "@/utils/MathHelper";
import Constants from "@/utils/Constants";
import { applyStarImpulse, isCandyHit } from "./collisionHelpers";
import type BaseElement from "@/visual/BaseElement";
import type Bubble from "@/game/Bubble";
import type Bouncer from "@/game/Bouncer";
import type Grab from "@/game/Grab";
import type Pump from "@/game/Pump";
import type RotatedCircle from "@/game/RotatedCircle";
import type Spikes from "@/game/Spikes";
import type { GameScene, SceneStar } from "@/types/game-scene";

type SockState = (typeof Sock.StateType)[keyof typeof Sock.StateType];

type SceneSock = Sock & { state: SockState };

interface Rocket { update(delta: number): void }

type RotatedCircleWithContents = RotatedCircle & {
    containedObjects: (Grab | Bubble)[];
    removeOnNextUpdate?: boolean;
};

type HazardScene = GameScene & {
    PM: number;
    rockets: Rocket[];
    teleport(): void;
    operatePump(pump: Pump, delta: number): void;
    handleBounce(bouncer: Bouncer, star: SceneStar, delta: number): void;
    cut(razor: BaseElement | null, v1: Vector, v2: Vector, immediate: boolean): number;
    candyResourceId: (typeof ResourceId)[keyof typeof ResourceId];
    socks: SceneSock[];
    rotatedCircles: RotatedCircleWithContents[];
    spikes: Spikes[];
};

export function updateHazards(this: HazardScene, delta: number, numGrabs: number): boolean {
    let removeCircleIndex = -1;
    for (let i = 0, len = this.rotatedCircles.length; i < len; i++) {
        const rc = this.rotatedCircles[i]!;
        const containedObjects = rc.containedObjects;

        for (let j = 0; j < numGrabs; j++) {
            const g = this.bungees[j]!;
            const gIndex = containedObjects.indexOf(g);
            const distance = Vector.distance(g.x, g.y, rc.x, rc.y);

            if (distance <= rc.sizeInPixels + 5 * this.PM) {
                if (gIndex < 0) {
                    containedObjects.push(g);
                }
            } else if (gIndex >= 0) {
                containedObjects.splice(gIndex, 1);
            }
        }

        const numBubbles = this.bubbles.length;
        for (let j = 0; j < numBubbles; j++) {
            const b = this.bubbles[j]!;
            const distance = Vector.distance(b.x, b.y, rc.x, rc.y);
            const bIndex = containedObjects.indexOf(b);

            if (distance <= rc.sizeInPixels + 10 * this.PM) {
                if (bIndex < 0) {
                    containedObjects.push(b);
                }
            } else if (bIndex >= 0) {
                containedObjects.splice(bIndex, 1);
            }
        }

        if (rc.removeOnNextUpdate) {
            removeCircleIndex = i;
        }

        rc.update(delta);
    }

    if (removeCircleIndex >= 0) {
        this.rotatedCircles.splice(removeCircleIndex, 1);
    }

    // rockets
    for (let i = 0, len = this.rockets.length; i < len; i++) {
        const rocket = this.rockets[i];
        if (!rocket) {
            continue;
        }

        rocket.update(delta);
        rocket.updateRotation();

        const star = rocket.attachedStar || this.star;
        const distance = Vector.distance(
            star.pos.x,
            star.pos.y,
            rocket.point.pos.x,
            rocket.point.pos.y
        );

        if (rocket.state === Rocket.State.FLY || rocket.state === Rocket.State.DISTANCE) {
            for (let j = 0; j < 30; j++) {
                star.satisfyConstraints();
                rocket.point.satisfyConstraints();
            }
            rocket.rotation = MathHelper.normalizeAngle360(
                rocket.startRotation + this.candyMain.rotation - rocket.startCandyRotation
            );
        }

        if (rocket.state === Rocket.State.FLY) {
            this.lastCandyRotateDelta = 0;

            let hasTension = false;
            for (let j = 0, blen = this.bungees.length; j < blen; j++) {
                const grab = this.bungees[j];
                if (!grab) {
                    continue;
                }

                const rope = grab.rope;
                if (
                    rope &&
                    rope.tail === star &&
                    rope.cut === Constants.UNDEFINED &&
                    rope.relaxed > 0
                ) {
                    hasTension = true;
                    const anchor = rope.bungeeAnchor;
                    const tail = rope.parts[rope.parts.length - 1];
                    const diff = Vector.subtract(anchor.pos, tail.pos);
                    const perp = Vector.perpendicular(diff);
                    const rperp = Vector.rPerpendicular(diff);
                    const rocketRad = Radians.fromDegrees(rocket.rotation);

                    let angle1 = Radians.toDegrees(perp.normalizedAngle() - rocketRad);
                    let angle2 = Radians.toDegrees(rperp.normalizedAngle() - rocketRad);

                    rocket.additionalAngle = MathHelper.normalizeAngle360(rocket.additionalAngle);
                    angle1 = MathHelper.nearestAngleTo(rocket.additionalAngle, angle1);
                    angle2 = MathHelper.nearestAngleTo(rocket.additionalAngle, angle2);

                    const diff1 = MathHelper.minAngleBetween(rocket.additionalAngle, angle1);
                    const diff2 = MathHelper.minAngleBetween(rocket.additionalAngle, angle2);
                    const target = diff1 < diff2 ? angle1 : angle2;

                    rocket.additionalAngle = Mover.moveToTarget(
                        rocket.additionalAngle,
                        target,
                        90,
                        delta
                    );
                }
            }

            rocket.rotation = MathHelper.normalizeAngle360(
                rocket.rotation + rocket.additionalAngle
            );
            rocket.updateRotation();

            const direction = Vector.forAngle(rocket.angle + Math.PI);
            let impulseMagnitude = rocket.impulse;
            if (hasTension) {
                impulseMagnitude *= rocket.impulseFactor;
            }
            const impulse = Vector.multiply(direction, impulseMagnitude);
            star.applyImpulse(impulse, delta);
            star.disableGravity = true;

            rocket.point.pos.x = star.pos.x;
            rocket.point.pos.y = star.pos.y;
            rocket.point.prevPos.copyFrom(rocket.point.pos);

            // Check if rocket (with candy) goes out of bounds
            if (this.pointOutOfScreen(star) && !this.noCandy) {
                this.noCandy = true;
                this.stopActiveRocket(rocket);
                if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
                    this.dd.callObject(this, this.gameLost, null, 0.3);
                }
                return false;
            }

            if (rocket.time !== -1) {
                rocket.time = Mover.moveToTarget(rocket.time, 0, 1, delta);
                if (rocket.time === 0) {
                    this.stopActiveRocket(rocket);
                }
            }
        }

        if (rocket.state === Rocket.State.DISTANCE) {
            const newRest = Mover.moveToTarget(distance, 0, 200, delta);
            if (newRest === 0) {
                rocket.state = Rocket.State.FLY;
            } else {
                rocket.point.changeRestLength(star, newRest);
            }
        }

        if (
            rocket.state === Rocket.State.IDLE &&
            !this.noCandy &&
            GameObject.objectsIntersectRotatedWithUnrotated(rocket, this.candy)
        ) {
            if (rocket.mover) {
                rocket.mover.pause();
            }

            rocket.point.removeConstraints();
            rocket.startRotation = rocket.rotation;
            rocket.point.addConstraint(this.star, distance, ConstraintType.NOT_MORE_THAN);
            rocket.state = Rocket.State.DISTANCE;
            rocket.attachedStar = this.star;

            this.lastCandyRotateDelta = 0;

            const deltaPos = Vector.subtract(this.star.pos, this.star.prevPos);
            if (!this.star.disableGravity) {
                const adjust = Vector.divide(deltaPos, 1.25);
                this.star.prevPos.add(adjust);
            } else {
                const adjust = Vector.divide(deltaPos, 2);
                this.star.prevPos.add(adjust);
            }

            this.star.disableGravity = true;

            if (this.activeRocket && this.activeRocket !== rocket) {
                this.stopActiveRocket(this.activeRocket);
            }

            rocket.startCandyRotation = this.candyMain.rotation;
            rocket.isOperating = -1;
            rocket.rotateHandled = false;
            rocket.additionalAngle = 0;

            rocket.onExhausted = (exhaustedRocket) => this.handleRocketExhausted(exhaustedRocket);
            this.activeRocket = rocket;

            const texture = ResourceMgr.getTexture(ResourceId.IMG_OBJ_ROCKET);
            if (texture) {
                const sparks = new RocketSparks(40, texture, [
                    ROCKET_FRAMES.SPARKLE_1,
                    ROCKET_FRAMES.SPARKLE_2,
                    ROCKET_FRAMES.SPARKLE_3,
                    ROCKET_FRAMES.SPARKLE_4,
                ]);
                sparks.x = rocket.x;
                sparks.y = rocket.y;
                sparks.angle = rocket.rotation;
                sparks.initialAngle = rocket.angle - Math.PI;
                sparks.onFinished = this.aniPool.particlesFinishedDelegate();
                sparks.startSystem(0);
                this.aniPool.addChild(sparks);
                rocket.particles = sparks;

                const clouds = new RocketClouds(20, texture, [ROCKET_FRAMES.CLOUD]);
                clouds.x = rocket.x;
                clouds.y = rocket.y;
                clouds.angle = rocket.rotation;
                clouds.initialAngle = rocket.angle - Math.PI;
                clouds.onFinished = this.aniPool.particlesFinishedDelegate();
                clouds.startSystem(0);
                this.aniPool.addChild(clouds);
                rocket.cloudParticles = clouds;
            }

            const loopKey = `rocket-loop-${this.rocketLoopCounter++}`;
            rocket.startAnimation(loopKey);
        }
    }

    // socks / magic hats
    for (let i = 0, len = this.socks.length; i < len; i++) {
        const s = this.socks[i]!;
        s.update(delta);
        const moveStatus = Mover.moveToTargetWithStatus(s.idleTimeout, 0, 1, delta);
        s.idleTimeout = moveStatus.value;
        if (moveStatus.reachedZero) {
            s.state = Sock.StateType.IDLE;
        }

        const savedRotation = s.rotation;
        s.rotation = 0;
        s.updateRotation();
        const rs = this.star.posDelta.copy();
        rs.rotate(Radians.fromDegrees(-savedRotation));
        s.rotation = savedRotation;
        s.updateRotation();

        const bbX = this.star.pos.x - resolution.STAR_SOCK_RADIUS;
        const bbY = this.star.pos.y - resolution.STAR_SOCK_RADIUS;
        const bbW = resolution.STAR_SOCK_RADIUS * 2;
        const bbH = bbW;

        if (
            rs.y >= 0 &&
            (Rectangle.lineInRect(s.t1.x, s.t1.y, s.t2.x, s.t2.y, bbX, bbY, bbW, bbH) ||
                Rectangle.lineInRect(s.b1.x, s.b1.y, s.b2.x, s.b2.y, bbX, bbY, bbW, bbH))
        ) {
            if (s.state === Sock.StateType.IDLE) {
                // look for a receiving sock
                for (let j = 0; j < len; j++) {
                    const n = this.socks[j]!;
                    if (n !== s && n.group === s.group) {
                        s.state = Sock.StateType.RECEIVING;
                        n.state = Sock.StateType.THROWING;
                        this.releaseAllRopes(false);

                        this.savedSockSpeed =
                            GameSceneConstants.SOCK_SPEED_K *
                            this.star.v.getLength() *
                            resolution.PHYSICS_SPEED_MULTIPLIER;
                        this.targetSock = n;

                        const { light } = s;
                        light?.playTimeline(0);
                        if (light) {
                            light.visible = true;
                        }

                        const teleportSound = IS_XMAS
                            ? ResourceId.SND_TELEPORT_XMAS
                            : ResourceId.SND_TELEPORT;
                        SoundMgr.playSound(teleportSound);

                        this.dd.callObject(this, this.teleport, null, 0.1);
                        break;
                    }
                }
                break;
            }
        } else if (s.state !== Sock.StateType.IDLE && s.idleTimeout === 0) {
            s.idleTimeout = Sock.IDLE_TIMEOUT;
        }
    }

    // pumps
    for (let i = 0, len = this.pumps.length; i < len; i++) {
        const p = this.pumps[i]!;
        p.update(delta);

        const moveStatus = Mover.moveToTargetWithStatus(p.touchTimer, 0, 1, delta);
        p.touchTimer = moveStatus.value;
        if (moveStatus.reachedZero) {
            this.operatePump(p, delta);
        }
    }

    // razors
    for (let i = 0, len = this.razors.length; i < len; i++) {
        const r = this.razors[i]!;
        r.update(delta);
        this.cut(r, Vector.zero, Vector.zero, false);
    }

    // spikes
    const starSpikeRadius = resolution.STAR_SPIKE_RADIUS;

    for (let i = 0, len = this.spikes.length; i < len; i++) {
        const s = this.spikes[i]!;

        // only update if something happens
        if (s.mover || s.shouldUpdateRotation || s.electro) {
            s.update(delta);
        }

        if (!s.electro || s.electroOn) {
            let candyHits = false;
            let left = false;
            if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                candyHits = !this.noCandyL && isCandyHit(s, this.starL, starSpikeRadius);
                if (candyHits) {
                    left = true;
                } else {
                    candyHits = !this.noCandyR && isCandyHit(s, this.starR, starSpikeRadius);
                }
            } else {
                candyHits = !this.noCandy && isCandyHit(s, this.star, starSpikeRadius);
            }

            if (candyHits) {
                if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                    if (left) {
                        if (this.candyBubbleL) {
                            this.popCandyBubble(true);
                        }
                    } else if (this.candyBubbleR) {
                        this.popCandyBubble(false);
                    }
                } else if (this.candyBubble) {
                    this.popCandyBubble(false);
                }

                const candyTexture = ResourceMgr.getTexture(this.candyResourceId);
                if (candyTexture) {
                    const breakEffect = new CandyBreak(5, candyTexture, {
                        resourceId: this.candyResourceId,
                    });
                    if (this.gravityButton && !this.gravityNormal) {
                        breakEffect.gravity.y = -500;
                        breakEffect.angle = 90;
                    }

                    breakEffect.onFinished = this.aniPool.particlesFinishedDelegate();

                    if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                        if (left) {
                            breakEffect.x = this.candyL.x;
                            breakEffect.y = this.candyL.y;
                        } else {
                            breakEffect.x = this.candyR.x;
                            breakEffect.y = this.candyR.y;
                        }
                    } else {
                        breakEffect.x = this.candy.x;
                        breakEffect.y = this.candy.y;
                    }

                    breakEffect.startSystem(5);
                    this.aniPool.addChild(breakEffect);
                }

                if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                    if (left) {
                        this.noCandyL = true;
                    } else {
                        this.noCandyR = true;
                    }
                } else {
                    this.noCandy = true;
                }
                SoundMgr.playSound(ResourceId.SND_CANDY_BREAK);
                this.releaseAllRopes(left);

                this.stopActiveRocket();

                if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
                    this.dd.callObject(this, this.gameLost, null, 0.3);
                }

                return false;
            }
        }
    }

    // bouncers
    const bouncerRadius = resolution.BOUNCER_RADIUS;

    for (let i = 0, len = this.bouncers.length; i < len; i++) {
        const bouncer = this.bouncers[i]!;
        bouncer.update(delta);

        let candyHits = false;
        let left = false;
        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            candyHits = !this.noCandyL && isCandyHit(bouncer, this.starL, bouncerRadius);
            if (candyHits) {
                left = true;
            } else {
                candyHits = !this.noCandyR && isCandyHit(bouncer, this.starR, bouncerRadius);
            }
        } else {
            candyHits = !this.noCandy && isCandyHit(bouncer, this.star, bouncerRadius);
        }

        if (candyHits) {
            if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                if (left) {
                    this.handleBounce(bouncer, this.starL, delta);
                } else {
                    this.handleBounce(bouncer, this.starR, delta);
                }
            } else {
                this.handleBounce(bouncer, this.star, delta);
            }

            break; // stop after hit
        } else {
            bouncer.skip = 0;
        }
    }

    // apply force to bubbles
    const gravityMultiplier = this.gravityButton && !this.gravityNormal ? -1 : 1;
    const yImpulse = resolution.BUBBLE_IMPULSE_Y * gravityMultiplier;
    const rd = resolution.BUBBLE_IMPULSE_RD;

    // apply candy impulse
    if (this.twoParts === GameSceneConstants.PartsType.SEPARATE) {
        if (this.candyBubbleL) {
            applyStarImpulse(this.starL, rd, yImpulse, delta);
        }
        if (this.candyBubbleR) {
            applyStarImpulse(this.starR, rd, yImpulse, delta);
        }
    }
    if (this.twoParts === GameSceneConstants.PartsType.DISTANCE) {
        if (this.candyBubbleL || this.candyBubbleR) {
            applyStarImpulse(this.starL, rd, yImpulse, delta);
            applyStarImpulse(this.starR, rd, yImpulse, delta);
        }
    } else if (this.candyBubble) {
        applyStarImpulse(this.star, rd, yImpulse, delta);
    }

    return true;
}
