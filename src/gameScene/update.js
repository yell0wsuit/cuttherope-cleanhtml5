import Animation from "@/visual/Animation";
import Alignment from "@/core/Alignment";
import Bungee from "@/game/Bungee";
import CandyBreak from "@/game/CandyBreak";
import Canvas from "@/utils/Canvas";
import Constants from "@/utils/Constants";
import ConstraintType from "@/physics/ConstraintType";
import GameObject from "@/visual/GameObject";
import * as GameSceneConstants from "@/gameScene/constants";
import ImageElement from "@/visual/ImageElement";
import KeyFrame from "@/visual/KeyFrame";
import MathHelper from "@/utils/MathHelper";
import Mover from "@/utils/Mover";
import PumpDirt from "@/game/PumpDirt";
import Radians from "@/utils/Radians";
import Rectangle from "@/core/Rectangle";
import ResourceId from "@/resources/ResourceId";
import ResourceMgr from "@/resources/ResourceMgr";
import RGBAColor from "@/core/RGBAColor";
import SoundMgr from "@/game/CTRSoundMgr";
import Timeline from "@/visual/Timeline";
import Vector from "@/core/Vector";
import Camera2D from "@/visual/Camera2D";
import resolution from "@/resolution";
import PubSub from "@/utils/PubSub";
import Sock from "@/game/Sock";
import { IS_XMAS } from "@/resources/ResData";
import settings from "@/game/CTRSettings";

function applyStarImpulse(star, rd, yImpulse, delta) {
    star.applyImpulse(new Vector(-star.v.x / rd, -star.v.y / rd + yImpulse), delta);
}

function isCandyHit(bouncer, star, bouncer_radius) {
    const bouncer_radius_double = bouncer_radius * 2;
    return (
        Rectangle.lineInRect(
            bouncer.t1.x,
            bouncer.t1.y,
            bouncer.t2.x,
            bouncer.t2.y,
            star.pos.x - bouncer_radius,
            star.pos.y - bouncer_radius,
            bouncer_radius_double,
            bouncer_radius_double
        ) ||
        Rectangle.lineInRect(
            bouncer.b1.x,
            bouncer.b1.y,
            bouncer.b2.x,
            bouncer.b2.y,
            star.pos.x - bouncer_radius,
            star.pos.y - bouncer_radius,
            bouncer_radius_double,
            bouncer_radius_double
        )
    );
}

