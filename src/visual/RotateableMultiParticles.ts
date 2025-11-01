import MultiParticles from "@/visual/MultiParticles";
import Radians from "@/utils/Radians";
import MathHelper from "@/utils/MathHelper";
import Vector from "@/core/Vector";
import type Texture2D from "@/core/Texture2D";
import type Particles from "./Particles";

class RotateableMultiParticles extends MultiParticles {
    /**
     * @param {number} numParticles
     * @param {Texture2D} texture
     */
    constructor(numParticles: number, texture: Texture2D) {
        super(numParticles, texture);
        this.drawer.rotationAngles = [];
        this.drawer.rotationPositions = [];
    }

    override initParticle(particle: Particles) {
        super.initParticle(particle);
        particle.angle = 0;
        particle.deltaAngle = Radians.fromDegrees(
            this.rotateSpeed + this.rotateSpeedVar * MathHelper.randomMinus1to1()
        );

        const index = this.particles.length;
        this.drawer.rotationAngles[index] = 0;
        this.drawer.rotationPositions[index] = new Vector(0, 0);
    }

    /**
     * @param {Vector} v
     * @param {number} cosA
     * @param {number} sinA
     * @param {number} cx
     * @param {number} cy
     */
    rotatePreCalc(v: Vector, cosA: number, sinA: number, cx: number, cy: number) {
        v.x -= cx;
        v.y -= cy;

        const nx = v.x * cosA - v.y * sinA;
        const ny = v.x * sinA + v.y * cosA;

        v.x = nx + cx;
        v.y = ny + cy;
    }

    /**
     * @param {Particle} particle
     * @param {number} index
     * @param {number} delta
     */
    override updateParticle(particle: Particles, index: number, delta: number) {
        super.updateParticle(particle, index, delta);
        particle.angle += particle.deltaAngle * delta;

        // we need to save the angle and position for drawing rotation
        this.drawer.rotationAngles[index] = particle.angle;
        this.drawer.rotationPositions[index].copyFrom(particle.pos);
    }

    /**
     * @param {number} index
     */
    override removeParticle(index: number) {
        this.drawer.rotationAngles.splice(index, 1);
        this.drawer.rotationPositions.splice(index, 1);
        super.removeParticle(index);
    }
}

export default RotateableMultiParticles;
