import Vector from "core/Vector";
/**
 * convertion rate between screen pixels and si system meters
 * @const
 * @type {number}
 */
const PIXEL_TO_SI_METERS_K = 80;

const Constants = {
    /**
     * @const
     * @type {number}
     */
    MAX_TOUCHES: 2,

    /**
     * @const
     * @type {number}
     */
    DIM_TIMEOUT: 0.15,

    /**
     * @const
     * @type {number}
     */
    UNDEFINED: -1,

    /**
     * Used in timelines to decide when we should stop caring (occurs
     * when very small amounts of time are left in the animation).
     * @const
     * @type {number}
     */
    FLOAT_PRECISION: 0.000001,

    /**
     * how many times the world moves slower
     * @const
     * @type {number}
     */
    TIME_SCALE: 1,

    /**
     * convertion rate between screen pixels and si system meters
     * @const
     * @type {number}
     */
    PIXEL_TO_SI_METERS_K: PIXEL_TO_SI_METERS_K,

    /**
     * @const
     * @type {number}
     */
    AIR_RESISTANCE: 0.15,

    /**
     * @const
     * @type {number}
     */
    MAX_FORCES: 10,

    /**
     * @const
     * @type {number}
     */
    CANDY2_FLAG: -2,

    /**
     * Max integer. Javascript actually supports larger ints (up to 2^53)
     * because all numbers are 64-bit floats. However, we want to use the
     * max 32 bit int because sometimes Javascript utilizes integer math
     * when possible under the covers, which is much faster.
     * @const
     * @type {number}
     */
    INT_MAX: 0x7fffffff,
};

export default Constants;