export const GameSceneUpdate = {
    update: function (delta) {
        let i, len, moveResult;
        for (i = 0, len = this.drawings.length; i < len; i++) {
            this.drawings[i].update(delta);
        }

        this._super(delta);
        this.dd.update(delta);

        if (this.pollenDrawer) {
            this.pollenDrawer.update(delta);
        }

        for (i = 0; i < Constants.MAX_TOUCHES; i++) {
            const cuts = this.fingerCuts[i];
            let numCuts = cuts.length,
                k = 0;

            while (k < numCuts) {
                const fc = cuts[k];
                moveResult = Mover.moveToTargetWithStatus(fc.color.a, 0, 10, delta);
                fc.color.a = moveResult.value;
                if (moveResult.reachedZero) {
                    cuts.splice(k, 1);
                    numCuts--;
                } else {
                    k++;
                }
            }
        }

        for (i = 0, len = this.earthAnims.length; i < len; i++) {
            this.earthAnims[i].update(delta);
        }

        this.ropesAtOnceTimer = Mover.moveToTarget(this.ropesAtOnceTimer, 0, 1, delta);

        if (this.attachCount === 0) {
            this.juggleTimer += delta;

            // has it been 30 secs since the candy was attached?
            if (this.juggleTimer > GameSceneConstants.CANDY_JUGGLER_TIME) {
                //Achievements.increment(AchievementId.CANDY_JUGGLER);

                // reset the timer
                this.juggleTimer = 0;
            }
        }

        const SCREEN_WIDTH = resolution.CANVAS_WIDTH,
            SCREEN_HEIGHT = resolution.CANVAS_HEIGHT,
            cameraTarget =
                this.twoParts != GameSceneConstants.PartsType.NONE ? this.starL : this.star,
            xScroll = cameraTarget.pos.x - SCREEN_WIDTH / 2,
            yScroll = cameraTarget.pos.y - SCREEN_HEIGHT / 2,
            targetX = MathHelper.fitToBoundaries(xScroll, 0, this.mapWidth - SCREEN_WIDTH),
            targetY = MathHelper.fitToBoundaries(yScroll, 0, this.mapHeight - SCREEN_HEIGHT);

        this.camera.moveTo(targetX, targetY, false);

        // NOTE: mac sources indicate this is temporary?
        if (!(this.freezeCamera && this.camera.type === Camera2D.SpeedType.DELAY)) {
            this.camera.update(delta);
        }

        if (this.camera.type === Camera2D.SpeedType.PIXELS) {
            const IGNORE_TOUCHES_DISTANCE = resolution.IGNORE_TOUCHES_DISTANCE,
                PREVIEW_CAMERA_SPEED = resolution.PREVIEW_CAMERA_SPEED,
                PREVIEW_CAMERA_SPEED2 = resolution.PREVIEW_CAMERA_SPEED2,
                MAX_PREVIEW_CAMERA_SPEED = resolution.MAX_PREVIEW_CAMERA_SPEED,
                MIN_PREVIEW_CAMERA_SPEED = resolution.MIN_PREVIEW_CAMERA_SPEED;

            const starDistance = this.camera.pos.distance(new Vector(targetX, targetY));
            if (starDistance < IGNORE_TOUCHES_DISTANCE) {
                this.ignoreTouches = false;
            }

            if (this.fastenCamera) {
                if (this.camera.speed < resolution.CAMERA_SPEED_THRESHOLD) {
                    this.camera.speed *= 1.5;
                }
            } else {
                if (starDistance > this.initialCameraToStarDistance / 2.0) {
                    this.camera.speed += delta * PREVIEW_CAMERA_SPEED;
                    this.camera.speed = Math.min(MAX_PREVIEW_CAMERA_SPEED, this.camera.speed);
                } else {
                    this.camera.speed -= delta * PREVIEW_CAMERA_SPEED2;
                    this.camera.speed = Math.max(MIN_PREVIEW_CAMERA_SPEED, this.camera.speed);
                }
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

        const numGrabs = this.bungees.length;
        if (numGrabs > 0) {
            let handledRotation = false,
                handledRotationL = false,
                handledRotationR = false;

            for (i = 0; i < numGrabs; i++) {
                // yes, its a little confusing that the bungees array
                // actually holds grabs
                const g = this.bungees[i];
                g.update(delta);

                const b = g.rope;

                if (g.mover) {
                    if (b) {
                        b.bungeeAnchor.pos.x = g.x;
                        b.bungeeAnchor.pos.y = g.y;
                        b.bungeeAnchor.pin.copyFrom(b.bungeeAnchor.pos);
                    }
                }

                if (b) {
                    if (b.cut !== Constants.UNDEFINED && b.cutTime === 0) {
                        g.destroyRope();
                        continue;
                    }

                    b.update(delta * this.ropePhysicsSpeed);

                    if (g.hasSpider) {
                        if (this.camera.type != Camera2D.SpeedType.PIXELS || !this.ignoreTouches) {
                            g.updateSpider(delta);
                        }

                        if (g.spiderPos === Constants.UNDEFINED) {
                            this.spiderWon(g);
                            break;
                        }
                    }
                }

                if (g.radius !== Constants.UNDEFINED && !g.rope) {
                    // shared code for creating a rope with a star
                    const STAR_RADIUS = resolution.STAR_RADIUS,
                        createRope = function (star) {
                            const l = new Vector(g.x, g.y).distance(star.pos);
                            if (l <= g.radius + STAR_RADIUS) {
                                const b = new Bungee(
                                    null,
                                    g.x,
                                    g.y, // head
                                    star,
                                    star.pos.x,
                                    star.pos.y, // tail
                                    g.radius + STAR_RADIUS
                                );
                                b.bungeeAnchor.pin.copyFrom(b.bungeeAnchor.pos);
                                g.hideRadius = true;
                                g.setRope(b);

                                this.attachCandy();

                                SoundMgr.playSound(ResourceId.SND_ROPE_GET);
                                if (g.mover) {
                                    SoundMgr.playSound(ResourceId.SND_BUZZ);
                                }
                            }
                        }.bind(this);

                    if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                        if (!this.noCandyL) {
                            createRope(this.starL);
                        }
                        if (!this.noCandyR && g.rope == null) {
                            createRope(this.starR);
                        }
                    } else {
                        createRope(this.star);
                    }
                }

                if (b) {
                    const prev = b.bungeeAnchor,
                        tail = b.parts[b.parts.length - 1],
                        v = Vector.subtract(prev.pos, tail.pos);
                    let hasCandy = false;

                    if (!handledRotation) {
                        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                            if (tail === this.starL && !this.noCandyL && !handledRotationL) {
                                hasCandy = true;
                            } else if (tail === this.starR && !this.noCandyR && !handledRotationR) {
                                hasCandy = true;
                            }
                        } else if (!this.noCandy && !handledRotation) {
                            hasCandy = true;
                        }
                    }

                    if (b.relaxed !== 0 && b.cut === Constants.UNDEFINED && hasCandy) {
                        const a = Radians.toDegrees(v.normalizedAngle());
                        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                            const candyPart = tail === this.starL ? this.candyL : this.candyR;
                            if (!b.chosenOne) {
                                b.initialCandleAngle = candyPart.rotation - a;
                            }

                            if (tail === this.starL) {
                                this.lastCandyRotateDeltaL =
                                    a + b.initialCandleAngle - candyPart.rotation;
                                handledRotationL = true;
                            } else {
                                this.lastCandyRotateDeltaR =
                                    a + b.initialCandleAngle - candyPart.rotation;
                                handledRotationR = true;
                            }
                            candyPart.rotation = a + b.initialCandleAngle;
                        } else {
                            if (!b.chosenOne) {
                                b.initialCandleAngle = this.candyMain.rotation - a;
                            }
                            this.lastCandyRotateDelta =
                                a + b.initialCandleAngle - this.candyMain.rotation;
                            this.candyMain.rotation = a + b.initialCandleAngle;
                            handledRotation = true;
                        }

                        b.chosenOne = true;
                    } else {
                        b.chosenOne = false;
                    }
                }
            }

            if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                if (!handledRotationL && !this.noCandyL) {
                    this.candyL.rotation += Math.min(5, this.lastCandyRotateDeltaL);
                    this.lastCandyRotateDeltaL *= 0.98;
                }
                if (!handledRotationR && !this.noCandyR) {
                    this.candyR.rotation += Math.min(5, this.lastCandyRotateDeltaR);
                    this.lastCandyRotateDeltaR *= 0.98;
                }
            } else {
                if (!handledRotation && !this.noCandy) {
                    this.candyMain.rotation += Math.min(5, this.lastCandyRotateDelta);
                    this.lastCandyRotateDelta *= 0.98;
                }
            }
        }

        if (!this.noCandy) {
            this.candy.update(delta);
            this.star.update(delta * this.ropePhysicsSpeed);
        }

        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            const ropeDelta = delta * this.ropePhysicsSpeed;
            this.candyL.update(delta);
            this.starL.update(ropeDelta);
            this.candyR.update(delta);
            this.starR.update(ropeDelta);
            if (this.twoParts === GameSceneConstants.PartsType.DISTANCE) {
                for (i = 0; i < Bungee.BUNGEE_RELAXION_TIMES; i++) {
                    this.starL.satisfyConstraints();
                    this.starR.satisfyConstraints();
                }
            }
            if (this.partsDist > 0) {
                moveResult = Mover.moveToTargetWithStatus(this.partsDist, 0, 200, delta);
                this.partsDist = moveResult.value;
                if (moveResult.reachedZero) {
                    SoundMgr.playSound(ResourceId.SND_CANDY_LINK);
                    this.twoParts = GameSceneConstants.PartsType.NONE;
                    this.noCandy = false;
                    this.noCandyL = true;
                    this.noCandyR = true;

                    //Achievements.increment(AchievementId.ROMANTIC_SOUL);

                    if (this.candyBubbleL || this.candyBubbleR) {
                        this.candyBubble = this.candyBubbleL
                            ? this.candyBubbleL
                            : this.candyBubbleR;
                        this.candyBubbleAnimation.visible = true;
                    }

                    this.lastCandyRotateDelta = 0;
                    this.lastCandyRotateDeltaL = 0;
                    this.lastCandyRotateDeltaR = 0;

                    this.star.pos.x = this.starL.pos.x;
                    this.star.pos.y = this.starL.pos.y;
                    this.candy.x = this.star.pos.x;
                    this.candy.y = this.star.pos.y;
                    this.candy.calculateTopLeft();

                    const lv = Vector.subtract(this.starL.pos, this.starL.prevPos),
                        rv = Vector.subtract(this.starR.pos, this.starR.prevPos),
                        sv = new Vector((lv.x + rv.x) / 2, (lv.y + rv.y) / 2);
                    this.star.prevPos.copyFrom(this.star.pos);
                    this.star.prevPos.subtract(sv);

                    for (let i = 0, count = this.bungees.length; i < count; i++) {
                        const g = this.bungees[i],
                            b = g.rope;
                        if (
                            b &&
                            b.cut !== b.parts.length - 3 &&
                            (b.tail === this.starL || b.tail === this.starR)
                        ) {
                            const prev = b.parts[b.parts.length - 2],
                                heroRestLen = b.tail.restLength(prev);
                            this.star.addConstraint(prev, heroRestLen, ConstraintType.DISTANCE);
                            b.tail = this.star;
                            b.parts[b.parts.length - 1] = this.star;
                            b.initialCandleAngle = 0;
                            b.chosenOne = false;
                        }
                    }

                    const transform = new Animation();
                    transform.initTextureWithId(this.candyResourceId);
                    transform.doRestoreCutTransparency();
                    transform.x = this.candy.x;
                    transform.y = this.candy.y;
                    transform.anchor = Alignment.CENTER;
                    const a = transform.addAnimationDelay(
                        0.05,
                        Timeline.LoopType.NO_LOOP,
                        GameSceneConstants.IMG_OBJ_CANDY_01_part_fx_start,
                        GameSceneConstants.IMG_OBJ_CANDY_01_part_fx_end
                    );
                    transform.getTimeline(a).onFinished = this.aniPool.timelineFinishedDelegate();
                    transform.playTimeline(0);
                    this.aniPool.addChild(transform);
                } else {
                    this.starL.changeRestLength(this.starR, this.partsDist);
                    this.starR.changeRestLength(this.starL, this.partsDist);
                }
            }

            if (
                !this.noCandyL &&
                !this.noCandyR &&
                this.twoParts === GameSceneConstants.PartsType.SEPARATE &&
                GameObject.intersect(this.candyL, this.candyR)
            ) {
                this.twoParts = GameSceneConstants.PartsType.DISTANCE;
                this.partsDist = this.starL.pos.distance(this.starR.pos);
                this.starL.addConstraint(this.starR, this.partsDist, ConstraintType.NOT_MORE_THAN);
                this.starR.addConstraint(this.starL, this.partsDist, ConstraintType.NOT_MORE_THAN);
            }
        }

        this.target.update(delta);

        if (this.camera.type !== Camera2D.SpeedType.PIXELS || !this.ignoreTouches) {
            for (i = 0, len = this.stars.length; i < len; i++) {
                const s = this.stars[i];
                if (!s) continue;
                s.update(delta);

                if (s.timeout > 0 && s.time === 0) {
                    s.getTimeline(1).onFinished = this.aniPool.timelineFinishedDelegate();
                    this.aniPool.addChild(s);
                    this.stars.splice(i, 1);
                    s.timedAnim.playTimeline(1);
                    s.playTimeline(1);
                    break;
                } else {
                    let hits = false;
                    if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                        hits =
                            (GameObject.intersect(this.candyL, s) && !this.noCandyL) ||
                            (GameObject.intersect(this.candyR, s) && !this.noCandyR);
                    } else {
                        hits = GameObject.intersect(this.candy, s) && !this.noCandy;
                    }

                    if (hits) {
                        this.candyBlink.playTimeline(GameSceneConstants.CandyBlink.STAR);
                        this.starsCollected++;
                        this.hudStars[this.starsCollected - 1].playTimeline(0);

                        const starDisappear = this.starDisappearPool[i];
                        starDisappear.x = s.x;
                        starDisappear.y = s.y;

                        starDisappear.playTimeline(0);
                        this.aniPool.addChild(starDisappear);

                        this.stars[i] = null;
                        SoundMgr.playSound(ResourceId.SND_STAR_1 + this.starsCollected - 1);

                        if (
                            this.target.currentTimelineIndex ===
                            GameSceneConstants.CharAnimation.IDLE
                        ) {
                            this.target.playTimeline(GameSceneConstants.CharAnimation.EXCITED);
                        }

                        break;
                    }
                }
            }
        }

        for (i = 0, len = this.bubbles.length; i < len; i++) {
            const b = this.bubbles[i];
            b.update(delta);

            if (!b.popped) {
                if (this.twoParts != GameSceneConstants.PartsType.NONE) {
                    if (
                        !this.noCandyL &&
                        this.isBubbleCapture(
                            b,
                            this.candyL,
                            this.candyBubbleL,
                            this.candyBubbleAnimationL
                        )
                    ) {
                        this.candyBubbleL = b;
                        break;
                    }

                    if (
                        !this.noCandyR &&
                        this.isBubbleCapture(
                            b,
                            this.candyR,
                            this.candyBubbleR,
                            this.candyBubbleAnimationR
                        )
                    ) {
                        this.candyBubbleR = b;
                        break;
                    }
                } else {
                    if (
                        !this.noCandy &&
                        this.isBubbleCapture(
                            b,
                            this.candy,
                            this.candyBubble,
                            this.candyBubbleAnimation
                        )
                    ) {
                        this.candyBubble = b;
                        break;
                    }
                }
            }

            if (!b.withoutShadow) {
                const numRotatedCircles = this.rotatedCircles.length;
                for (let j = 0; j < numRotatedCircles; j++) {
                    const rc = this.rotatedCircles[j],
                        distanceToCircle = Vector.distance(b.x, b.y, rc.x, rc.y);
                    if (distanceToCircle < rc.sizeInPixels) {
                        b.withoutShadow = true;
                    }
                }
            }
        }

        // tutorial text
        for (i = 0, len = this.tutorials.length; i < len; i++) {
            const t = this.tutorials[i];
            t.update(delta);
        }

        // tutorial images
        for (i = 0, len = this.tutorialImages.length; i < len; i++) {
            const t = this.tutorialImages[i];
            t.update(delta);
        }

        let removeCircleIndex = -1;
        for (let i = 0, len = this.rotatedCircles.length; i < len; i++) {
            const rc = this.rotatedCircles[i];

            for (let j = 0; j < numGrabs; j++) {
                const g = this.bungees[j],
                    gIndex = rc.containedObjects.indexOf(g),
                    distance = Vector.distance(g.x, g.y, rc.x, rc.y);

                if (distance <= rc.sizeInPixels + 5 * this.PM) {
                    if (gIndex < 0) {
                        rc.containedObjects.push(g);
                    }
                } else if (gIndex >= 0) {
                    rc.containedObjects.splice(g, 1);
                }
            }

            const numBubbles = this.bubbles.length;
            for (let j = 0; j < numBubbles; j++) {
                const b = this.bubbles[j],
                    distance = Vector.distance(b.x, b.y, rc.x, rc.y),
                    bIndex = rc.containedObjects.indexOf(b);

                if (distance <= rc.sizeInPixels + 10 * this.PM) {
                    if (bIndex < 0) {
                        rc.containedObjects.push(b);
                    }
                } else if (bIndex >= 0) {
                    rc.containedObjects.splice(b, 1);
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
        for (i = 0, len = this.rockets.length; i < len; i++) {
            const r = this.rockets[i];
            r.update(delta);
            // TODO: finish
        }

        // socks
        for (i = 0, len = this.socks.length; i < len; i++) {
            const s = this.socks[i];
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

            const bbX = this.star.pos.x - resolution.STAR_SOCK_RADIUS,
                bbY = this.star.pos.y - resolution.STAR_SOCK_RADIUS,
                bbW = resolution.STAR_SOCK_RADIUS * 2,
                bbH = bbW;

            /*
                 // DEBUG: draw the star bounding box
                 let ctx = Canvas.context;
                 ctx.lineWidth = 1;
                 ctx.strokeStyle = 'red';
                 ctx.strokeRect(bbX, bbY, bbW, bbH);
                 */

            if (
                rs.y >= 0 &&
                (Rectangle.lineInRect(s.t1.x, s.t1.y, s.t2.x, s.t2.y, bbX, bbY, bbW, bbH) ||
                    Rectangle.lineInRect(s.b1.x, s.b1.y, s.b2.x, s.b2.y, bbX, bbY, bbW, bbH))
            ) {
                if (s.state === Sock.StateType.IDLE) {
                    // look for a recieving sock
                    for (let j = 0; j < len; j++) {
                        const n = this.socks[j];
                        if (n !== s && n.group === s.group) {
                            s.state = Sock.StateType.RECEIVING;
                            n.state = Sock.StateType.THROWING;
                            this.releaseAllRopes(false);

                            this.savedSockSpeed =
                                GameSceneConstants.SOCK_SPEED_K *
                                this.star.v.getLength() *
                                resolution.PHYSICS_SPEED_MULTIPLIER;
                            this.targetSock = n;

                            s.light.playTimeline(0);
                            s.light.visible = true;
                            IS_XMAS
                                ? SoundMgr.playSound(ResourceId.SND_TELEPORT_XMAS)
                                : SoundMgr.playSound(ResourceId.SND_TELEPORT);
                            this.dd.callObject(this, this.teleport, null, 0.1);
                            break;
                        }
                    }
                    break;
                }
            } else {
                if (s.state !== Sock.StateType.IDLE && s.idleTimeout === 0) {
                    s.idleTimeout = Sock.IDLE_TIMEOUT;
                }
            }
        }

        // pumps
        for (i = 0, len = this.pumps.length; i < len; i++) {
            const p = this.pumps[i];
            p.update(delta);

            const moveStatus = Mover.moveToTargetWithStatus(p.touchTimer, 0, 1, delta);
            p.touchTimer = moveStatus.value;
            if (moveStatus.reachedZero) {
                this.operatePump(p, delta);
            }
        }

        // razors
        for (i = 0, len = this.razors.length; i < len; i++) {
            const r = this.razors[i];
            r.update(delta);
            this.cut(r, null, null, false);
        }

        // spikes
        const star_spike_radius = resolution.STAR_SPIKE_RADIUS,
            star_spike_radius_double = star_spike_radius * 2;
        // isCandyHit = function (spike, star) {
        //     return (
        //         Rectangle.lineInRect(
        //             spike.t1.x, spike.t1.y,
        //             spike.t2.x, spike.t2.y,
        //             star.pos.x - star_spike_radius, star.pos.y - star_spike_radius,
        //             star_spike_radius_double, star_spike_radius_double) ||
        //             Rectangle.lineInRect(
        //                 spike.b1.x, spike.b1.y,
        //                 spike.b2.x, spike.b2.y,
        //                 star.pos.x - star_spike_radius, star.pos.y - star_spike_radius,
        //                 star_spike_radius_double, star_spike_radius_double));
        // };

        for (i = 0, len = this.spikes.length; i < len; i++) {
            const s = this.spikes[i];

            //only update if something happens
            if (s.mover || s.shouldUpdateRotation || s.electro) {
                s.update(delta);
            }

            if (!s.electro || s.electroOn) {
                let candyHits = false,
                    left = false;
                if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                    candyHits = !this.noCandyL && isCandyHit(s, this.starL, star_spike_radius);
                    if (candyHits) {
                        left = true;
                    } else {
                        candyHits = !this.noCandyR && isCandyHit(s, this.starR, star_spike_radius);
                    }
                } else {
                    candyHits = !this.noCandy && isCandyHit(s, this.star, star_spike_radius);
                }

                if (candyHits) {
                    if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                        if (left) {
                            if (this.candyBubbleL) {
                                this.popCandyBubble(true);
                            }
                        } else {
                            if (this.candyBubbleR) {
                                this.popCandyBubble(false);
                            }
                        }
                    } else if (this.candyBubble) {
                        this.popCandyBubble(false);
                    }

                    const candyTexture = ResourceMgr.getTexture(this.candyResourceId),
                        b = new CandyBreak(5, candyTexture, {
                            resourceId: this.candyResourceId,
                        });
                    if (this.gravityButton && !this.gravityNormal) {
                        b.gravity.y = -500;
                        b.angle = 90;
                    }

                    b.onFinished = this.aniPool.particlesFinishedDelegate();

                    if (this.twoParts != GameSceneConstants.PartsType.NONE) {
                        if (left) {
                            b.x = this.candyL.x;
                            b.y = this.candyL.y;
                            this.noCandyL = true;
                        } else {
                            b.x = this.candyR.x;
                            b.y = this.candyR.y;
                            this.noCandyR = true;
                        }
                    } else {
                        b.x = this.candy.x;
                        b.y = this.candy.y;
                        this.noCandy = true;
                    }

                    b.startSystem(5);
                    this.aniPool.addChild(b);
                    SoundMgr.playSound(ResourceId.SND_CANDY_BREAK);
                    this.releaseAllRopes(left);

                    if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
                        this.dd.callObject(this, this.gameLost, null, 0.3);
                    }

                    return;
                }
            }
        }

        // bouncers
        const bouncer_radius = resolution.BOUNCER_RADIUS,
            bouncer_radius_double = bouncer_radius * 2;

        for (i = 0, len = this.bouncers.length; i < len; i++) {
            const bouncer = this.bouncers[i];
            //if (bouncer.mover) {
            bouncer.update(delta);
            //}

            let candyHits = false;
            let left = false;
            if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
                candyHits = !this.noCandyL && isCandyHit(bouncer, this.starL, bouncer_radius);
                if (candyHits) {
                    left = true;
                } else {
                    candyHits = !this.noCandyR && isCandyHit(bouncer, this.starR, bouncer_radius);
                }
            } else {
                candyHits = !this.noCandy && isCandyHit(bouncer, this.star, bouncer_radius);
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

                break; //stop after hit
            } else {
                bouncer.skip = false;
            }
        }

        // apply force to bubbles
        const gravityMultiplier = this.gravityButton && !this.gravityNormal ? -1 : 1,
            yImpulse = resolution.BUBBLE_IMPULSE_Y * gravityMultiplier,
            rd = resolution.BUBBLE_IMPULSE_RD;

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
        } else {
            if (this.candyBubble) {
                applyStarImpulse(this.star, rd, yImpulse, delta);
            }
        }

        let targetVector;
        if (!this.noCandy) {
            const MOUTH_OPEN_RADIUS = resolution.MOUTH_OPEN_RADIUS;
            if (!this.mouthOpen) {
                targetVector = new Vector(this.target.x, this.target.y);
                if (this.star.pos.distance(targetVector) < MOUTH_OPEN_RADIUS) {
                    this.mouthOpen = true;
                    this.target.playTimeline(GameSceneConstants.CharAnimation.MOUTH_OPEN);
                    SoundMgr.playSound(ResourceId.SND_MONSTER_OPEN);
                    this.mouthCloseTimer = GameSceneConstants.MOUTH_OPEN_TIME;
                }
            } else {
                if (this.mouthCloseTimer > 0) {
                    this.mouthCloseTimer = Mover.moveToTarget(this.mouthCloseTimer, 0, 1, delta);

                    if (this.mouthCloseTimer <= 0) {
                        targetVector = new Vector(this.target.x, this.target.y);
                        if (this.star.pos.distance(targetVector) > MOUTH_OPEN_RADIUS) {
                            this.mouthOpen = false;
                            this.target.playTimeline(GameSceneConstants.CharAnimation.MOUTH_CLOSE);
                            SoundMgr.playSound(ResourceId.SND_MONSTER_CLOSE);

                            // this.tummyTeasers++;
                            // if (this.tummyTeasers === 10) {
                            //     Achievements.increment(AchievementId.TUMMY_TEASER);
                            // }
                        } else {
                            this.mouthCloseTimer = GameSceneConstants.MOUTH_OPEN_TIME;
                        }
                    }
                }
            }

            if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
                if (GameObject.intersect(this.candy, this.target)) {
                    this.gameWon();
                    return;
                }
            }
        }

        const outOfScreen =
                this.twoParts === GameSceneConstants.PartsType.NONE &&
                this.pointOutOfScreen(this.star) &&
                !this.noCandy,
            outOfScreenL =
                this.twoParts !== GameSceneConstants.PartsType.NONE &&
                this.pointOutOfScreen(this.starL) &&
                !this.noCandyL,
            outOfScreenR =
                this.twoParts !== GameSceneConstants.PartsType.NONE &&
                this.pointOutOfScreen(this.starR) &&
                !this.noCandyR;

        if (outOfScreen || outOfScreenL || outOfScreenR) {
            if (outOfScreen) {
                this.noCandy = true;
            }
            if (outOfScreenL) {
                this.noCandyL = true;
            }
            if (outOfScreenR) {
                this.noCandyR = true;
            }

            if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
                // lost candy achievements
                // Achievements.increment(AchievementId.WEIGHT_LOSER);
                // Achievements.increment(AchievementId.CALORIE_MINIMIZER);

                if (
                    this.twoParts != GameSceneConstants.PartsType.NONE &&
                    this.noCandyL &&
                    this.noCandyR
                ) {
                    return;
                }
                this.gameLost();
                return;
            }
        }

        if (this.special !== 0) {
            if (this.special === 1) {
                if (
                    !this.noCandy &&
                    this.candyBubble != null &&
                    this.candy.y < resolution.CANDY_BUBBLE_TUTORIAL_LIMIT_Y &&
                    this.candy.x > resolution.CANDY_BUBBLE_TUTORIAL_LIMIT_X
                ) {
                    this.special = 0;

                    // tutorial text
                    for (i = 0, len = this.tutorials.length; i < len; i++) {
                        const t = this.tutorials[i];
                        if (t.special === 1) {
                            t.playTimeline(0);
                        }
                    }

                    // tutorial images
                    for (i = 0, len = this.tutorialImages.length; i < len; i++) {
                        const t = this.tutorialImages[i];
                        if (t.special === 1) {
                            t.playTimeline(0);
                        }
                    }
                }
            }
        }

        if (this.clickToCut && !this.ignoreTouches) {
            this.resetBungeeHighlight();

            // first see if there is a nearby bungee
            const cv = new Vector(0, 0),
                pos = Vector.add(this.slastTouch, this.camera.pos),
                grab = this.getNearestBungeeGrabByBezierPoints(cv, pos.x, pos.y);
            const b = grab ? grab.rope : null;
            if (b) {
                // now see if there is an active element that would override
                // bungee selection
                let activeElement = false;
                if (this.gravityButton) {
                    const c = this.gravityButton.getChild(this.gravityButton.isOn() ? 1 : 0);
                    if (c.isInTouchZone(pos.x, pos.y, true)) {
                        activeElement = true;
                    }
                }

                if (
                    this.candyBubble ||
                    (this.twoParts != GameSceneConstants.PartsType.NONE &&
                        (this.candyBubbleL || this.candyBubbleR))
                ) {
                    for (i = 0, len = this.bubbles.length; i < len; i++) {
                        const s = this.bubbles[i],
                            BUBBLE_RADIUS = resolution.BUBBLE_RADIUS,
                            BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
                        if (this.candyBubble) {
                            if (
                                Rectangle.pointInRect(
                                    pos.x,
                                    pos.y,
                                    this.star.pos.x - BUBBLE_RADIUS,
                                    this.star.pos.y - BUBBLE_RADIUS,
                                    BUBBLE_DIAMETER,
                                    BUBBLE_DIAMETER
                                )
                            ) {
                                activeElement = true;
                                break;
                            }
                        }

                        if (this.candyBubbleL) {
                            if (
                                Rectangle.pointInRect(
                                    pos.x,
                                    pos.y,
                                    this.starL.pos.x - BUBBLE_RADIUS,
                                    this.starL.pos.y - BUBBLE_RADIUS,
                                    BUBBLE_DIAMETER,
                                    BUBBLE_DIAMETER
                                )
                            ) {
                                activeElement = true;
                                break;
                            }
                        }

                        if (this.candyBubbleR) {
                            if (
                                Rectangle.pointInRect(
                                    pos.x,
                                    pos.y,
                                    this.starR.pos.x - BUBBLE_RADIUS,
                                    this.starR.pos.y - BUBBLE_RADIUS,
                                    BUBBLE_DIAMETER,
                                    BUBBLE_DIAMETER
                                )
                            ) {
                                activeElement = true;
                                break;
                            }
                        }
                    }
                }

                for (i = 0, len = this.spikes.length; i < len; i++) {
                    const s = this.spikes[i];
                    if (s.rotateButton && s.rotateButton.isInTouchZone(pos.x, pos.y, true)) {
                        activeElement = true;
                    }
                }

                for (i = 0, len = this.pumps.length; i < len; i++) {
                    if (this.pumps[i].pointInObject(pos.x, pos.y)) {
                        activeElement = true;
                        break;
                    }
                }

                for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
                    const rc = this.rotatedCircles[i];
                    if (rc.isLeftControllerActive() || rc.isRightControllerActive()) {
                        activeElement = true;
                        break;
                    }

                    if (
                        Vector.distance(pos.x, pos.y, rc.handle2.x, rc.handle2.y) <=
                            resolution.RC_CONTROLLER_RADIUS ||
                        Vector.distance(pos.x, pos.y, rc.handle2.x, rc.handle2.y) <=
                            resolution.RC_CONTROLLER_RADIUS
                    ) {
                        activeElement = true;
                        break;
                    }
                }

                for (i = 0, len = this.bungees.length; i < len; i++) {
                    const g = this.bungees[i];
                    if (g.wheel) {
                        if (
                            Rectangle.pointInRect(
                                pos.x,
                                pos.y,
                                g.x - resolution.GRAB_WHEEL_RADIUS,
                                g.y - resolution.GRAB_WHEEL_RADIUS,
                                resolution.GRAB_WHEEL_RADIUS * 2,
                                resolution.GRAB_WHEEL_RADIUS * 2
                            )
                        ) {
                            activeElement = true;
                            break;
                        }
                    }

                    if (g.moveLength > 0) {
                        if (
                            Rectangle.pointInRect(
                                pos.x,
                                pos.y,
                                g.x - resolution.GRAB_MOVE_RADIUS,
                                g.y - resolution.GRAB_MOVE_RADIUS,
                                resolution.GRAB_MOVE_RADIUS * 2,
                                resolution.GRAB_MOVE_RADIUS * 2
                            ) ||
                            g.moverDragging !== Constants.UNDEFINED
                        ) {
                            activeElement = true;
                            break;
                        }
                    }
                }

                if (!activeElement) {
                    b.highlighted = true;
                }
            }
        }

        moveResult = Mover.moveToTargetWithStatus(this.dimTime, 0, 1, delta);
        this.dimTime = moveResult.value;
        if (moveResult.reachedZero) {
            if (this.restartState === GameSceneConstants.RestartState.FADE_IN) {
                this.restartState = GameSceneConstants.RestartState.FADE_OUT;
                this.hide();
                this.show();
                this.dimTime = Constants.DIM_TIMEOUT;
            } else {
                this.restartState = Constants.UNDEFINED;
            }
        }
    },

    isBubbleCapture: function (b, candy, candyBubble, candyBubbleAnimation) {
        const bubbleSize = resolution.BUBBLE_SIZE,
            bubbleSizeDouble = bubbleSize * 2;

        if (
            Rectangle.pointInRect(
                candy.x,
                candy.y,
                b.x - bubbleSize,
                b.y - bubbleSize,
                bubbleSizeDouble,
                bubbleSizeDouble
            )
        ) {
            if (candyBubble) {
                this.popBubble(b.x, b.y);
            }
            candyBubbleAnimation.visible = true;

            SoundMgr.playSound(ResourceId.SND_BUBBLE);

            b.popped = true;
            b.removeChildWithID(0);

            this.attachCandy();

            return true;
        }
        return false;
    },
    teleport: function () {
        if (!this.targetSock) {
            return;
        }

        this.targetSock.light.playTimeline(0);
        this.targetSock.light.visible = true;

        const off = new Vector(0, resolution.SOCK_TELEPORT_Y);
        off.rotate(Radians.fromDegrees(this.targetSock.rotation));

        this.star.pos.x = this.targetSock.x;
        this.star.pos.y = this.targetSock.y;
        this.star.pos.add(off);

        this.star.prevPos.copyFrom(this.star.pos);

        this.star.v.x = 0;
        this.star.v.y = -1;
        this.star.v.rotate(Radians.fromDegrees(this.targetSock.rotation));
        this.star.v.multiply(this.savedSockSpeed);

        this.star.posDelta.copyFrom(this.star.v);
        this.star.posDelta.divide(60);
        this.star.prevPos.copyFrom(this.star.pos);
        this.star.prevPos.subtract(this.star.posDelta);
        this.targetSock = null;

        //Achievements.increment(AchievementId.MAGICIAN);
    },
    animateLevelRestart: function () {
        this.restartState = GameSceneConstants.RestartState.FADE_IN;
        this.dimTime = Constants.DIM_TIMEOUT;
    },
    isFadingIn: function () {
        return this.restartState === GameSceneConstants.RestartState.FADE_IN;
    },
    releaseAllRopes: function (left) {
        for (let l = 0, len = this.bungees.length; l < len; l++) {
            const g = this.bungees[l],
                b = g.rope;

            if (
                b &&
                (b.tail === this.star ||
                    (b.tail === this.starL && left) ||
                    (b.tail === this.starR && !left))
            ) {
                if (b.cut === Constants.UNDEFINED) {
                    b.setCut(b.parts.length - 2);
                    this.detachCandy();
                } else {
                    b.hideTailParts = true;
                }

                if (g.hasSpider && g.spiderActive) {
                    this.spiderBusted(g);
                }
            }
        }
    },
    attachCandy: function () {
        this.attachCount += 1;
        //console.log('candy attached. count: ' + this.attachCount);
    },
    detachCandy: function () {
        this.attachCount -= 1;
        this.juggleTimer = 0;
        //console.log('candy detached. count: ' + this.attachCount);
    },
    calculateScore: function () {
        this.timeBonus = Math.max(0, 30 - this.time) * 100;
        this.timeBonus /= 10;
        this.timeBonus *= 10;
        this.starBonus = 1000 * this.starsCollected;
        this.score = Math.ceil(this.timeBonus + this.starBonus);
    },
    gameWon: function () {
        this.dd.cancelAllDispatches();

        this.target.playTimeline(GameSceneConstants.CharAnimation.WIN);
        SoundMgr.playSound(ResourceId.SND_MONSTER_CHEWING);

        if (this.candyBubble) {
            this.popCandyBubble(false);
        }

        this.noCandy = true;

        this.candy.passTransformationsToChilds = true;
        this.candyMain.scaleX = this.candyMain.scaleY = 1;
        this.candyTop.scaleX = this.candyTop.scaleY = 1;

        const tl = new Timeline();
        tl.addKeyFrame(
            KeyFrame.makePos(this.candy.x, this.candy.y, KeyFrame.TransitionType.LINEAR, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makePos(this.target.x, this.target.y + 10, KeyFrame.TransitionType.LINEAR, 0.1)
        );
        tl.addKeyFrame(KeyFrame.makeScale(0.71, 0.71, KeyFrame.TransitionType.LINEAR, 0));
        tl.addKeyFrame(KeyFrame.makeScale(0, 0, KeyFrame.TransitionType.LINEAR, 0.1));
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.1)
        );
        this.candy.addTimelineWithID(tl, 0);
        this.candy.playTimeline(0);
        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(this.candy);

        this.calculateScore();
        this.releaseAllRopes(false);

        const onLevelWonAppCallback = () => {
            PubSub.publish(PubSub.ChannelId.LevelWon, {
                stars: this.starsCollected,
                time: this.time,
                score: this.score,
                fps: 1 / this.gameController.avgDelta,
            });
        };

        // the closing doors animation takes 850ms so we want it to
        // finish before the game level deactivates (and freezes)
        if (settings.showMenu) {
            this.dd.callObject(this, onLevelWonAppCallback, null, 1);
        }

        // stop the electro after 1.5 seconds
        this.dd.callObject(
            this,
            function () {
                // stop the electro spikes sound from looping
                SoundMgr.stopSound(ResourceId.SND_ELECTRIC);
            },
            null,
            1.5
        );

        // fire level won callback after 2 secs
        const onLevelWon = function () {
            this.gameController.onLevelWon.call(this.gameController);
        };
        this.dd.callObject(this, onLevelWon, null, 1.8);
    },
    gameLost: function () {
        this.dd.cancelAllDispatches();
        this.target.playTimeline(GameSceneConstants.CharAnimation.FAIL);
        SoundMgr.playSound(ResourceId.SND_MONSTER_SAD);

        // fire level lost callback after 1 sec
        const onLevelLost = function () {
            this.gameController.onLevelLost.call(this.gameController);
            PubSub.publish(PubSub.ChannelId.LevelLost, { time: this.time });
        };
        this.dd.callObject(this, onLevelLost, null, 1);
    },
    draw: function () {
        // reset any canvas transformations and clear everything
        const ctx = Canvas.context;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, resolution.CANVAS_WIDTH, resolution.CANVAS_HEIGHT);

        this.preDraw();
        this.camera.applyCameraTransformation();
        this.back.updateWithCameraPos(this.camera.pos);
        //console.log('back x:' + this.back.x + ' y:' + this.back.y);
        this.back.draw();

        // Scale overlayCut based on resolution to prevent visible seams at HD resolutions
        const overlayCut = Math.ceil((2 * resolution.CANVAS_SCALE) / 0.1875);
        let q, overlayRect, off;
        if (this.mapHeight > resolution.CANVAS_HEIGHT) {
            q = GameSceneConstants.IMG_BGR_01_P2_vert_transition;
            off = this.overlayTexture.offsets[q].y;
            overlayRect = this.overlayTexture.rects[q];

            ctx.drawImage(
                this.overlayTexture.image,
                overlayRect.x,
                overlayRect.y + overlayCut,
                overlayRect.w,
                overlayRect.h - overlayCut * 2,
                0,
                off + overlayCut,
                overlayRect.w,
                overlayRect.h - overlayCut * 2
            );
        }

        let i, len;
        for (i = 0, len = this.drawings.length; i < len; i++) {
            this.drawings[i].draw();
        }

        for (i = 0, len = this.earthAnims.length; i < len; i++) {
            this.earthAnims[i].draw();
        }

        if (this.pollenDrawer) {
            this.pollenDrawer.draw();
        }
        if (this.gravityButton) {
            this.gravityButton.draw();
        }

        this.support.draw();
        this.target.draw();

        // tutorial text
        for (i = 0, len = this.tutorials.length; i < len; i++) {
            this.tutorials[i].draw();
        }

        // tutorial images
        for (i = 0, len = this.tutorialImages.length; i < len; i++) {
            const ti = this.tutorialImages[i];

            // don't draw the level1 arrow now - it needs to be on top
            if (ti.special !== GameSceneConstants.LEVEL1_ARROW_SPECIAL_ID) {
                ti.draw();
            }
        }

        for (i = 0, len = this.razors.length; i < len; i++) {
            this.razors[i].draw();
        }

        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            this.rotatedCircles[i].draw();
        }

        for (i = 0, len = this.bubbles.length; i < len; i++) {
            this.bubbles[i].draw();
        }

        for (i = 0, len = this.pumps.length; i < len; i++) {
            this.pumps[i].draw();
        }

        for (i = 0, len = this.spikes.length; i < len; i++) {
            this.spikes[i].draw();
        }

        for (i = 0, len = this.bouncers.length; i < len; i++) {
            this.bouncers[i].draw();
        }

        for (i = 0, len = this.socks.length; i < len; i++) {
            const sock = this.socks[i];
            sock.y -= GameSceneConstants.SOCK_COLLISION_Y_OFFSET;
            sock.draw();
            sock.y += GameSceneConstants.SOCK_COLLISION_Y_OFFSET;
        }

        const bungees = this.bungees;
        for (i = 0, len = bungees.length; i < len; i++) {
            bungees[i].drawBack();
        }
        for (i = 0; i < len; i++) {
            bungees[i].draw();
        }

        for (i = 0, len = this.stars.length; i < len; i++) {
            this.stars[i] && this.stars[i].draw();
        }

        if (!this.noCandy && !this.targetSock) {
            this.candy.x = this.star.pos.x;
            this.candy.y = this.star.pos.y;
            this.candy.draw();

            if (this.candyBlink.currentTimeline != null) {
                this.candyBlink.draw();
            }
        }

        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            if (!this.noCandyL) {
                this.candyL.x = this.starL.pos.x;
                this.candyL.y = this.starL.pos.y;
                this.candyL.draw();
            }

            if (!this.noCandyR) {
                this.candyR.x = this.starR.pos.x;
                this.candyR.y = this.starR.pos.y;
                this.candyR.draw();
            }
        }

        for (i = 0, len = bungees.length; i < len; i++) {
            const g = bungees[i];
            if (g.hasSpider) {
                g.drawSpider();
            }
        }

        this.aniPool.draw();
        this.drawCuts();
        this.camera.cancelCameraTransformation();
        this.staticAniPool.draw();

        // draw the level1 arrow last so its on top
        for (i = 0, len = this.tutorialImages.length; i < len; i++) {
            const ti = this.tutorialImages[i];
            if (ti.special === GameSceneConstants.LEVEL1_ARROW_SPECIAL_ID) {
                ti.draw();
            }
        }

        this.postDraw();
    },
    drawCuts: function () {
        const maxSize = resolution.CUT_MAX_SIZE;
        for (let i = 0; i < Constants.MAX_TOUCHES; i++) {
            const cuts = this.fingerCuts[i],
                count = cuts.length;
            if (count > 0) {
                let perpSize = 1,
                    fc = null,
                    pc = 0;
                const v = 0,
                    pts = [];

                for (let k = 0; k < count; k++) {
                    fc = cuts[k];
                    if (k === 0) {
                        pts[pc++] = fc.start;
                    }
                    pts[pc++] = fc.end;
                }

                let p = null;
                const points = 2,
                    numVertices = count * points,
                    vertices = [],
                    bstep = 1 / numVertices;
                let a = 0;

                while (true) {
                    if (a > 1) {
                        a = 1;
                    }

                    p = Vector.calcPathBezier(pts, a);
                    vertices.push(p);

                    if (a === 1) {
                        break;
                    }

                    a += bstep;
                }

                const step = maxSize / numVertices,
                    verts = [];
                for (let k = 0, lenMinusOne = numVertices - 1; k < lenMinusOne; k++) {
                    const startSize = perpSize,
                        endSize = k === numVertices - 1 ? 1 : perpSize + step,
                        start = vertices[k],
                        end = vertices[k + 1];

                    // n is the normalized arrow
                    const n = Vector.subtract(end, start);
                    n.normalize();

                    const rp = Vector.rPerpendicular(n),
                        lp = Vector.perpendicular(n);

                    if (v === 0) {
                        const srp = Vector.add(start, Vector.multiply(rp, startSize)),
                            slp = Vector.add(start, Vector.multiply(lp, startSize));

                        verts.push(slp);
                        verts.push(srp);
                    }

                    const erp = Vector.add(end, Vector.multiply(rp, endSize)),
                        elp = Vector.add(end, Vector.multiply(lp, endSize));

                    verts.push(elp);
                    verts.push(erp);

                    perpSize += step;
                }

                // draw triangle strip
                Canvas.fillTriangleStrip(verts, RGBAColor.styles.SOLID_OPAQUE);
            }
        }
    },
    handlePumpFlow: function (p, s, c, delta) {
        const powerRadius = resolution.PUMP_POWER_RADIUS;
        if (
            c.rectInObject(
                p.x - powerRadius,
                p.y - powerRadius,
                p.x + powerRadius,
                p.y + powerRadius
            )
        ) {
            const tn1 = new Vector(0, 0),
                tn2 = new Vector(0, 0),
                h = new Vector(c.x, c.y);

            tn1.x = p.x - p.bb.w / 2.0;
            tn2.x = p.x + p.bb.w / 2.0;
            tn1.y = tn2.y = p.y;

            if (p.angle != 0) {
                h.rotateAround(-p.angle, p.x, p.y);
            }

            if (
                h.y < tn1.y &&
                Rectangle.rectInRect(
                    h.x - c.bb.w / 2.0,
                    h.y - c.bb.h / 2.0,
                    h.x + c.bb.w / 2.0,
                    h.y + c.bb.h / 2.0,
                    tn1.x,
                    tn1.y - powerRadius,
                    tn2.x,
                    tn2.y
                )
            ) {
                const maxPower = powerRadius * 2.0,
                    power = (maxPower * (powerRadius - (tn1.y - h.y))) / powerRadius,
                    pumpForce = new Vector(0, -power);

                pumpForce.rotate(p.angle);
                s.applyImpulse(pumpForce, delta);
            }
        }
    },
    handleBounce: function (bouncer, star, delta) {
        if (bouncer.skip) {
            return;
        }

        const v = Vector.subtract(star.prevPos, star.pos),
            spos = star.prevPos.copy();

        const angle = bouncer.angle,
            x = bouncer.x,
            y = bouncer.y;

        spos.rotateAround(-angle, x, y);

        const fromTop = spos.y < bouncer.y,
            dir = fromTop ? -1 : 1,
            a = v.getLength() * 40,
            b = resolution.BOUNCER_MAX_MOVEMENT,
            m = (a > b ? a : b) * dir,
            v2 = Vector.forAngle(bouncer.angle),
            impulse = Vector.perpendicular(v2);

        impulse.multiply(m);

        star.pos.rotateAround(-angle, x, y);
        star.prevPos.rotateAround(-angle, x, y);
        star.prevPos.y = star.pos.y;
        star.pos.rotateAround(angle, x, y);
        star.prevPos.rotateAround(angle, x, y);

        star.applyImpulse(impulse, delta);
        bouncer.playTimeline(0);

        SoundMgr.playSound(ResourceId.SND_BOUNCER);
    },
    operatePump: function (pump, delta) {
        pump.playTimeline(0);
        const soundId = MathHelper.randomRange(ResourceId.SND_PUMP_1, ResourceId.SND_PUMP_4);
        SoundMgr.playSound(soundId);

        const dirtTexture = ResourceMgr.getTexture(ResourceId.IMG_OBJ_PUMP);
        const b = new PumpDirt(5, dirtTexture, Radians.toDegrees(pump.angle) - 90);
        b.onFinished = this.aniPool.particlesFinishedDelegate();

        const v = new Vector(pump.x + resolution.PUMP_DIRT_OFFSET, pump.y);
        v.rotateAround(pump.angle - Math.PI / 2, pump.x, pump.y);
        b.x = v.x;
        b.y = v.y;

        b.startSystem(5);
        this.aniPool.addChild(b);

        if (!this.noCandy) {
            this.handlePumpFlow(pump, this.star, this.candy, delta);
        }

        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            if (!this.noCandyL) {
                this.handlePumpFlow(pump, this.starL, this.candyL, delta);
            }

            if (!this.noCandyR) {
                this.handlePumpFlow(pump, this.starR, this.candyR, delta);
            }
        }
    },
    cut: function (razor, v1, v2, immediate) {
        let cutCount = 0;
        for (let l = 0, len = this.bungees.length; l < len; l++) {
            const g = this.bungees[l],
                b = g.rope;

            if (!b || b.cut !== Constants.UNDEFINED) {
                continue;
            }

            const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS,
                GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2;
            for (let i = 0, iLimit = b.parts.length - 1; i < iLimit; i++) {
                const p1 = b.parts[i],
                    p2 = b.parts[i + 1];
                let cut = false;

                if (razor) {
                    if (p1.prevPos.x !== Constants.INT_MAX) {
                        const minX = MathHelper.minOf4(
                                p1.pos.x,
                                p1.prevPos.x,
                                p2.pos.x,
                                p2.prevPos.x
                            ),
                            minY = MathHelper.minOf4(
                                p1.pos.y,
                                p1.prevPos.y,
                                p2.pos.y,
                                p2.prevPos.y
                            ),
                            maxX = MathHelper.maxOf4(
                                p1.pos.x,
                                p1.prevPos.x,
                                p2.pos.x,
                                p2.prevPos.x
                            ),
                            maxY = MathHelper.maxOf4(
                                p1.pos.y,
                                p1.prevPos.y,
                                p2.pos.y,
                                p2.prevPos.y
                            );

                        cut = Rectangle.rectInRect(
                            minX,
                            minY,
                            maxX,
                            maxY,
                            razor.drawX,
                            razor.drawY,
                            razor.drawX + razor.width,
                            razor.drawY + razor.height
                        );
                    }
                } else {
                    if (
                        g.wheel &&
                        Rectangle.lineInRect(
                            v1.x,
                            v1.y,
                            v2.x,
                            v2.y,
                            g.x - GRAB_WHEEL_RADIUS,
                            g.y - GRAB_WHEEL_RADIUS,
                            GRAB_WHEEL_DIAMETER,
                            GRAB_WHEEL_DIAMETER
                        )
                    ) {
                        cut = false;
                    } else {
                        cut = MathHelper.lineInLine(
                            v1.x,
                            v1.y,
                            v2.x,
                            v2.y,
                            p1.pos.x,
                            p1.pos.y,
                            p2.pos.x,
                            p2.pos.y
                        );
                    }
                }

                if (cut) {
                    cutCount++;

                    if (g.hasSpider && g.spiderActive) {
                        this.spiderBusted(g);
                    }

                    SoundMgr.playSound(ResourceId.SND_ROPE_BLEAK_1 + b.relaxed);

                    b.setCut(i);
                    this.detachCandy();

                    if (immediate) {
                        b.cutTime = 0;
                        b.removePart(i);
                    }

                    return cutCount;
                }
            }
        }

        return cutCount;
    },
    spiderBusted: function (g) {
        SoundMgr.playSound(ResourceId.SND_SPIDER_FALL);
        g.hasSpider = false;
        const s = ImageElement.create(
            ResourceId.IMG_OBJ_SPIDER,
            GameSceneConstants.IMG_OBJ_SPIDER_busted
        );
        s.doRestoreCutTransparency();
        const tl = new Timeline();
        if (this.gravityButton && !this.gravityNormal) {
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y + 50, KeyFrame.TransitionType.EASE_OUT, 0.3)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    g.spider.x,
                    g.spider.y - resolution.CANVAS_HEIGHT,
                    KeyFrame.TransitionType.EASE_IN,
                    1
                )
            );
        } else {
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y - 50, KeyFrame.TransitionType.EASE_OUT, 0.3)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    g.spider.x,
                    g.spider.y + resolution.CANVAS_HEIGHT,
                    KeyFrame.TransitionType.EASE_IN,
                    1
                )
            );
        }

        tl.addKeyFrame(KeyFrame.makeRotation(0, 0, 0));
        tl.addKeyFrame(KeyFrame.makeRotation(MathHelper.randomRange(-120, 120), 0, 1));
        s.addTimelineWithID(tl, 0);
        s.playTimeline(0);
        s.x = g.spider.x;
        s.y = g.spider.y;
        s.anchor = Alignment.CENTER;

        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(s);

        // spider achievements
        // Achievements.increment(AchievementId.SPIDER_BUSTER);
        // Achievements.increment(AchievementId.SPIDER_TAMER);
    },
    spiderWon: function (sg) {
        SoundMgr.playSound(ResourceId.SND_SPIDER_WIN);

        for (let i = 0, count = this.bungees.length; i < count; i++) {
            const g = this.bungees[i],
                b = g.rope;
            if (b && b.tail === this.star) {
                if (b.cut !== Constants.UNDEFINED) {
                    g.destroyRope();
                } else {
                    b.setCut(b.parts.length - 2);
                    this.detachCandy();
                    b.forceWhite = false;
                }

                if (g.hasSpider && g.spiderActive && sg !== g) {
                    this.spiderBusted(g);
                }
            }
        }

        sg.hasSpider = false;
        this.spiderTookCandy = true;
        this.noCandy = true;

        const s = ImageElement.create(
            ResourceId.IMG_OBJ_SPIDER,
            GameSceneConstants.IMG_OBJ_SPIDER_stealing
        );
        s.doRestoreCutTransparency();
        this.candy.anchor = this.candy.parentAnchor = Alignment.CENTER;
        this.candy.x = 0;
        this.candy.y = -5;

        s.addChild(this.candy);
        const tl = new Timeline();
        if (this.gravityButton && !this.gravityNormal) {
            tl.addKeyFrame(
                KeyFrame.makePos(sg.spider.x, sg.spider.y - 10, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    sg.spider.x,
                    sg.spider.y + 70,
                    KeyFrame.TransitionType.EASE_OUT,
                    0.3
                )
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    sg.spider.x,
                    sg.spider.y - resolution.CANVAS_HEIGHT,
                    KeyFrame.TransitionType.EASE_IN,
                    1
                )
            );
        } else {
            tl.addKeyFrame(
                KeyFrame.makePos(sg.spider.x, sg.spider.y - 10, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    sg.spider.x,
                    sg.spider.y - 70,
                    KeyFrame.TransitionType.EASE_OUT,
                    0.3
                )
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    sg.spider.x,
                    sg.spider.y + resolution.CANVAS_HEIGHT,
                    KeyFrame.TransitionType.EASE_IN,
                    1
                )
            );
        }

        s.addTimelineWithID(tl, 0);
        s.playTimeline(0);
        s.x = sg.spider.x;
        s.y = sg.spider.y - 10;
        s.anchor = Alignment.CENTER;

        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(s);

        if (this.restartState !== GameSceneConstants.RestartState.FADE_IN) {
            this.dd.callObject(this, this.gameLost, null, 2);
        }

        // Achievements.increment(AchievementId.SPIDER_LOVER);
    },
    popCandyBubble: function (isLeft) {
        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            if (isLeft) {
                this.candyBubbleL = null;
                this.candyBubbleAnimationL.visible = false;
                this.popBubble(this.candyL.x, this.candyL.y);
            } else {
                this.candyBubbleR = null;
                this.candyBubbleAnimationR.visible = false;
                this.popBubble(this.candyR.x, this.candyR.y);
            }
        } else {
            this.candyBubble = null;
            this.candyBubbleAnimation.visible = false;
            this.popBubble(this.candy.x, this.candy.y);
        }
    },
    popBubble: function (x, y) {
        this.detachCandy();

        SoundMgr.playSound(ResourceId.SND_BUBBLE_BREAK);

        this.bubbleDisappear.x = x;
        this.bubbleDisappear.y = y;

        this.bubbleDisappear.playTimeline(0);
        this.aniPool.addChild(this.bubbleDisappear);
    },
    handleBubbleTouch: function (s, tx, ty) {
        if (
            Rectangle.pointInRect(
                tx + this.camera.pos.x,
                ty + this.camera.pos.y,
                s.pos.x - resolution.BUBBLE_TOUCH_OFFSET,
                s.pos.y - resolution.BUBBLE_TOUCH_OFFSET,
                resolution.BUBBLE_TOUCH_SIZE,
                resolution.BUBBLE_TOUCH_SIZE
            )
        ) {
            this.popCandyBubble(s === this.starL);

            // Achievements.increment(AchievementId.BUBBLE_POPPER);
            // Achievements.increment(AchievementId.BUBBLE_MASTER);

            return true;
        }
        return false;
    },
    resetBungeeHighlight: function () {
        for (let i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i],
                bungee = grab.rope;
            if (!bungee || bungee.cut !== Constants.UNDEFINED) {
                continue;
            }
            bungee.highlighted = false;
        }
    },
    getNearestBungeeGrabByBezierPoints: function (s, tx, ty) {
        const SEARCH_RADIUS = resolution.CLICK_TO_CUT_SEARCH_RADIUS;
        let grab = null,
            md = SEARCH_RADIUS;
        const tv = new Vector(tx, ty);

        for (let l = 0, numBungees = this.bungees.length; l < numBungees; l++) {
            const g = this.bungees[l],
                b = g.rope;

            if (b) {
                for (let i = 0, numParts = b.drawPts.length; i < numParts; i++) {
                    const c1 = b.drawPts[i],
                        d = c1.distance(tv);
                    if (d < SEARCH_RADIUS && d < md) {
                        md = d;
                        grab = g;
                        s.copyFrom(c1);
                    }
                }
            }
        }

        return grab;
    },
    getNearestBungeeSegmentByConstraints: function (s, g) {
        const SEARCH_RADIUS = Number.MAX_VALUE;
        let nb = null,
            md = SEARCH_RADIUS;
        const sOrig = s.copy(),
            b = g.rope;

        if (!b || b.cut !== Constants.UNDEFINED) {
            return null;
        }

        const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS,
            GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2;
        for (let i = 0, numParts = b.parts.length - 1; i < numParts; i++) {
            const p1 = b.parts[i],
                d = p1.pos.distance(sOrig);
            if (d < md) {
                if (
                    !g.wheel ||
                    Rectangle.pointInRect(
                        p1.pos.x,
                        p1.pos.y,
                        g.x - GRAB_WHEEL_RADIUS,
                        g.y - GRAB_WHEEL_RADIUS,
                        GRAB_WHEEL_DIAMETER,
                        GRAB_WHEEL_DIAMETER
                    )
                ) {
                    md = d;
                    nb = b;
                    s.copyFrom(p1.pos);
                }
            }
        }

        return nb;
    },
};
