import ConstraintSystem from "@/physics/ConstraintSystem";
import ConstrainedPoint from "@/physics/ConstrainedPoint";
import resolution from "@/resolution";
import Constants from "@/utils/Constants";
import ConstraintType from "@/physics/ConstraintType";
import Vector from "@/core/Vector";
import Canvas from "@/utils/Canvas";
import RGBAColor from "@/core/RGBAColor";
import Mover from "@/utils/Mover";
import Log from "@/utils/Log";
import satisfyConstraintArray from "@/physics/satisfyConstraintArray";
import { IS_XMAS } from "@/resources/ResData";
import ResourceId from "@/resources/ResourceId";
import ResourceMgr from "@/resources/ResourceMgr";
/**
 * @const
 * @type {number}
 */
const ROLLBACK_K = 0.5;

/**
 * @const
 * @type {number}
 */
const BUNGEE_RELAXION_TIMES = 25;

/**
 * @const
 * @type {number}
 */
const MAX_BUNGEE_SEGMENTS = 10;

/**
 * @const
 * @type {number}
 */
const DEFAULT_PART_WEIGHT = 0.02;

/**
 * @const
 * @type {number}
 */
const STRENGTHENED_PART_WEIGHT = 0.5;

/**
 * @const
 * @type {number}
 */
const CUT_DISSAPPEAR_TIMEOUT = 2.0;

/**
 * @const
 * @type {number}
 */
const WHITE_TIMEOUT = 0.05;

/** @enum {number} */
const BungeeMode = {
    NORMAL: 0,
    LOCKED: 1,
};

// create temp color objects used during draw (to reduce allocations)
const drawBlack = new RGBAColor(0, 0, 0, 1),
    drawC1 = new RGBAColor(0, 0, 0, 1),
    drawD1 = new RGBAColor(0, 0, 0, 1),
    drawC2 = new RGBAColor(0, 0, 0, 1),
    drawD2 = new RGBAColor(0, 0, 0, 1);

class Bungee extends ConstraintSystem {
    /**
     * Create a new Rope
     * @param {ConstrainedPoint} headCp head constrained point
     * @param {number} hx head location: x
     * @param {number} hy head location: y
     * @param {ConstrainedPoint} tailCp tail constrained point
     * @param {number} tx tail location: x
     * @param {number} ty tail location: y
     * @param {number} len length of the rope
     */
    constructor(headCp, hx, hy, tailCp, tx, ty, len) {
        super();
        this.relaxed = 0;
        this.relaxationTimes = BUNGEE_RELAXION_TIMES;
        this.lineWidth = resolution.DEFAULT_BUNGEE_LINE_WIDTH;
        this.width = resolution.DEFAULT_BUNGEE_WIDTH;
        this.cut = Constants.UNDEFINED;
        this.cutTime = 0;
        this.bungeeMode = BungeeMode.NORMAL;
        this.highlighted = false;
        this.BUNGEE_REST_LEN = resolution.BUNGEE_REST_LEN;

        this.bungeeAnchor = headCp != null ? headCp : new ConstrainedPoint();

        if (tailCp != null) this.tail = tailCp;
        else {
            this.tail = new ConstrainedPoint();
            this.tail.setWeight(1);
        }

        this.bungeeAnchor.setWeight(DEFAULT_PART_WEIGHT);
        this.bungeeAnchor.pos.x = hx;
        this.bungeeAnchor.pos.y = hy;

        this.tail.pos.x = tx;
        this.tail.pos.y = ty;
        this.addPart(this.bungeeAnchor);
        this.addPart(this.tail);

        this.tail.addConstraint(this.bungeeAnchor, this.BUNGEE_REST_LEN, ConstraintType.DISTANCE);

        const offset = Vector.subtract(this.tail.pos, this.bungeeAnchor.pos);
        const pointsNum = Math.round(len / this.BUNGEE_REST_LEN + 2);
        offset.divide(pointsNum);

        this.roll(len, offset);
        this.forceWhite = false;
        this.initialCandleAngle = Constants.UNDEFINED;
        this.chosenOne = false;
        this.hideTailParts = false;
        this.dontDrawRedStretch = false;

        this.drawPts = [];

        this.BUNGEE_BEZIER_POINTS = resolution.BUNGEE_BEZIER_POINTS;
    }

