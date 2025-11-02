import RotateableMultiParticles from "@/visual/RotateableMultiParticles";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";

class RocketSparks extends RotateableMultiParticles {
    /**
     * @param {number} totalParticles
     * @param {import('@/core/Texture2D').default} texture
     * @param {number[]} [sparkFrames]
     */
    constructor(totalParticles, texture, sparkFrames = null) {
        super(totalParticles, texture);

        /** @type {number} */
        this.initialAngle = 0;
        /** @type {number[]} */
        this.sparkFrameIndices = sparkFrames;

        this.duration = -1;
        this.gravity.x = 0;
        this.gravity.y = 0;
        this.angle = 0;
        this.angleVar = 10;
        this.speed = 50;
        this.speedVar = 10;
        this.radialAccel = 0;
        this.radialAccelVar = 0;
        this.tangentialAccel = 0;
        this.tangentialAccelVar = 0;
        this.posVar.x = 5;
        this.posVar.y = 5;
        this.life = 0.5;
        this.lifeVar = 0.1;
        this.size = 0.5;
        this.sizeVar = 0;
        this.emissionRate = 20;
        this.startColor.r = 1;
        this.startColor.g = 1;
        this.startColor.b = 1;
        this.startColor.a = 1;
        this.startColorVar.r = 0;
        this.startColorVar.g = 0;
        this.startColorVar.b = 0;
        this.startColorVar.a = 0;
        this.endColor.r = 0;
        this.endColor.g = 0;
        this.endColor.b = 0;
        this.endColor.a = 0;
        this.endColorVar.r = 0;
        this.endColorVar.g = 0;
        this.endColorVar.b = 0;
        this.endColorVar.a = 0;
        this.rotateSpeed = 0;
        this.rotateSpeedVar = 0;
        this.blendAdditive = true;
    }

    /**
     * @param {any} particle
     */
    initParticle(particle) {
        const index = this.particles.length;
        super.initParticle(particle);

        const texture = this.imageGrid;
        const frameIndex = this._resolveFrameIndex();
        const textureQuad = texture.rects[frameIndex];
        const vertexQuad = new Rectangle(0, 0, 0, 0);
        this.drawer.setTextureQuad(index, textureQuad, vertexQuad);

        particle.width = textureQuad.w * this.size;
        particle.height = textureQuad.h * this.size;
        particle.angle = this.initialAngle;
        this.drawer.rotationAngles[index] = this.initialAngle;
    }

    _resolveFrameIndex() {
        if (this.sparkFrameIndices && this.sparkFrameIndices.length) {
            const start = 0;
            const end = this.sparkFrameIndices.length - 1;
            const randomIndex = MathHelper.randomRange(start, end);
            return this.sparkFrameIndices[randomIndex];
        }

        return MathHelper.randomRange(0, this.imageGrid.rects.length - 1);
    }
}

export default RocketSparks;
