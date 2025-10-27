import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
export const GCONST = 9.8 * Constants.PIXEL_TO_SI_METERS_K;

/**
 * Gravity class for managing gravitational forces in the physics simulation.
 */
class Gravity {
    /**
     * @const
     * @type {number}
     */
    static EARTH_Y = GCONST;

    /**
     * Creates a new Gravity instance.
     */
    constructor() {
        this.current = new Vector(0, GCONST);
    }

    /**
     * Toggles the direction of gravity (flips vertical component).
     */
    toggle() {
        this.current.y = -this.current.y;
    }

    /**
     * Checks if gravity is zero.
     * @returns {boolean} True if both x and y components are zero.
     */
    isZero() {
        return this.current.y === 0 && this.current.x === 0;
    }

    /**
     * Checks if gravity is at normal Earth gravity.
     * @returns {boolean} True if gravity matches Earth's gravity pointing downward.
     */
    isNormal() {
        return this.current.y === Gravity.EARTH_Y && this.current.x === 0;
    }

    /**
     * Resets gravity to default Earth gravity.
     */
    reset() {
        this.current.x = 0;
        this.current.y = GCONST;
    }
}

// Export a singleton instance to maintain backward compatibility
export default new Gravity();