    /**
     * @return {number}
     */
    getLength() {
        let len = 0;
        const parts = this.parts,
            numParts = parts.length;
        if (numParts > 0) {
            let v = parts[0].pos;
            for (let i = 1; i < numParts; i++) {
                const part = parts[i];
                len += v.distance(part.pos);
                v = part.pos;
            }
        }
        return len;
    }

    roll(rollLen, offset) {
        if (offset == null) {
            offset = Vector.newZero();
        }

        const parts = this.parts,
            tail = this.tail;
        let prev = parts[parts.length - 2],
            heroRestLen = tail.restLength(prev),
            cp = null;

        while (rollLen > 0) {
            if (rollLen >= this.BUNGEE_REST_LEN) {
                prev = parts[parts.length - 2];
                cp = new ConstrainedPoint();
                cp.setWeight(DEFAULT_PART_WEIGHT);
                cp.pos = Vector.add(prev.pos, offset);
                this.addPartAtIndex(cp, this.parts.length - 1);

                tail.changeConstraintAndLength(prev, cp, heroRestLen);
                cp.addConstraint(prev, this.BUNGEE_REST_LEN, ConstraintType.DISTANCE);
                rollLen -= this.BUNGEE_REST_LEN;
            } else {
                const newRestLen = rollLen + heroRestLen;
                if (newRestLen > this.BUNGEE_REST_LEN) {
                    rollLen = this.BUNGEE_REST_LEN;
                    heroRestLen = newRestLen - this.BUNGEE_REST_LEN;
                } else {
                    prev = parts[parts.length - 2];
                    tail.changeRestLength(prev, newRestLen);
                    rollLen = 0;
                }
            }
        }
    }

    rollBack(amount) {
        const parts = this.parts;
        let partsCount = parts.length;
        const prev = parts[partsCount - 2];
        const tail = this.tail;
        let rollBackLen = amount;

        let oldAnchor;
        let heroRestLen = tail.restLength(prev);

        while (rollBackLen > 0) {
            if (rollBackLen >= this.BUNGEE_REST_LEN) {
                const oldAnchorIndex = partsCount - 2,
                    newAnchor = parts[partsCount - 3];

                oldAnchor = parts[oldAnchorIndex];
                tail.changeConstraintAndLength(oldAnchor, newAnchor, heroRestLen);
                this.removePartAtIndex(oldAnchorIndex);
                partsCount--;
                rollBackLen -= this.BUNGEE_REST_LEN;
            } else {
                const newRestLen = heroRestLen - rollBackLen;
                if (newRestLen < 1) {
                    rollBackLen = this.BUNGEE_REST_LEN;
                    heroRestLen = this.BUNGEE_REST_LEN + newRestLen + 1;
                } else {
                    oldAnchor = parts[partsCount - 2];
                    tail.changeRestLength(oldAnchor, newRestLen);
                    rollBackLen = 0;
                }
            }
        }

        const newTailRestLen = (partsCount - 1) * (this.BUNGEE_REST_LEN + 3),
            constraints = tail.constraints,
            numConstraints = constraints.length;
        for (let i = 0; i < numConstraints; i++) {
            const c = constraints[i];
            if (c.type === ConstraintType.NOT_MORE_THAN) c.restLength = newTailRestLen;
        }
        return rollBackLen;
    }

    strengthen() {
        const parts = this.parts,
            numParts = parts.length;
        for (let i = 0; i < numParts; i++) {
            const cp = parts[i];
            if (this.bungeeAnchor.pin.x != Constants.UNDEFINED) {
                if (cp != this.tail) {
                    cp.setWeight(STRENGTHENED_PART_WEIGHT);
                }

                if (i > 0) {
                    const restLen = i * (this.BUNGEE_REST_LEN + 3);
                    cp.addConstraint(this.bungeeAnchor, restLen, ConstraintType.NOT_MORE_THAN);
                }
            }
        }
    }

