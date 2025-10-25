/**
 * RGBAColor class representing colors with red, green, blue, and alpha channels.
 * Color values should be in the range [0, 1].
 */
class RGBAColor {
    r: number;
    g: number;
    b: number;
    a: number;

    /**
     * @param r - red channel (0-1)
     * @param g - green channel (0-1)
     * @param b - blue channel (0-1)
     * @param a - alpha channel (0-1)
     */
    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    rgbaStyle(): string {
        return `rgba(${Math.round(this.r * 255)},${Math.round(this.g * 255)},${Math.round(this.b * 255)},${this.a.toFixed(2)})`;
    }

    equals(other: RGBAColor): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    copy(): RGBAColor {
        return new RGBAColor(this.r, this.g, this.b, this.a);
    }

    copyFrom(source: { r: number; g: number; b: number; a: number }): void {
        this.r = source.r;
        this.g = source.g;
        this.b = source.b;
        this.a = source.a;
    }

    add(other: { r: number; g: number; b: number; a: number }): void {
        this.r += other.r;
        this.g += other.g;
        this.b += other.b;
        this.a += other.a;
    }

    multiply(s: number): void {
        this.r *= s;
        this.g *= s;
        this.b *= s;
        this.a *= s;
    }

    // Static color constants
    static readonly transparent = new RGBAColor(0, 0, 0, 0);
    static readonly solidOpaque = new RGBAColor(1, 1, 1, 1);
    static readonly red = new RGBAColor(1, 0, 0, 1);
    static readonly blue = new RGBAColor(0, 0, 1, 1);
    static readonly green = new RGBAColor(0, 1, 0, 1);
    static readonly black = new RGBAColor(0, 0, 0, 1);
    static readonly white = new RGBAColor(1, 1, 1, 1);

    static readonly styles = {
        SOLID_OPAQUE: "rgba(255,255,255,1.00)",
        TRANSPARENT: "rgba(0,0,0,0.00)",
    } as const;
}

export default RGBAColor;
