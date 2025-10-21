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
import ResourceMgr from "@/resources/ResourceMgr";
import ResourceId from "@/resources/ResourceId";
import { IS_XMAS } from "@/resources/ResData";
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

const XMAS_LIGHT_MAX_COUNT = 24;
const XMAS_LIGHT_FRAME_COUNT = 5;
const XMAS_LIGHT_NORMAL_OFFSET_MIN = 4;
const XMAS_LIGHT_NORMAL_OFFSET_MAX = 7;
const XMAS_LIGHT_TANGENT_DELTA = 0.01;

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

const Bungee = ConstraintSystem.extend({
    /**
     * Create a new Rope
     * @param headCp {ConstrainedPoint} head constrained point
     * @param hx {number} head location: x
     * @param hy {number} head location: y
     * @param tailCp {ConstrainedPoint} tail constrained point
     * @param tx {number} tail location: x
     * @param ty {number} tail location: y
     * @param len {number} length of the rope
     */
    init: function (headCp, hx, hy, tailCp, tx, ty, len) {
        this._super();
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

        this.xmasLights = null;
        this._xmasLastTailCount = 0;
        if (IS_XMAS) {
            this._setupXmasLights();
        }
    },
    /**
     * @return {number}
     */
    getLength: function () {
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
    },
    roll: function (rollLen, offset) {
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

        if (IS_XMAS) {
            const tailParts = this._getTailSegmentParts();
            if (tailParts.length !== this._xmasLastTailCount) {
                this._setupXmasLights();
            }
        }
    },
    _getTailSegmentParts: function () {
        const parts = this.parts || [];
        if (parts.length === 0) {
            return [];
        }

        if (this.cut === Constants.UNDEFINED) {
            return parts.slice();
        }

        const segments = [];
        let currentSegment = [];

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            let linked = true;

            if (i > 0) {
                const prevPart = parts[i - 1];
                if (!part.hasConstraint(prevPart)) {
                    linked = false;
                }
            }

            if (i > 0 && part.pin.x === Constants.UNDEFINED && !linked) {
                if (currentSegment.length > 0) {
                    segments.push(currentSegment);
                }
                currentSegment = [];
            }

            currentSegment.push(part);
        }

        if (currentSegment.length > 0) {
            segments.push(currentSegment);
        }

        for (let s = 0; s < segments.length; s++) {
            if (segments[s].includes(this.tail)) {
                return segments[s];
            }
        }

        return segments.length > 0 ? segments[segments.length - 1] : parts.slice();
    },
    _setupXmasLights: function () {
        const tailParts = this._getTailSegmentParts();
        const partCount = tailParts.length;

        if (partCount < 2) {
            this.xmasLights = [];
            this._xmasLastTailCount = partCount;
            return;
        }

        // Calculate how many vertices will be in the final bezier curve
        const numVertices = (partCount - 1) * this.BUNGEE_BEZIER_POINTS;
        const numSegments = this.BUNGEE_BEZIER_POINTS - 1;

        // Color segments alternate every numSegments vertices
        // We want lights at the transition points (end of each color segment)
        const transitionIndices = [];

        // Start after the first color segment
        for (let vertex = numSegments; vertex < numVertices; vertex += numSegments) {
            transitionIndices.push(vertex);
        }

        if (transitionIndices.length === 0) {
            this.xmasLights = [];
            this._xmasLastTailCount = partCount;
            return;
        }

        // Limit to max light count, evenly distributed among transitions
        const lightCount = Math.min(transitionIndices.length, XMAS_LIGHT_MAX_COUNT);

        this.xmasLights = new Array(lightCount);

        for (let i = 0; i < lightCount; i++) {
            // Distribute lights evenly among available transitions
            const normalized = lightCount === 1 ? 0 : i / (lightCount - 1);
            const transitionIndex = Math.round(normalized * (transitionIndices.length - 1));
            const vertex = transitionIndices[transitionIndex];

            // Convert vertex index to parametric t value (0-1)
            const t = vertex / numVertices;

            this.xmasLights[i] = {
                t,
                frame: Math.floor(Math.random() * XMAS_LIGHT_FRAME_COUNT),
                scale: 0.85 + Math.random() * 0.3,
                rotationOffset: (Math.random() - 0.5) * 0.5,
                normalOffset:
                    XMAS_LIGHT_NORMAL_OFFSET_MIN +
                    Math.random() * (XMAS_LIGHT_NORMAL_OFFSET_MAX - XMAS_LIGHT_NORMAL_OFFSET_MIN),
                position: new Vector(0, 0),
                tangentPoint: new Vector(0, 0),
            };
        }
        this._xmasLastTailCount = partCount;
    },
    rollBack: function (amount) {
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

        if (IS_XMAS) {
            const tailParts = this._getTailSegmentParts();
            if (tailParts.length !== this._xmasLastTailCount) {
                this._setupXmasLights();
            }
        }

        return rollBackLen;
    },
    strengthen: function () {
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
    },
    /**
     * Updates the rope based on the time delta
     * @param delta {number}
     */
    update: function (delta) {
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
    },
    removePart: function (partIndex) {
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
    },
    setCut: function (partIndex) {
        this.cut = partIndex;
        this.cutTime = CUT_DISSAPPEAR_TIMEOUT;
        this.forceWhite = true;
        this.highlighted = false;
    },
    draw: function () {
        const parts = this.parts,
            count = parts.length,
            ctx = Canvas.context;
        let i, part, prevPart;

        ctx.lineJoin = "round";
        ctx.lineWidth = this.lineWidth;

        const segments = [];

        if (count > 0) {
            if (this.cut === Constants.UNDEFINED) {
                const pts = new Array(count);
                let containsTail = false;
                for (i = 0; i < count; i++) {
                    part = parts[i];
                    pts[i] = part.pos;
                    if (part === this.tail) {
                        containsTail = true;
                    }
                }
                segments.push({ pts, containsTail });
            } else {
                const pts1 = [];
                const pts2 = [];
                let part2 = false;
                let segment1HasTail = false;
                let segment2HasTail = false;

                for (i = 0; i < count; i++) {
                    part = parts[i];
                    let linked = true;

                    if (i > 0) {
                        prevPart = parts[i - 1];
                        if (!part.hasConstraint(prevPart)) {
                            linked = false;
                        }
                    }

                    if (i > 0 && part.pin.x === Constants.UNDEFINED && !linked) {
                        part2 = true;
                    }

                    if (!part2) {
                        pts1.push(part.pos);
                        if (part === this.tail) {
                            segment1HasTail = true;
                        }
                    } else {
                        pts2.push(part.pos);
                        if (part === this.tail) {
                            segment2HasTail = true;
                        }
                    }
                }

                if (pts1.length > 0) {
                    segments.push({ pts: pts1, containsTail: segment1HasTail });
                }
                if (pts2.length > 0 && !this.hideTailParts) {
                    segments.push({ pts: pts2, containsTail: segment2HasTail });
                }
            }
        }

        let lightsDrawn = false;
        for (let s = 0; s < segments.length; s++) {
            const segment = segments[s];
            const drawLights = segment.containsTail && !lightsDrawn;
            this.drawBungee(segment.pts, drawLights);
            if (drawLights) {
                lightsDrawn = true;
            }
        }
        ctx.lineWidth = 1;
    },
    _drawXmasLights: function (pts) {
        if (!IS_XMAS || !this.xmasLights || this.xmasLights.length === 0) {
            return;
        }

        const texture = ResourceMgr.getTexture(ResourceId.IMG_XMAS_LIGHTS);
        if (!texture || !texture.rects || texture.rects.length === 0) {
            return;
        }

        const rects = texture.rects;
        const offsets = texture.offsets || [];
        const image = texture.image;
        const ctx = Canvas.context;

        const pointsCount = pts.length;
        if (pointsCount < 2) {
            return;
        }

        // Use a conservative epsilon to avoid precision issues
        const epsilon = Math.max(
            0.001,
            1 / Math.max((pointsCount - 1) * this.BUNGEE_BEZIER_POINTS, 1)
        );
        const tangentDelta = Math.max(epsilon * 2, XMAS_LIGHT_TANGENT_DELTA);

        for (let i = 0, len = this.xmasLights.length; i < len; i++) {
            const light = this.xmasLights[i];
            const position = light.position;
            const tangentPoint = light.tangentPoint;

            const clampedT = Math.min(1 - epsilon, Math.max(epsilon, light.t));
            Vector.setCalcPathBezier(pts, clampedT, position);

            // Calculate tangent for orientation
            let aheadT = clampedT + tangentDelta;
            let behindT = clampedT - tangentDelta;

            // Determine which tangent direction to use
            if (aheadT > 1 - epsilon) {
                aheadT = clampedT;
                behindT = Math.max(epsilon, behindT);
            } else if (behindT < epsilon) {
                behindT = clampedT;
                aheadT = Math.min(1 - epsilon, aheadT);
            }

            const tangentT = aheadT !== clampedT ? aheadT : behindT;
            Vector.setCalcPathBezier(pts, tangentT, tangentPoint);

            // Calculate angle with fallback for zero-length tangent
            let dx = tangentPoint.x - position.x;
            let dy = tangentPoint.y - position.y;
            const tangentLength = Math.sqrt(dx * dx + dy * dy);

            // If tangent is too small, try a larger delta
            if (tangentLength < 0.1) {
                const largeDelta = Math.max(0.05, tangentDelta * 5);
                const fallbackT = Math.min(1 - epsilon, Math.max(epsilon, clampedT + largeDelta));
                Vector.setCalcPathBezier(pts, fallbackT, tangentPoint);
                dx = tangentPoint.x - position.x;
                dy = tangentPoint.y - position.y;
            }

            // Reverse direction if we used backward tangent
            if (tangentT < clampedT) {
                dx = -dx;
                dy = -dy;
            }

            const angle = Math.atan2(dy, dx) + light.rotationOffset;
            const frameIndex = rects.length ? light.frame % rects.length : 0;
            const rect = rects[frameIndex];

            if (!rect) {
                continue;
            }

            const offset = offsets[frameIndex];
            const scale = light.scale;
            const normalAngle = angle + Math.PI / 2;
            const offsetDistance = light.normalOffset;
            const drawX = position.x + Math.cos(normalAngle) * offsetDistance;
            const drawY = position.y + Math.sin(normalAngle) * offsetDistance;

            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(angle);
            ctx.scale(scale, scale);

            const offsetX = offset ? offset.x : 0;
            const offsetY = offset ? offset.y : 0;

            ctx.drawImage(
                image,
                rect.x,
                rect.y,
                rect.w,
                rect.h,
                -rect.w / 2 - offsetX,
                -rect.h / 2 - offsetY,
                rect.w,
                rect.h
            );
            ctx.restore();
        }
    },
    drawBungee: function (pts, drawLights) {
        const count = pts.length,
            points = this.BUNGEE_BEZIER_POINTS,
            drawPts = this.drawPts;

        // we can't calc the distance for a single point
        if (count < 2) return;

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

        if (drawLights) {
            this._drawXmasLights(pts);
        }

        // reset the alpha
        if (previousAlpha !== alpha) {
            ctx.globalAlpha = previousAlpha;
        }
    },
});

// export const for use in GameScene
Bungee.BUNGEE_RELAXION_TIMES = BUNGEE_RELAXION_TIMES;

export default Bungee;
