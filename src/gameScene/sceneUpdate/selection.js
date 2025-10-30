import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
import resolution from "@/resolution";

class GameSceneSelection {
    resetBungeeHighlight() {
        for (let i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i];
            const bungee = grab.rope;
            if (!bungee || bungee.cut !== Constants.UNDEFINED) {
                continue;
            }
            bungee.highlighted = false;
        }
    }

    /**
     * @param {Vector} s
     * @param {number} tx
     * @param {number} ty
     */
    getNearestBungeeGrabByBezierPoints(s, tx, ty) {
        const SEARCH_RADIUS = resolution.CLICK_TO_CUT_SEARCH_RADIUS;
        let grab = null;
        let md = SEARCH_RADIUS;
        const tv = new Vector(tx, ty);

        for (let l = 0, numBungees = this.bungees.length; l < numBungees; l++) {
            const g = this.bungees[l];
            const b = g.rope;

            if (b) {
                for (let i = 0, numParts = b.drawPts.length; i < numParts; i++) {
                    const c1 = b.drawPts[i];
                    const d = c1.distance(tv);
                    if (d < SEARCH_RADIUS && d < md) {
                        md = d;
                        grab = g;
                        s.copyFrom(c1);
                    }
                }
            }
        }

        return grab;
    }

    /**
     * @param {Vector} s
     * @param {Grab} g
     */
    getNearestBungeeSegmentByConstraints(s, g) {
        const SEARCH_RADIUS = Number.MAX_VALUE;
        let nb = null;
        let md = SEARCH_RADIUS;
        const sOrig = s.copy();
        const b = g.rope;

        if (!b || b.cut !== Constants.UNDEFINED) {
            return null;
        }

        const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS;
        const GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2;
        for (let i = 0, numParts = b.parts.length - 1; i < numParts; i++) {
            const p1 = b.parts[i];
            const d = p1.pos.distance(sOrig);
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
    }
}

export default GameSceneSelection;
