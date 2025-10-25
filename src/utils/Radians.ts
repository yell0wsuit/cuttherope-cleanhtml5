/**
 * Utility for radian–degree conversions
 */
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const TAU = Math.PI * 2; // same as 360°

const Radians = {
    TAU,
    fromDegrees: (deg) => deg * DEG_TO_RAD,
    toDegrees: (rad) => rad * RAD_TO_DEG,
};

export default Radians;
