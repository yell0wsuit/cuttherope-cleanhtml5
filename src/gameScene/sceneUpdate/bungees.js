import Bungee from "@/game/Bungee";
import Camera2D from "@/visual/Camera2D";
import * as GameSceneConstants from "@/gameScene/constants";
import Radians from "@/utils/Radians";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
import resolution from "@/resolution";

export function updateBungees(delta) {
    const numGrabs = this.bungees.length;
    if (numGrabs > 0) {
        let handledRotation = false;
        let handledRotationL = false;
        let handledRotationR = false;

        for (let i = 0; i < numGrabs; i++) {
            // yes, it's a little confusing that the bungees array
            // actually holds grabs
            const g = this.bungees[i];
            g.update(delta);

            const b = g.rope;

            if (g.mover && b) {
                b.bungeeAnchor.pos.x = g.x;
                b.bungeeAnchor.pos.y = g.y;
                b.bungeeAnchor.pin.copyFrom(b.bungeeAnchor.pos);
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
                const STAR_RADIUS = resolution.STAR_RADIUS;
                const createRope = (star) => {
                    const l = new Vector(g.x, g.y).distance(star.pos);
                    if (l <= g.radius + STAR_RADIUS) {
                        const rope = new Bungee(
                            null,
                            g.x,
                            g.y, // head
                            star,
                            star.pos.x,
                            star.pos.y, // tail
                            g.radius + STAR_RADIUS
                        );
                        rope.bungeeAnchor.pin.copyFrom(rope.bungeeAnchor.pos);
                        g.hideRadius = true;
                        g.setRope(rope);

                        this.attachCandy();

                        SoundMgr.playSound(ResourceId.SND_ROPE_GET);
                        if (g.mover) {
                            SoundMgr.playSound(ResourceId.SND_BUZZ);
                        }
                    }
                };

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
                const prev = b.bungeeAnchor;
                const tail = b.parts[b.parts.length - 1];
                const v = Vector.subtract(prev.pos, tail.pos);
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
        } else if (!handledRotation && !this.noCandy) {
            this.candyMain.rotation += Math.min(5, this.lastCandyRotateDelta);
            this.lastCandyRotateDelta *= 0.98;
        }
    }

    return numGrabs;
}
