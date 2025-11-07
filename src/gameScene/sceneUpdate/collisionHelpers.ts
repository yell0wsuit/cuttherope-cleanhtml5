import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";
import type ConstrainedPoint from "@/physics/ConstrainedPoint";

export const applyStarImpulse = (
    star: ConstrainedPoint,
    rd: number,
    yImpulse: number,
    delta: number
) => {
    star.applyImpulse(new Vector(-star.v.x / rd, -star.v.y / rd + yImpulse), delta);
};

interface HazardWithBounds {
    t1: Vector;
    t2: Vector;
    b1: Vector;
    b2: Vector;
}

export const isCandyHit = (hazard: HazardWithBounds, star: ConstrainedPoint, radius: number) => {
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
};
