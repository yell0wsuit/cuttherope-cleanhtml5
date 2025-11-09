/**
 * Utility for radian–degree conversions
 */
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const TAU = Math.PI * 2; // same as 360°

const Radians = {
    TAU,
    fromDegrees: (deg: number): number => deg * DEG_TO_RAD,
    toDegrees: (rad: number): number => rad * RAD_TO_DEG,
} as const;

export type RadiansUtil = typeof Radians;

export default Radians;
