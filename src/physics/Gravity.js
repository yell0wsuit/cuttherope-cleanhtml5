import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
const GCONST = 9.8 * Constants.PIXEL_TO_SI_METERS_K;

const Gravity = {
    /**
     * @const
     * @type {number}
     */
    EARTH_Y: GCONST,
    current: new Vector(0, GCONST),
    toggle: function () {
        Gravity.current.y = -Gravity.current.y;
    },
    isZero: function () {
        return Gravity.current.y === 0 && Gravity.current.x === 0;
    },
    isNormal: function () {
        return Gravity.current.y === Gravity.EARTH_Y && Gravity.current.x === 0;
    },
    reset: function () {
        Gravity.current.x = 0;
        Gravity.current.y = GCONST;
    },
};

export default Gravity;
