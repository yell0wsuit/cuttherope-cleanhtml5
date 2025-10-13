import RotateableMultiParticles from "@/visual/RotateableMultiParticles";
import ResourceMgr from "@/resources/ResourceMgr";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";
import RGBAColor from "@/core/RGBAColor";
import { CLOUD_SLICES_FOR_PARTICLES, getGhostTexture } from "@/game/GhostAssets";
const GhostMorphingParticles = RotateableMultiParticles.extend({
    init: function (numParticles) {
        const texture = ResourceMgr.getTexture(getGhostTexture());
        this._super(numParticles, texture);
        this.size = 0.6;
        this.sizeVar = 0.2;
        this.angle = MathHelper.randomRange(0, 360);
        this.angleVar = 15;
        this.rotateSpeed = 0;
        this.rotateSpeedVar = 30;
        this.life = 0.4;
        this.lifeVar = 0.15;
        this.duration = 1.5;
        this.speed = 60;
        this.speedVar = 15;
        this.startColor = RGBAColor.solidOpaque.copy();
        this.endColor = RGBAColor.transparent.copy();
    },
    initParticle: function (particle) {
        this._super(particle);
        const index = this.particles.length,
            quadIndex =
                CLOUD_SLICES_FOR_PARTICLES[
                    MathHelper.randomRange(0, CLOUD_SLICES_FOR_PARTICLES.length - 1)
                ],
            textureQuad = this.imageGrid.rects[quadIndex],
            vertexQuad = new Rectangle(0, 0, 0, 0);
        this.drawer.setTextureQuad(index, textureQuad, vertexQuad, 1);
        const sizeMultiplier = this.size + MathHelper.randomMinus1to1() * this.sizeVar;
        particle.width = textureQuad.w * sizeMultiplier;
        particle.height = textureQuad.h * sizeMultiplier;
        particle.deltaColor.r = 0;
        particle.deltaColor.g = 0;
        particle.deltaColor.b = 0;
        particle.deltaColor.a = 0;
    },
    update: function (delta) {
        this._super(delta);
        const fadeThreshold = 0.7 * this.life,
            endColor = this.endColor,
            startColor = this.startColor;
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (particle.life > 0) {
                if (particle.life < fadeThreshold) {
                    particle.deltaColor.r = (endColor.r - startColor.r) / fadeThreshold;
                    particle.deltaColor.g = (endColor.g - startColor.g) / fadeThreshold;
                    particle.deltaColor.b = (endColor.b - startColor.b) / fadeThreshold;
                    particle.deltaColor.a = (endColor.a - startColor.a) / fadeThreshold;
                }
                particle.dir.multiply(0.83);
                particle.width *= 1.015;
                particle.height *= 1.015;
            }
        }
    },
});
export default GhostMorphingParticles;