    /**
     * Updates the rope based on the time delta
     * @param {number} delta
     */
    update(delta) {
        if (this.cutTime > 0) {
            this.cutTime = Mover.moveToTarget(this.cutTime, 0, 1, delta);
            if (this.cutTime < CUT_DISSAPPEAR_TIMEOUT - WHITE_TIMEOUT && this.forceWhite) {
                this.removePart(this.cut);
            }
        }

        const parts = this.parts,
            numParts = parts.length,
            relaxationTimes = this.relaxationTimes,
            tail = this.tail;
        let i, cp, k;

        for (i = 0; i < numParts; i++) {
            cp = parts[i];
            if (cp !== tail) {
                //Log.debug('Before qcpUpdate, [' + i + '] : ' + cp.pos );
                // NOTE: iOS calls qcpUpdate which is identical to update except
                // it incorporates material forces. However, those don't appear to
                // be used so we'll simply call update() instead.
                cp.update(delta);
            }
        }

        // satisfy constraints during each relaxation period
        satisfyConstraintArray(parts, relaxationTimes);

        // for (i = 0; i < relaxationTimes; i++) {
        //     for (k = 0; k < numParts; k++) {
        //         parts[k].satisfyConstraints();
        //     }
        // }
    }

    removePart(partIndex) {
        this.forceWhite = false;

        const parts = this.parts,
            p1 = parts[partIndex],
            p2 = parts[partIndex + 1];

        if (!p2) {
            p1.removeConstraints();
        } else {
            const p2Constraints = p2.constraints,
                p2NumConstraints = p2Constraints.length;
            for (let k = 0; k < p2NumConstraints; k++) {
                const c = p2Constraints[k];
                if (c.cp === p1) {
                    p2.removeConstraintAtIndex(k);

                    const np2 = new ConstrainedPoint();
                    np2.setWeight(0.00001);
                    np2.pos.copyFrom(p2.pos);
                    np2.prevPos.copyFrom(p2.prevPos);
                    this.addPartAtIndex(np2, partIndex + 1);
                    np2.addConstraint(p1, this.BUNGEE_REST_LEN, ConstraintType.DISTANCE);
                    break;
                }
            }
        }

        for (let i = 0, numParts = parts.length; i < numParts; i++) {
            const cp = parts[i];
            if (cp != this.tail) cp.setWeight(0.00001);
        }
    }

    setCut(partIndex) {
        this.cut = partIndex;
        this.cutTime = CUT_DISSAPPEAR_TIMEOUT;
        this.forceWhite = true;
        this.highlighted = false;
    }

    draw() {
        const parts = this.parts,
            count = parts.length,
            ctx = Canvas.context;
        let i, part, prevPart;

        ctx.lineJoin = "round";
        ctx.lineWidth = this.lineWidth;

        if (this.cut === Constants.UNDEFINED) {
            const pts = new Array(count);
            for (i = 0; i < count; i++) {
                pts[i] = parts[i].pos;
                //Log.debug('Point ' + i + ': ' + pts[i].toString());
            }
            this.drawBungee(pts);
        } else {
            const pts1 = [],
                pts2 = [];
            let part2 = false;
            let cutIndex = 0;
            for (i = 0; i < count; i++) {
                part = parts[i];
                let linked = true;

                if (i > 0) {
                    prevPart = parts[i - 1];
                    if (!part.hasConstraint(prevPart)) {
                        linked = false;
                    }
                }

                if (part.pin.x === Constants.UNDEFINED && !linked) {
                    part2 = true;
                    cutIndex = i;
                }

                if (!part2) {
                    pts1[i] = part.pos;
                } else {
                    pts2.push(part.pos);
                }
            }

            if (pts1.length > 0) {
                this.drawBungee(pts1, 0);
            }
            if (pts2.length > 0 && !this.hideTailParts) {
                this.drawBungee(pts2, cutIndex);
            }
        }
        ctx.lineWidth = 1;
    }

