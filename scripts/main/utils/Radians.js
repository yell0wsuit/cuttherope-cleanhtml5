/**
 * Helper class for dealing with radians
 */
const Radians = {
    /**
     * @const
     * @type {number}
     */
    degrees360: 6.283185307179586, // Math.PI * 2
    /**
     * Converts degrees to radians
     * @param degrees {number}
     * @return {number}
     */
    fromDegrees: function (degrees) {
        return degrees * 0.017453292519943295; // degrees * (Math.PI / 180)
    },
    /**
     * Converts radians to degrees
     * @param radians {number}
     * @return {number}
     */
    toDegrees: function (radians) {
        return radians * 57.29577951308232; // radians * 180 / Math.PI
    },
};

export default Radians;
