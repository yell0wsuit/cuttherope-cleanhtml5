import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";

const GCONST = 9.8 * Constants.PIXEL_TO_SI_METERS_K;

class Gravity {
    /**
     * @const
     * @type {number}
     */
    static EARTH_Y = GCONST;

    constructor() {
        this.current = new Vector(0, GCONST);
    }

    toggle() {
        this.current.y = -this.current.y;
    }

    isZero() {
        return this.current.y === 0 && this.current.x === 0;
    }

    isNormal() {
        return this.current.y === Gravity.EARTH_Y && this.current.x === 0;
    }

    reset() {
        this.current.x = 0;
        this.current.y = GCONST;
    }
}

export default Gravity;
