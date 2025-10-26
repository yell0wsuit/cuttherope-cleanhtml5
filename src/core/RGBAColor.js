/**
 * RGBAColor constructor
 * @constructor
 * @param r {number} red
 * @param g {number} green
 * @param b {number} blue
 * @param a {number} alpha
 */
class RGBAColor {
    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     */
    constructor(r, g, b, a) {
        /** @type {number} */
        this.r = r;
        /** @type {number} */
        this.g = g;
        /** @type {number} */
        this.b = b;
        /** @type {number} */
        this.a = a;
    }

    rgbaStyle() {
        return `rgba(${(this.r * 255) >> 0},${(this.g * 255) >> 0},${(this.b * 255) >> 0},${this.a.toFixed(2)})`;
    }

    /**
     * @param {RGBAColor} other
     * @return {boolean}
     */
    equals(other) {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    copy() {
        return new RGBAColor(this.r, this.g, this.b, this.a);
    }

    /**
     * @param {{ r: number; g: number; b: number; a: number; }} source
     */
    copyFrom(source) {
        this.r = source.r;
        this.g = source.g;
        this.b = source.b;
        this.a = source.a;
    }

    /**
     * @param {{ r: number; g: number; b: number; a: number; }} other
     */
    add(other) {
        this.r += other.r;
        this.g += other.g;
        this.b += other.b;
        this.a += other.a;
    }

    /**
     * @param {number} s
     */
    multiply(s) {
        this.r *= s;
        this.g *= s;
        this.b *= s;
        this.a *= s;
    }

    /**
     * @type {RGBAColor}
     * @const
     */
    static transparent = new RGBAColor(0, 0, 0, 0);

    /**
     * @type {RGBAColor}
     * @const
     */
    static solidOpaque = new RGBAColor(1, 1, 1, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static red = new RGBAColor(1, 0, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static blue = new RGBAColor(0, 0, 1, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static green = new RGBAColor(0, 1, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static black = new RGBAColor(0, 0, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static white = RGBAColor.solidOpaque;

    /**
     * @enum {string}
     */
    static styles = {
        SOLID_OPAQUE: "rgba(255,255,255,1)",
        TRANSPARENT: "rgba(0,0,0,0)",
    };
}

export default RGBAColor;
