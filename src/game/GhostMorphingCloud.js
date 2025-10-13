import MultiParticles from "@/visual/MultiParticles";
import ResourceMgr from "@/resources/ResourceMgr";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";
import RGBAColor from "@/core/RGBAColor";
import { getGhostCloudSlice, getGhostTexture } from "@/game/GhostAssets";
const GhostMorphingCloud = MultiParticles.extend({
    init: function () {
        const texture = ResourceMgr.getTexture(getGhostTexture());
        this._super(5, texture);
        this.angle = MathHelper.randomRange(0, 360);
        this.size = 1.6;
        this.angleVar = 360;
        this.life = 0.5;
        this.duration = 1.5;
        this.speed = 30;
        this.startColor = RGBAColor.solidOpaque.copy();
        this.endColor = RGBAColor.transparent.copy();
    },
    initParticle: function (particle) {
        this.angle += 360 / this.totalParticles;
        this._super(particle);
        const index = this.particles.length,
            quadIndex = getGhostCloudSlice(MathHelper.randomRange(2, 4)),
            textureQuad = this.imageGrid.rects[quadIndex],
            vertexQuad = new Rectangle(0, 0, 0, 0);
        this.drawer.setTextureQuad(index, textureQuad, vertexQuad, 1);
        particle.width = textureQuad.w * this.size;
        particle.height = textureQuad.h * this.size;
        particle.deltaColor.r = 0;
        particle.deltaColor.g = 0;
        particle.deltaColor.b = 0;
        particle.deltaColor.a = 0;
    },
    update: function (delta) {
        this._super(delta);
        const growDuration = 0.2 * this.life,
            shrinkDuration = growDuration,
            endColor = this.endColor,
            startColor = this.startColor;
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (particle.life > 0) {
                if (particle.life > this.life - growDuration) {
                    particle.width *= 1.025;
                    particle.height *= 1.025;
                } else {
                    particle.deltaColor.r = (endColor.r - startColor.r) / shrinkDuration;
                    particle.deltaColor.g = (endColor.g - startColor.g) / shrinkDuration;
                    particle.deltaColor.b = (endColor.b - startColor.b) / shrinkDuration;
                    particle.deltaColor.a = (endColor.a - startColor.a) / shrinkDuration;
                    particle.width *= 0.98;
                    particle.height *= 0.98;
                }
            }
        }
    },
    startSystem: function () {
        this._super(5);
    },
});
export default GhostMorphingCloud;
