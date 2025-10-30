import Constants from "@/utils/Constants";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";
import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import resolution from "@/resolution";

const GameSceneCut = (Base) =>
    class extends Base {
        /**
         * @param {BaseElement | null} razor
         * @param {Vector} v1
         * @param {Vector} v2
         * @param {boolean} immediate
         */
        cut(razor, v1, v2, immediate) {
            let cutCount = 0;
            for (let l = 0, len = this.bungees.length; l < len; l++) {
                const g = this.bungees[l];
                const b = g.rope;

                if (!b || b.cut !== Constants.UNDEFINED) {
                    continue;
                }

                const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS;
                const GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2;
                for (let i = 0, iLimit = b.parts.length - 1; i < iLimit; i++) {
                    const p1 = b.parts[i];
                    const p2 = b.parts[i + 1];
                    let cut = false;

                    if (razor) {
                        if (p1.prevPos.x !== Constants.INT_MAX) {
                            const minX = MathHelper.minOf4(
                                p1.pos.x,
                                p1.prevPos.x,
                                p2.pos.x,
                                p2.prevPos.x
                            );
                            const minY = MathHelper.minOf4(
                                p1.pos.y,
                                p1.prevPos.y,
                                p2.pos.y,
                                p2.prevPos.y
                            );
                            const maxX = MathHelper.maxOf4(
                                p1.pos.x,
                                p1.prevPos.x,
                                p2.pos.x,
                                p2.prevPos.x
                            );
                            const maxY = MathHelper.maxOf4(
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
                    } else if (
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
        }
    };

export default GameSceneCut;
