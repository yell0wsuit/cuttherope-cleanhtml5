define("game/Bungee", [
    "physics/ConstraintSystem",
    "physics/ConstrainedPoint",
    "resolution",
    "utils/Constants",
    "physics/ConstraintType",
    "core/Vector",
    "utils/Canvas",
    "core/RGBAColor",
    "utils/Mover",
    "utils/Log",
    "physics/satisfyConstraintArray",
], function (
    ConstraintSystem,
    ConstrainedPoint,
    resolution,
    Constants,
    ConstraintType,
    Vector,
    Canvas,
    RGBAColor,
    Mover,
    Log,
    satisfyConstraintArray
) {
    /**
     * @const
     * @type {number}
     */
    var ROLLBACK_K = 0.5;

    /**
     * @const
     * @type {number}
     */
    var BUNGEE_RELAXION_TIMES = 25;

    /**
     * @const
     * @type {number}
     */
    var MAX_BUNGEE_SEGMENTS = 10;

    /**
     * @const
     * @type {number}
     */
    var DEFAULT_PART_WEIGHT = 0.02;

    /**
     * @const
     * @type {number}
     */
    var STRENGTHENED_PART_WEIGHT = 0.5;

    /**
     * @const
     * @type {number}
     */
    var CUT_DISSAPPEAR_TIMEOUT = 2.0;

    /**
     * @const
     * @type {number}
     */
    var WHITE_TIMEOUT = 0.05;

    /** @enum {number} */
    var BungeeMode = {
        NORMAL: 0,
        LOCKED: 1,
    };

    // create temp color objects used during draw (to reduce allocations)
    var drawBlack = new RGBAColor(0, 0, 0, 1),
        drawC1 = new RGBAColor(0, 0, 0, 1),
        drawD1 = new RGBAColor(0, 0, 0, 1),
        drawC2 = new RGBAColor(0, 0, 0, 1),
        drawD2 = new RGBAColor(0, 0, 0, 1);

    var Bungee = ConstraintSystem.extend({
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

            this.tail.addConstraint(
                this.bungeeAnchor,
                this.BUNGEE_REST_LEN,
                ConstraintType.DISTANCE
            );

            var offset = Vector.subtract(this.tail.pos, this.bungeeAnchor.pos);
            var pointsNum = Math.round(len / this.BUNGEE_REST_LEN + 2);
            offset.divide(pointsNum);

            this.roll(len, offset);
            this.forceWhite = false;
            this.initialCandleAngle = Constants.UNDEFINED;
            this.chosenOne = false;
            this.hideTailParts = false;
            this.dontDrawRedStretch = false;

            this.drawPts = [];

            this.BUNGEE_BEZIER_POINTS = resolution.BUNGEE_BEZIER_POINTS;
        },
        /**
         * @return {number}
         */
        getLength: function () {
            var len = 0,
                parts = this.parts,
                numParts = parts.length;
            if (numParts > 0) {
                var v = parts[0].pos;
                for (var i = 1; i < numParts; i++) {
                    var part = parts[i];
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

            var parts = this.parts,
                prev = parts[parts.length - 2],
                tail = this.tail,
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
                    var newRestLen = rollLen + heroRestLen;
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
        },
        rollBack: function (amount) {
            var rollBackLen = amount,
                parts = this.parts,
                partsCount = parts.length,
                prev = parts[partsCount - 2],
                tail = this.tail,
                heroRestLen = tail.restLength(prev),
                oldAnchor;

            while (rollBackLen > 0) {
                if (rollBackLen >= this.BUNGEE_REST_LEN) {
                    var oldAnchorIndex = partsCount - 2,
                        newAnchor = parts[partsCount - 3];

                    oldAnchor = parts[oldAnchorIndex];
                    tail.changeConstraintAndLength(oldAnchor, newAnchor, heroRestLen);
                    this.removePartAtIndex(oldAnchorIndex);
                    partsCount--;
                    rollBackLen -= this.BUNGEE_REST_LEN;
                } else {
                    var newRestLen = heroRestLen - rollBackLen;
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

            var newTailRestLen = (partsCount - 1) * (this.BUNGEE_REST_LEN + 3);
            var constraints = tail.constraints,
                numConstraints = constraints.length;
            for (var i = 0; i < numConstraints; i++) {
                var c = constraints[i];
                if (c.type === ConstraintType.NOT_MORE_THAN) c.restLength = newTailRestLen;
            }
            return rollBackLen;
        },
        strengthen: function () {
            var parts = this.parts,
                numParts = parts.length;
            for (var i = 0; i < numParts; i++) {
                var cp = parts[i];
                if (this.bungeeAnchor.pin.x != Constants.UNDEFINED) {
                    if (cp != this.tail) {
                        cp.setWeight(STRENGTHENED_PART_WEIGHT);
                    }

                    if (i > 0) {
                        var restLen = i * (this.BUNGEE_REST_LEN + 3);
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

            var parts = this.parts,
                numParts = parts.length,
                relaxationTimes = this.relaxationTimes,
                tail = this.tail,
                i,
                cp,
                k;

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

            var parts = this.parts,
                p1 = parts[partIndex],
                p2 = parts[partIndex + 1];

            if (!p2) {
                p1.removeConstraints();
            } else {
                var p2Constraints = p2.constraints,
                    p2NumConstraints = p2Constraints.length;
                for (var k = 0; k < p2NumConstraints; k++) {
                    var c = p2Constraints[k];
                    if (c.cp === p1) {
                        p2.removeConstraintAtIndex(k);

                        var np2 = new ConstrainedPoint();
                        np2.setWeight(0.00001);
                        np2.pos.copyFrom(p2.pos);
                        np2.prevPos.copyFrom(p2.prevPos);
                        this.addPartAtIndex(np2, partIndex + 1);
                        np2.addConstraint(p1, this.BUNGEE_REST_LEN, ConstraintType.DISTANCE);
                        break;
                    }
                }
            }

            for (var i = 0, numParts = parts.length; i < numParts; i++) {
                var cp = parts[i];
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
            var parts = this.parts,
                count = parts.length,
                ctx = Canvas.context,
                i,
                part,
                prevPart;

            ctx.lineJoin = "round";
            ctx.lineWidth = this.lineWidth;

            if (this.cut === Constants.UNDEFINED) {
                var pts = new Array(count);
                for (i = 0; i < count; i++) {
                    pts[i] = parts[i].pos;
                    //Log.debug('Point ' + i + ': ' + pts[i].toString());
                }
                this.drawBungee(pts);
            } else {
                var pts1 = [],
                    pts2 = [],
                    part2 = false;
                for (i = 0; i < count; i++) {
                    part = parts[i];
                    var linked = true;

                    if (i > 0) {
                        prevPart = parts[i - 1];
                        if (!part.hasConstraint(prevPart)) {
                            linked = false;
                        }
                    }

                    if (part.pin.x === Constants.UNDEFINED && !linked) {
                        part2 = true;
                    }

                    if (!part2) {
                        pts1[i] = part.pos;
                    } else {
                        pts2.push(part.pos);
                    }
                }

                if (pts1.length > 0) {
                    this.drawBungee(pts1);
                }
                if (pts2.length > 0 && !this.hideTailParts) {
                    this.drawBungee(pts2);
                }
            }
            ctx.lineWidth = 1;
        },
        drawBungee: function (pts) {
            var count = pts.length,
                points = this.BUNGEE_BEZIER_POINTS,
                drawPts = this.drawPts;

            // we can't calc the distance for a single point
            if (count < 2) return;

            // set the global alpha
            var alpha =
                this.cut === Constants.UNDEFINED || this.forceWhite
                    ? 1
                    : this.cutTime / (CUT_DISSAPPEAR_TIMEOUT - WHITE_TIMEOUT);

            if (alpha <= 0) {
                return;
            }

            var firstPoint = pts[0],
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

            var black = drawBlack,
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
                var f = (ptsDistance / this.BUNGEE_REST_LEN) * 2;
                d1.r *= f;
                d2.r *= f;
            }

            var useC1 = false, // ropes have alternating color segments
                numVertices = (count - 1) * points;

            // // colors
            // //noinspection UnnecessaryLocalVariableJS
            var b1 = d1,
                colorDivisor = numVertices - 1,
                b1rf = (c1.r - d1.r) / colorDivisor,
                b1gf = (c1.g - d1.g) / colorDivisor,
                b1bf = (c1.b - d1.b) / colorDivisor;

            var numSegments = this.BUNGEE_BEZIER_POINTS - 1,
                lastSegmentIndex = numSegments - 1,
                ctx = Canvas.context,
                previousAlpha = ctx.globalAlpha;

            // set the line style
            if (previousAlpha !== alpha) {
                ctx.globalAlpha = alpha;
            }

            // store the first point in the path
            var firstDrawPoint = drawPts[0];
            if (!firstDrawPoint) {
                firstDrawPoint = drawPts[0] = firstPoint.copy();
            } else {
                firstDrawPoint.x = firstPoint.x;
                firstDrawPoint.y = firstPoint.y;
            }

            var vertex, a, pathVector, currentColor;

            ctx.beginPath();

            var currentColor = b1.rgbaStyle();
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
                var segmentIndex = (vertex - 1) % numSegments;
                if (segmentIndex === lastSegmentIndex || vertex === numVertices) {
                    // decide which color to use for this section
                    // if (this.forceWhite) {
                    //     currentColor = RGBAColor.styles.SOLID_OPAQUE;
                    // }
                    // else if (useC1) {
                    //     currentColor = b1.rgbaStyle();
                    // }
                    // else {
                    //     currentColor = b2.rgbaStyle();
                    // }

                    //ctx.strokeStyle = currentColor;

                    // move to the beginning of the color section
                    var currentIndex = vertex - segmentIndex - 1;
                    var point = drawPts[currentIndex++];
                    ctx.moveTo(point.x, point.y);

                    // draw each line segment (2 segments per color section)
                    for (; currentIndex <= vertex; currentIndex++) {
                        point = drawPts[currentIndex];
                        ctx.lineTo(point.x, point.y);
                        //Log.debug('Segment to [' + point.x + ', ' + point.y + '] color: ' + currentColor );
                    }

                    //ctx.stroke();
                    //useC1 = !useC1;

                    var colorMultiplier = segmentIndex + 1;

                    // adjust colors
                    b1.r += b1rf * colorMultiplier;
                    b1.g += b1gf * colorMultiplier;
                    b1.b += b1bf * colorMultiplier;
                }
            }

            ctx.stroke();

            // reset the alpha
            if (previousAlpha !== alpha) {
                ctx.globalAlpha = previousAlpha;
            }
        },
    });

    // export const for use in GameScene
    Bungee.BUNGEE_RELAXION_TIMES = BUNGEE_RELAXION_TIMES;

    return Bungee;
});
