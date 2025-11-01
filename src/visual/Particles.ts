import Vector from "@/core/Vector";
import RGBAColor from "@/core/RGBAColor";
import BaseElement from "@/visual/BaseElement";
import MathHelper from "@/utils/MathHelper";
import Canvas from "@/utils/Canvas";
import resolution from "@/resolution";
import Radians from "@/utils/Radians";

/**
 * @constructor
 */
class PointSprite {
    x: number;
    y: number;
    size: number;
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} size
     */
    constructor(x: number, y: number, size: number) {
        this.x = x;
        this.y = y;
        this.size = size;
    }
}

/**
 * @constructor
 */
class Particle {
    startPos: Vector;
    pos: Vector;
    dir: Vector;
    radialAccel: number;
    tangentialAccel: number;
    color: RGBAColor;
    deltaColor: RGBAColor;
    size: number;
    life: number;
    deltaAngle: number;
    angle: number;
    width: number;
    height: number;

    constructor() {
        this.startPos = new Vector(0, 0);
        this.pos = new Vector(0, 0);
        this.dir = new Vector(0, 0);
        this.radialAccel = 0;
        this.tangentialAccel = 0;
        this.color = new RGBAColor(0, 0, 0, 0);
        this.deltaColor = new RGBAColor(0, 0, 0, 0);
        this.size = 0;
        this.life = 0;
        this.deltaAngle = 0;
        this.angle = 0;

        // used in multi-image particles
        this.width = 0;
        this.height = 0;
    }
}

class Particles extends BaseElement {
    width: number;
    height: number;
    totalParticles: number;
    particles: never[];
    active: boolean;
    duration: number;
    elapsed: number;
    gravity: Vector;
    posVar: Vector;
    angle: number;
    angleVar: number;
    speed: number;
    speedVar: number;
    tangentialAccel: number;
    tangentialAccelVar: number;
    radialAccel: number;
    radialAccelVar: number;
    size: number;
    sizeVar: number;
    life: number;
    lifeVar: number;
    startColor: RGBAColor;
    startColorVar: RGBAColor;
    endColor: RGBAColor;
    endColorVar: RGBAColor;
    blendAdditive: boolean;
    colorModulate: boolean;
    emissionRate: number;
    emitCounter: number;
    texture: null;
    vertices: never[];
    colors: never[];
    particleIdx: number;
    onFinished: null;
    x?: number;
    y?: number;
    color: any;
    /**
     * @param {number} numParticles
     */
    constructor(numParticles: number) {
        super();
        this.width = resolution.CANVAS_WIDTH;
        this.height = resolution.CANVAS_HEIGHT;

        this.totalParticles = numParticles;
        /**
         * @type {Particle[]}
         */
        this.particles = [];

        // not active by default
        this.active = false;
        // duration in seconds of the system. -1 is infinity
        this.duration = 0;
        // time elapsed since the start of the system (in seconds)
        this.elapsed = 0;

        /// Gravity of the particles
        this.gravity = new Vector(0, 0);

        // Position variance
        this.posVar = new Vector(0, 0);

        // The angle (direction) of the particles measured in degrees
        this.angle = 0;
        // Angle variance measured in degrees;
        this.angleVar = 0;

        // The speed the particles will have.
        this.speed = 0;
        // The speed variance
        this.speedVar = 0;

        // Tangential acceleration
        this.tangentialAccel = 0;
        // Tangential acceleration variance
        this.tangentialAccelVar = 0;

        // Radial acceleration
        this.radialAccel = 0;
        // Radial acceleration variance
        this.radialAccelVar = 0;

        // Size of the particles
        this.size = 0;
        // Size variance
        this.sizeVar = 0;

        // How many seconds will the particle live
        this.life = 0;
        // Life variance
        this.lifeVar = 0;

        // Start color of the particles
        this.startColor = new RGBAColor(0, 0, 0, 0);
        // Start color variance
        this.startColorVar = new RGBAColor(0, 0, 0, 0);
        // End color of the particles
        this.endColor = new RGBAColor(0, 0, 0, 0);
        // End color variance
        this.endColorVar = new RGBAColor(0, 0, 0, 0);

        // additive color or blend
        this.blendAdditive = false;
        // color modulate
        this.colorModulate = false;

        // How many particles can be emitted per second
        this.emissionRate = 0;
        this.emitCounter = 0;

        // Texture of the particles
        /**
         * @type {Texture2D | null}
         */
        this.texture = null;

        // Array of (x,y,size)
        /**
         * @type {PointSprite[]}
         */
        this.vertices = [];
        // Array of colors
        /**
         * @type {RGBAColor[]}
         */
        this.colors = [];

        //  particle idx
        this.particleIdx = 0;

        // callback when particle system has finished
        /**
         * @type {((arg0: this) => void) | null}
         */
        this.onFinished = null;
    }

    /**
     * Creates and adds a particle to the system
     * @return {boolean} false if the system is full, otherwise true
     */
    addParticle(): boolean {
        if (this.particles.length == this.totalParticles) {
            return false;
        }

        const particle = new Particle();
        this.initParticle(particle);
        this.particles.push(particle);
        return true;
    }

