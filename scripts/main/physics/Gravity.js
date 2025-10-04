define("physics/Gravity", ["core/Vector", "utils/Constants"], function (Vector, Constants) {
    var GCONST = 9.8 * Constants.PIXEL_TO_SI_METERS_K;

    var Gravity = {
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

    return Gravity;
});