    drawBungee(pts, segmentStartIndex) {
        const count = pts.length,
            points = this.BUNGEE_BEZIER_POINTS,
            drawPts = this.drawPts;

        // we can't calc the distance for a single point
        if (count < 2) return;

        // Default to 0 if not provided (for uncut ropes)
        if (segmentStartIndex === undefined) {
            segmentStartIndex = 0;
        }

        // set the global alpha
        const alpha =
            this.cut === Constants.UNDEFINED || this.forceWhite
                ? 1
                : this.cutTime / (CUT_DISSAPPEAR_TIMEOUT - WHITE_TIMEOUT);

        if (alpha <= 0) {
            return;
        }

        const firstPoint = pts[0],
            secondPoint = pts[1],
            tx = firstPoint.x - secondPoint.x,
            ty = firstPoint.y - secondPoint.y,
            ptsDistance = Math.sqrt(tx * tx + ty * ty);

        //Log.debug('DrawBungee - point1: ' + firstPoint + ' point2: ' + secondPoint);

        if (ptsDistance <= this.BUNGEE_REST_LEN + 0.3) this.relaxed = 0;
        else if (ptsDistance <= this.BUNGEE_REST_LEN + 1) this.relaxed = 1;
        else if (ptsDistance < this.BUNGEE_REST_LEN + 4) this.relaxed = 2;
        else this.relaxed = 3;

        if (count < 3) return;

        const black = drawBlack,
            c1 = drawC1,
            d1 = drawD1,
            c2 = drawC2,
            d2 = drawD2;

        // reset the colors (we're reusing temp color objects)
        black.r = 0;
        black.g = 0;
        black.b = 0;
        black.a = alpha;
        c1.r = 95 / 200;
        c1.g = 61 / 200;
        c1.b = 37 / 200;
        c1.a = alpha;
        d1.r = 95 / 500;
        d1.g = 61 / 500;
        d1.b = 37 / 500;
        d1.a = alpha;
        c2.r = 152 / 225;
        c2.g = 99 / 225;
        c2.b = 62 / 225;
        c2.a = alpha;
        d2.r = 152 / 500;
        d2.g = 99 / 500;
        d2.b = 62 / 500;
        d2.a = alpha;

        if (this.highlighted) {
            c1.r *= 3;
            c1.g *= 3;
            c1.b *= 3;
            c2.r *= 3;
            c2.g *= 3;
            c2.b *= 3;
            d1.r *= 3;
            d1.g *= 3;
            d1.b *= 3;
            d2.r *= 3;
            d2.g *= 3;
            d2.b *= 3;
        }

        if (ptsDistance > this.BUNGEE_REST_LEN + 7 && !this.dontDrawRedStretch) {
            const f = (ptsDistance / this.BUNGEE_REST_LEN) * 2;
            d1.r *= f;
            d2.r *= f;
        }

        let useC1 = true; // ropes have alternating color segments
        const numVertices = (count - 1) * points;

        // // colors
        // //noinspection UnnecessaryLocalVariableJS
        const b1 = new RGBAColor(d1.r, d1.g, d1.b, d1.a),
            b2 = new RGBAColor(d2.r, d2.g, d2.b, d2.a),
            colorDivisor = numVertices - 1,
            b1rf = (c1.r - d1.r) / colorDivisor,
            b1gf = (c1.g - d1.g) / colorDivisor,
            b1bf = (c1.b - d1.b) / colorDivisor,
            b2rf = (c2.r - d2.r) / colorDivisor,
            b2gf = (c2.g - d2.g) / colorDivisor,
            b2bf = (c2.b - d2.b) / colorDivisor;

        const numSegments = this.BUNGEE_BEZIER_POINTS - 1,
            lastSegmentIndex = numSegments - 1,
            ctx = Canvas.context,
            previousAlpha = ctx.globalAlpha;

        // set the line style
        if (previousAlpha !== alpha) {
            ctx.globalAlpha = alpha;
        }

        // store the first point in the path
        let firstDrawPoint = drawPts[0];
        if (!firstDrawPoint) {
            firstDrawPoint = drawPts[0] = firstPoint.copy();
        } else {
            firstDrawPoint.x = firstPoint.x;
            firstDrawPoint.y = firstPoint.y;
        }

        let vertex, a, pathVector;

        ctx.beginPath();

        let currentColor = b1.rgbaStyle();
        if (ctx.strokeStyle !== currentColor) ctx.strokeStyle = currentColor;

        for (vertex = 1; vertex <= numVertices; vertex++) {
            a = vertex / numVertices;

            // use bezier to smooth the draw points
            pathVector = drawPts[vertex];
            if (!pathVector) {
                pathVector = drawPts[vertex] = new Vector(0, 0);
            }
            Vector.setCalcPathBezier(pts, a, pathVector);

            // see if we have all the points for this color section
            const segmentIndex = (vertex - 1) % numSegments;
            if (segmentIndex === lastSegmentIndex || vertex === numVertices) {
                ctx.beginPath();

                // decide which color to use for this section
                if (this.forceWhite) {
                    currentColor = RGBAColor.styles.SOLID_OPAQUE;
                } else if (useC1) {
                    currentColor = b1.rgbaStyle();
                } else {
                    currentColor = b2.rgbaStyle();
                }

                ctx.strokeStyle = currentColor;

                // move to the beginning of the color section
                let currentIndex = vertex - segmentIndex - 1;
                let point = drawPts[currentIndex++];
                ctx.moveTo(point.x, point.y);

                // draw each line segment (2 segments per color section)
                for (; currentIndex <= vertex; currentIndex++) {
                    point = drawPts[currentIndex];
                    ctx.lineTo(point.x, point.y);
                }

                ctx.stroke();
                useC1 = !useC1;

                const colorMultiplier = segmentIndex + 1;

                // adjust colors for both b1 and b2
                b1.r += b1rf * colorMultiplier;
                b1.g += b1gf * colorMultiplier;
                b1.b += b1bf * colorMultiplier;
                b2.r += b2rf * colorMultiplier;
                b2.g += b2gf * colorMultiplier;
                b2.b += b2bf * colorMultiplier;
            }
        }

        ctx.stroke();

        // reset the alpha
        if (previousAlpha !== alpha) {
            ctx.globalAlpha = previousAlpha;
        }

        // Draw Christmas lights along the rope
        this.drawChristmasLights(drawPts, numVertices + 1, alpha, segmentStartIndex);
    }

