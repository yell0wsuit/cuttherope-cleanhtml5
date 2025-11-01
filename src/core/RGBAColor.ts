/**
 * RGBAColor constructor
 * @constructor
 * @param {number} r red
 * @param {number} g green
 * @param {number} b blue
 * @param {number} a alpha
 */
class RGBAColor {
    r: number;
    g: number;
    b: number;
    a: number;
    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     */
    constructor(r: number, g: number, b: number, a: number) {
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
        return `rgba(${Math.round(this.r * 255)},${Math.round(this.g * 255)},${Math.round(this.b * 255)},${this.a.toFixed(2)})`;
    }

    /**
     * @param {RGBAColor} other
     * @return {boolean}
     */
    equals(other: RGBAColor): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    copy() {
        return new RGBAColor(this.r, this.g, this.b, this.a);
    }

    /**
     * @param {{ r: number; g: number; b: number; a: number; }} source
     */
    copyFrom(source: { r: number; g: number; b: number; a: number }) {
        this.r = source.r;
        this.g = source.g;
        this.b = source.b;
        this.a = source.a;
    }

    /**
     * @param {{ r: number; g: number; b: number; a: number; }} other
     */
    add(other: { r: number; g: number; b: number; a: number }) {
        this.r += other.r;
        this.g += other.g;
        this.b += other.b;
        this.a += other.a;
    }

    /**
     * @param {number} s
     */
    multiply(s: number) {
        this.r *= s;
        this.g *= s;
        this.b *= s;
        this.a *= s;
    }

    /**
     * @type {RGBAColor}
     * @const
     */
    static transparent: RGBAColor = new RGBAColor(0, 0, 0, 0);

    /**
     * @type {RGBAColor}
     * @const
     */
    static solidOpaque: RGBAColor = new RGBAColor(1, 1, 1, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static red: RGBAColor = new RGBAColor(1, 0, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static blue: RGBAColor = new RGBAColor(0, 0, 1, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static green: RGBAColor = new RGBAColor(0, 1, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static black: RGBAColor = new RGBAColor(0, 0, 0, 1);

    /**
     * @type {RGBAColor}
     * @const
     */
    static white: RGBAColor = RGBAColor.solidOpaque;

    /**
     * @enum {string}
     */
    static styles = {
        SOLID_OPAQUE: "rgba(255,255,255,1)",
        TRANSPARENT: "rgba(0,0,0,0)",
    };
}

export default RGBAColor;
