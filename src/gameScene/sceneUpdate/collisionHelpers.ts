import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";

/**
 * @param {ConstrainedPoint} star
 * @param {number} rd
 * @param {number} yImpulse
 * @param {number} delta
 */
export function applyStarImpulse(star, rd, yImpulse, delta) {
    star.applyImpulse(new Vector(-star.v.x / rd, -star.v.y / rd + yImpulse), delta);
}

/**
 * @typedef {Object} HazardWithBounds
 * @property {Vector} t1 - Top-left corner
 * @property {Vector} t2 - Top-right corner
 * @property {Vector} b1 - Bottom-left corner
 * @property {Vector} b2 - Bottom-right corner
 */

/**
 * @param {HazardWithBounds} hazard
 * @param {ConstrainedPoint} star
 * @param {number} radius
 */
export function isCandyHit(hazard, star, radius) {
    const diameter = radius * 2;
    return (
        Rectangle.lineInRect(
            hazard.t1.x,
            hazard.t1.y,
            hazard.t2.x,
            hazard.t2.y,
            star.pos.x - radius,
            star.pos.y - radius,
            diameter,
            diameter
        ) ||
        Rectangle.lineInRect(
            hazard.b1.x,
            hazard.b1.y,
            hazard.b2.x,
            hazard.b2.y,
            star.pos.x - radius,
            star.pos.y - radius,
            diameter,
            diameter
        )
    );
}