    drawChristmasLights(drawPts, count, alpha, segmentStartIndex) {
        if (!IS_XMAS) return;
        if (!drawPts || count < 2) return;
        if (alpha <= 0) return;

        const ctx = Canvas.context;
        const texture = ResourceMgr.getTexture(ResourceId.IMG_XMAS_LIGHTS);

        if (!texture || !texture.image) return;

        const rects = texture.rects || [];
        const image = texture.image;

        if (rects.length === 0) return;

        const lightSpacing = resolution.BUNGEE_REST_LEN * 1.5; // Space between lights

        // Calculate total rope length using the smooth bezier points
        let totalDistance = 0;
        const distances = [0];

        for (let i = 1; i < count; i++) {
            if (!drawPts[i] || !drawPts[i - 1]) continue;
            const dx = drawPts[i].x - drawPts[i - 1].x;
            const dy = drawPts[i].y - drawPts[i - 1].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            totalDistance += dist;
            distances.push(totalDistance);
        }

        // Set alpha for fading effect
        const previousAlpha = ctx.globalAlpha;
        if (alpha < 1) {
            ctx.globalAlpha = alpha;
        }

        // Initialize random seed based on rope position for consistent randomization
        if (!this.lightRandomSeed) {
            this.lightRandomSeed = Math.floor(Math.random() * 1000);
        }

        // Calculate distance offset for cut rope segments
        // This ensures lights keep the same color even after cutting
        const segmentOffset = segmentStartIndex * this.BUNGEE_REST_LEN;

        // Draw lights at regular intervals along the rope
        let currentDistance = lightSpacing / 2; // Start offset

        while (currentDistance < totalDistance) {
            // Find which segment this light is on
            for (let i = 1; i < count; i++) {
                if (!drawPts[i] || !drawPts[i - 1]) continue;
                if (currentDistance <= distances[i]) {
                    // Interpolate position between drawPts[i-1] and drawPts[i]
                    const segmentStart = distances[i - 1];
                    const segmentEnd = distances[i];
                    const t = (currentDistance - segmentStart) / (segmentEnd - segmentStart);

                    const x = drawPts[i - 1].x + (drawPts[i].x - drawPts[i - 1].x) * t;
                    const y = drawPts[i - 1].y + (drawPts[i].y - drawPts[i - 1].y) * t;

                    // Use distance-based index for consistent light colors that persist across cuts
                    // Add segmentOffset to maintain color consistency after cutting
                    const absoluteDistance = currentDistance + segmentOffset;
                    const distanceIndex = Math.round(absoluteDistance / lightSpacing);
                    const frameIndex = (this.lightRandomSeed + distanceIndex) % rects.length;

                    // Get the frame rect
                    const rect = rects[frameIndex];

                    if (rect) {
                        // Draw the light sprite centered on the rope
                        ctx.drawImage(
                            image,
                            rect.x,
                            rect.y,
                            rect.w,
                            rect.h,
                            x - rect.w / 2,
                            y - rect.h / 2,
                            rect.w,
                            rect.h
                        );
                    }

                    break;
                }
            }

            currentDistance += lightSpacing;
        }

        // Reset alpha
        if (alpha < 1) {
            ctx.globalAlpha = previousAlpha;
        }
    }
}

// export const for use in GameScene
Bungee.BUNGEE_RELAXION_TIMES = BUNGEE_RELAXION_TIMES;

export default Bungee;