    /**
     * @param {Particle} particle
     */
    initParticle(particle: Particle) {
        particle.pos.x = this.x + this.posVar.x * MathHelper.randomMinus1to1();
        particle.pos.y = this.y + this.posVar.y * MathHelper.randomMinus1to1();
        particle.startPos.copyFrom(particle.pos);

        const a = Radians.fromDegrees(this.angle + this.angleVar * MathHelper.randomMinus1to1());
        const v = new Vector(Math.cos(a), Math.sin(a));
        const s = this.speed + this.speedVar * MathHelper.randomMinus1to1();

        // direction
        v.multiply(s);
        particle.dir = v;

        // radial acceleration
        particle.radialAccel =
            this.radialAccel + this.radialAccelVar * MathHelper.randomMinus1to1();

        // tangential acceleration
        particle.tangentialAccel =
            this.tangentialAccel + this.tangentialAccelVar * MathHelper.randomMinus1to1();

        // life
        particle.life = this.life + this.lifeVar * MathHelper.randomMinus1to1();

        // color
        const start = new RGBAColor(
            this.startColor.r + this.startColorVar.r * MathHelper.randomMinus1to1(),
            this.startColor.g + this.startColorVar.g * MathHelper.randomMinus1to1(),
            this.startColor.b + this.startColorVar.b * MathHelper.randomMinus1to1(),
            this.startColor.a + this.startColorVar.a * MathHelper.randomMinus1to1()
        );

        const end = new RGBAColor(
            this.endColor.r + this.endColorVar.r * MathHelper.randomMinus1to1(),
            this.endColor.g + this.endColorVar.g * MathHelper.randomMinus1to1(),
            this.endColor.b + this.endColorVar.b * MathHelper.randomMinus1to1(),
            this.endColor.a + this.endColorVar.a * MathHelper.randomMinus1to1()
        );

        particle.color = start;
        particle.deltaColor.r = (end.r - start.r) / particle.life;
        particle.deltaColor.g = (end.g - start.g) / particle.life;
        particle.deltaColor.b = (end.b - start.b) / particle.life;
        particle.deltaColor.a = (end.a - start.a) / particle.life;

        // size
        particle.size = this.size + this.sizeVar * MathHelper.randomMinus1to1();
    }

    /**
     * @param {number} delta
     */
    override update(delta: number) {
        super.update(delta);
        if (this.onFinished) {
            if (this.particles.length === 0 && !this.active) {
                this.onFinished(this);
                return;
            }
        }

        if (this.active && this.emissionRate) {
            const rate = 1 / this.emissionRate;
            this.emitCounter += delta;
            while (this.particles.length < this.totalParticles && this.emitCounter > rate) {
                this.addParticle();
                this.emitCounter -= rate;
            }

            this.elapsed += delta;
            if (this.duration !== -1 && this.duration < this.elapsed) {
                this.stopSystem();
            }
        }

        this.particleIdx = 0;
        while (this.particleIdx < this.particles.length) {
            const p = this.particles[this.particleIdx];
            if (p.life > 0) {
                this.updateParticleLocation(p, delta);

                p.color.r += p.deltaColor.r * delta;
                p.color.g += p.deltaColor.g * delta;
                p.color.b += p.deltaColor.b * delta;
                p.color.a += p.deltaColor.a * delta;

                p.life -= delta;

                this.updateParticle(p, this.particleIdx, delta);
                this.particleIdx++;
            } else {
                // remove the particle
                this.removeParticle(this.particleIdx);
            }
        }
    }

    /**
     * @param {Particle} p
     * @param {number} delta
     */
    updateParticleLocation(p: Particle, delta: number) {
        let radial;

        // radial acceleration
        if (p.pos.x || p.pos.y) {
            radial = p.pos.copy();
            radial.normalize();
        } else {
            radial = new Vector(0, 0);
        }
        const tangential = radial.copy();
        radial.multiply(p.radialAccel);

        // tangential acceleration
        const newy = tangential.x;
        tangential.x = -tangential.y;
        tangential.y = newy;
        tangential.multiply(p.tangentialAccel);

        // (gravity + radial + tangential) * delta
        const tmp = Vector.add(radial, tangential);
        tmp.add(this.gravity);
        tmp.multiply(delta);
        p.dir.add(tmp);

        tmp.copyFrom(p.dir);
        tmp.multiply(delta);
        p.pos.add(tmp);
    }

    /**
     * @param {Particle} particle
     * @param {number} index
     * @param {number} delta
     */
    updateParticle(particle: Particle, index: number, delta: number) {
        this.vertices[this.particleIdx] = new PointSprite(
            particle.pos.x,
            particle.pos.y,
            particle.size
        );

        this.colors[this.particleIdx] = particle.color;
    }

    /**
     * @param {number} index
     */
    removeParticle(index: number) {
        this.particles.splice(index, 1);
    }

    /**
     * @param {number} initialParticles
     */
    startSystem(initialParticles: number) {
        this.particles.length = 0;
        for (let i = 0; i < initialParticles; i++) {
            this.addParticle();
        }
        this.active = true;
    }

    stopSystem() {
        this.active = false;
        this.elapsed = this.duration;
        this.emitCounter = 0;
    }

    resetSystem() {
        this.elapsed = 0;
        this.emitCounter = 0;
    }

    override draw() {
        this.preDraw();

        // only draw if the image is non-transparent
        if (this.color.a !== 0) {
            const ctx = Canvas.context;
            const image = this.texture.image;

            if (!ctx) {
                return;
            }

            for (let i = 0, len = this.particleIdx; i < len; i++) {
                const p = this.particles[i];
                ctx.drawImage(image, Math.round(p.x), Math.round(p.y));
            }
        }

        this.postDraw();
    }

    isFull() {
        return this.particles.length === this.totalParticles;
    }
}

export default Particles;
