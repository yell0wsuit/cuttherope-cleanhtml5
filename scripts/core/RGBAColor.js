define("core/RGBAColor", [], function () {
    /**
     * RGBAColor constructor
     * @constructor
     * @param r {number} red
     * @param g {number} green
     * @param b {number} blue
     * @param a {number} alpha
     */
    function RGBAColor(r, g, b, a) {
        /** type {number} */
        this.r = r;
        /** type {number} */
        this.g = g;
        /** type {number} */
        this.b = b;
        /** type {number} */
        this.a = a;
    }

    RGBAColor.prototype.rgbaStyle = function () {
        return (
            "rgba(" +
            ((this.r * 255) >> 0) +
            "," +
            ((this.g * 255) >> 0) +
            "," +
            ((this.b * 255) >> 0) +
            "," +
            this.a.toFixed(2) +
            ")"
        );
    };

    /**
     * @param other {RGBAColor}
     * @return {boolean}
     */
    RGBAColor.prototype.equals = function (other) {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    };

    RGBAColor.prototype.copy = function () {
        return new RGBAColor(this.r, this.g, this.b, this.a);
    };

    RGBAColor.prototype.copyFrom = function (source) {
        this.r = source.r;
        this.g = source.g;
        this.b = source.b;
        this.a = source.a;
    };

    RGBAColor.prototype.add = function (other) {
        this.r += other.r;
        this.g += other.g;
        this.b += other.b;
        this.a += other.a;
    };

    RGBAColor.prototype.multiply = function (s) {
        this.r *= s;
        this.g *= s;
        this.b *= s;
        this.a *= s;
    };

    /**
     * @type {RGBAColor}
     * @const
     */
    RGBAColor.transparent = new RGBAColor(0, 0, 0, 0);

    /**
     * @type {RGBAColor}
     * @const
     */
    RGBAColor.solidOpaque = new RGBAColor(1, 1, 1, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    RGBAColor.red = new RGBAColor(1, 0, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    RGBAColor.blue = new RGBAColor(0, 0, 1, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    RGBAColor.green = new RGBAColor(0, 1, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    RGBAColor.black = new RGBAColor(0, 0, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    RGBAColor.white = RGBAColor.solidOpaque;

    /**
     * @enum {string}
     */
    RGBAColor.styles = {
        SOLID_OPAQUE: "rgba(255,255,255,1)",
        TRANSPARENT: "rgba(0,0,0,0)",
    };

    return RGBAColor;
});
