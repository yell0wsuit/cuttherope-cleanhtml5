export interface RGBAColorLike {
    r: number;
    g: number;
    b: number;
    a: number;
}

class RGBAColor {
    static readonly transparent = new RGBAColor(0, 0, 0, 0);

    static readonly solidOpaque = new RGBAColor(1, 1, 1, 1);

    static readonly red = new RGBAColor(1, 0, 0, 1);

    static readonly blue = new RGBAColor(0, 0, 1, 1);

    static readonly green = new RGBAColor(0, 1, 0, 1);

    static readonly black = new RGBAColor(0, 0, 0, 1);

    static readonly white = RGBAColor.solidOpaque;

    static readonly styles: Readonly<{ SOLID_OPAQUE: string; TRANSPARENT: string }> = {
        SOLID_OPAQUE: "rgba(255,255,255,1)",
        TRANSPARENT: "rgba(0,0,0,0)",
    };

    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number
    ) {}

    rgbaStyle(): string {
        return `rgba(${Math.round(this.r * 255)},${Math.round(this.g * 255)},${Math.round(this.b * 255)},${this.a.toFixed(2)})`;
    }

    equals(other: RGBAColorLike): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    copy(): RGBAColor {
        return new RGBAColor(this.r, this.g, this.b, this.a);
    }

    copyFrom(source: RGBAColorLike): void {
        this.r = source.r;
        this.g = source.g;
        this.b = source.b;
        this.a = source.a;
    }

    add(other: RGBAColorLike): void {
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
}

export default RGBAColor;
